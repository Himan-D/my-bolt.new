import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { getAnthropicModel } from '~/lib/.server/llm/model';
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

export function streamText(messages: Messages, env: Env, options?: StreamingOptions, modelConfig?: ModelConfig) {
  let model;

  if (modelConfig?.provider && modelConfig?.apiKey && modelConfig?.modelId) {
    model = getModel(modelConfig.provider, modelConfig.apiKey, modelConfig.modelId);
  } else {
    // fallback to default Anthropic via env
    model = getAnthropicModel(getAPIKey(env));
  }

  const extraHeaders: Record<string, string> = {};

  if (!modelConfig?.provider || modelConfig.provider === 'Anthropic') {
    extraHeaders['anthropic-beta'] = 'max-tokens-3-5-sonnet-2024-07-15';
  }

  return _streamText({
    model,
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    headers: extraHeaders,
    messages: convertToCoreMessages(messages),
    ...options,
  });
}
