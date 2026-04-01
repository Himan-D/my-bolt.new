import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { getModel, type ProviderName } from '~/lib/.server/llm/providers';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

export interface ModelConfig {
  provider?: ProviderName;
  modelId?: string;
  apiKey?: string;
}

const MEMORY_COMPACTION_TRIGGER_CHARS = 40_000;
const MEMORY_COMPACTION_KEEP_RECENT_MESSAGES = 16;
const MEMORY_COMPACTION_SUMMARY_MAX_CHARS = 8_000;

function estimateConversationSize(messages: Messages) {
  return messages.reduce((total, message) => total + message.content.length, 0);
}

function compactMessages(messages: Messages): Messages {
  const totalChars = estimateConversationSize(messages);

  if (messages.length <= MEMORY_COMPACTION_KEEP_RECENT_MESSAGES || totalChars <= MEMORY_COMPACTION_TRIGGER_CHARS) {
    return messages;
  }

  const splitIndex = Math.max(1, messages.length - MEMORY_COMPACTION_KEEP_RECENT_MESSAGES);
  const olderMessages = messages.slice(0, splitIndex);
  const recentMessages = messages.slice(splitIndex);

  // Extract key decisions, file paths, and goals from older messages
  const summaryChunks: string[] = [];
  let summaryLength = 0;

  for (const message of olderMessages) {
    const normalized = message.content.replace(/\s+/g, ' ').trim();

    // Prioritize higher-signal content: shorter budget for assistant code blocks
    const hasCode = normalized.includes('<boltAction') || normalized.includes('```');
    const maxChars = hasCode ? 200 : 400;
    const clipped = normalized.length > maxChars ? `${normalized.slice(0, maxChars)}...` : normalized;
    const line = `- ${message.role}: ${clipped}`;

    if (summaryLength + line.length > MEMORY_COMPACTION_SUMMARY_MAX_CHARS) {
      summaryChunks.push('- ...additional earlier context omitted');
      break;
    }

    summaryChunks.push(line);
    summaryLength += line.length;
  }

  const summaryMessage: Message = {
    role: 'assistant',
    content: [
      'Compacted conversation history (earlier turns summarized for context efficiency):',
      ...summaryChunks,
      '',
      'Prioritize the most recent messages. Use summary only for historical decisions and constraints.',
    ].join('\n'),
  };

  return [summaryMessage, ...recentMessages];
}

export function streamText(messages: Messages, env: Env, options?: StreamingOptions, modelConfig?: ModelConfig) {
  let model;
  let provider: ProviderName = 'Anthropic';

  if (modelConfig?.provider && modelConfig?.apiKey && modelConfig?.modelId) {
    model = getModel(modelConfig.provider, modelConfig.apiKey, modelConfig.modelId);
    provider = modelConfig.provider;
  } else {
    // Try to use any available provider key
    const keyResult = getAPIKey(env);
    
    if (!keyResult) {
      throw new Error(
        'No API key found. Please set one of: ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY, or OPENROUTER_API_KEY in your .env.local or .dev.vars',
      );
    }
    
    // If keyResult is a string, use Anthropic as default
    const apiKey = typeof keyResult === 'string' ? keyResult : keyResult.key;
    provider = typeof keyResult === 'string' ? 'Anthropic' : keyResult.provider;
    
    // Use provider-specific default models
    const defaultModels: Record<ProviderName, string> = {
      Anthropic: 'claude-3-7-sonnet-20250219',
      OpenAI: 'gpt-4o',
      Google: 'gemini-2.5-pro-preview-03-25',
      OpenRouter: 'anthropic/claude-3.7-sonnet',
    };
    
    const modelId = defaultModels[provider];
    model = getModel(provider, apiKey, modelId);
  }

  const extraHeaders: Record<string, string> = {};

  if (provider === 'Anthropic') {
    // Enable extended output for all claude-3-5+ and claude-3-7 models
    extraHeaders['anthropic-beta'] = 'output-128k-2025-02-19';
  }

  if (provider === 'OpenRouter') {
    extraHeaders['HTTP-Referer'] = 'https://hima.local';
    extraHeaders['X-Title'] = 'Hima';
  }

  return _streamText({
    model,
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    headers: extraHeaders,
    messages: convertToCoreMessages(compactMessages(messages)),
    ...options,
  });
}
