import { WebContainer } from '@webcontainer/api';
import { map, type MapStore } from 'nanostores';
import { normalize, isAbsolute, dirname } from '~/utils/path';
import type { BoltAction } from '~/types/actions';
import { createScopedLogger } from '~/utils/logger';
import { unreachable } from '~/utils/unreachable';
import type { ActionCallbackData } from './message-parser';

const logger = createScopedLogger('ActionRunner');

const OPEN_SHELL_ALLOWED_HOSTS = new Set([
  'registry.npmjs.org',
  'api.github.com',
  'github.com',
  'api.openai.com',
  'api.anthropic.com',
  'openrouter.ai',
  'generativelanguage.googleapis.com',
]);

const BLOCKED_SHELL_PATTERNS: RegExp[] = [
  /(^|\s)sudo(\s|$)/i,
  /(^|\s)su(\s|$)/i,
  /rm\s+-rf\s+\//i,
  /mkfs\./i,
  /dd\s+if=/i,
  /chmod\s+777\s+\//i,
  /\bcurl\b[^\n]*\|[^\n]*\bsh\b/i,
  /\bwget\b[^\n]*\|[^\n]*\bsh\b/i,
];

function extractHostsFromCommand(command: string) {
  const hosts: string[] = [];
  const urlPattern = /https?:\/\/([^\s/"']+)/gi;

  let match = urlPattern.exec(command);

  while (match) {
    hosts.push(match[1].toLowerCase());
    match = urlPattern.exec(command);
  }

  return hosts;
}

function validateShellCommand(command: string): string | null {
  for (const pattern of BLOCKED_SHELL_PATTERNS) {
    if (pattern.test(command)) {
      return `Blocked by sandbox policy: command matches restricted pattern (${pattern})`;
    }
  }

  const hosts = extractHostsFromCommand(command);

  for (const host of hosts) {
    if (!OPEN_SHELL_ALLOWED_HOSTS.has(host)) {
      return `Blocked by sandbox policy: outbound host '${host}' is not allowlisted`;
    }
  }

  return null;
}

function validateFilePath(filePath: string): string | null {
  const normalized = normalize(filePath);

  if (isAbsolute(normalized)) {
    return `Blocked by sandbox policy: absolute paths are not allowed (${filePath})`;
  }

  if (normalized.startsWith('../') || normalized.includes('/../') || normalized === '..') {
    return `Blocked by sandbox policy: parent directory traversal is not allowed (${filePath})`;
  }

  return null;
}

export type ActionStatus = 'pending' | 'running' | 'complete' | 'aborted' | 'failed';

export type BaseActionState = BoltAction & {
  status: Exclude<ActionStatus, 'failed'>;
  abort: () => void;
  executed: boolean;
  abortSignal: AbortSignal;
};

export type FailedActionState = BoltAction &
  Omit<BaseActionState, 'status'> & {
    status: Extract<ActionStatus, 'failed'>;
    error: string;
  };

export type ActionState = BaseActionState | FailedActionState;

type BaseActionUpdate = Partial<Pick<BaseActionState, 'status' | 'abort' | 'executed'>>;

export type ActionStateUpdate =
  | BaseActionUpdate
  | (Omit<BaseActionUpdate, 'status'> & { status: 'failed'; error: string });

type ActionsMap = MapStore<Record<string, ActionState>>;

export class ActionRunner {
  #webcontainer: Promise<WebContainer>;
  #currentExecutionPromise: Promise<void> = Promise.resolve();

  actions: ActionsMap = map({});

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;
  }

  addAction(data: ActionCallbackData) {
    const { actionId } = data;

    const actions = this.actions.get();
    const action = actions[actionId];

    if (action) {
      // action already added
      return;
    }

    const abortController = new AbortController();

    this.actions.setKey(actionId, {
      ...data.action,
      status: 'pending',
      executed: false,
      abort: () => {
        abortController.abort();
        this.#updateAction(actionId, { status: 'aborted' });
      },
      abortSignal: abortController.signal,
    });

    this.#currentExecutionPromise.then(() => {
      this.#updateAction(actionId, { status: 'running' });
    });
  }

  async runAction(data: ActionCallbackData) {
    const { actionId } = data;
    const action = this.actions.get()[actionId];

    if (!action) {
      unreachable(`Action ${actionId} not found`);
    }

    if (action.executed) {
      return;
    }

    this.#updateAction(actionId, { ...action, ...data.action, executed: true });

    this.#currentExecutionPromise = this.#currentExecutionPromise
      .then(() => {
        return this.#executeAction(actionId);
      })
      .catch((error) => {
        console.error('Action failed:', error);
      });
  }

  async #executeAction(actionId: string) {
    const action = this.actions.get()[actionId];

    this.#updateAction(actionId, { status: 'running' });

    try {
      if (action.type === 'shell') {
        const commandError = validateShellCommand(action.content);

        if (commandError) {
          throw new Error(commandError);
        }
      }

      if (action.type === 'file') {
        const fileError = validateFilePath(action.filePath);

        if (fileError) {
          throw new Error(fileError);
        }
      }

      switch (action.type) {
        case 'shell': {
          await this.#runShellAction(action);
          break;
        }
        case 'file': {
          await this.#runFileAction(action);
          break;
        }
      }

      this.#updateAction(actionId, { status: action.abortSignal.aborted ? 'aborted' : 'complete' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed';
      this.#updateAction(actionId, { status: 'failed', error: message });

      // re-throw the error to be caught in the promise chain
      throw error;
    }
  }

  async #runShellAction(action: ActionState) {
    if (action.type !== 'shell') {
      unreachable('Expected shell action');
    }

    const webcontainer = await this.#webcontainer;

    const process = await webcontainer.spawn('/bin/jsh', ['-c', action.content], {
      env: { npm_config_yes: true },
    });

    action.abortSignal.addEventListener('abort', () => {
      process.kill();
    });

    process.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      }),
    );

    const exitCode = await process.exit;

    logger.debug(`Process terminated with code ${exitCode}`);
  }

  async #runFileAction(action: ActionState) {
    if (action.type !== 'file') {
      unreachable('Expected file action');
    }

    const webcontainer = await this.#webcontainer;

    let folder = dirname(action.filePath);

    // remove trailing slashes
    folder = folder.replace(/\/+$/g, '');

    if (folder !== '.') {
      try {
        await webcontainer.fs.mkdir(folder, { recursive: true });
        logger.debug('Created folder', folder);
      } catch (error) {
        logger.error('Failed to create folder\n\n', error);
      }
    }

    try {
      await webcontainer.fs.writeFile(action.filePath, action.content);
      logger.debug(`File written ${action.filePath}`);
    } catch (error) {
      logger.error('Failed to write file\n\n', error);
    }
  }

  #updateAction(id: string, newState: ActionStateUpdate) {
    const actions = this.actions.get();

    this.actions.setKey(id, { ...actions[id], ...newState });
  }
}
