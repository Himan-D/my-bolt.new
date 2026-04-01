import { atom } from 'nanostores';

export interface ProviderInfo {
  name: string;
  apiKey: string;
  enabled: boolean;
  models: { id: string; label: string }[];
}

const DEFAULT_PROVIDERS: ProviderInfo[] = [
  {
    name: 'Anthropic',
    apiKey: '',
    enabled: true,
    models: [
      { id: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet' },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
      { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    ],
  },
  {
    name: 'OpenAI',
    apiKey: '',
    enabled: false,
    models: [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'o1', label: 'o1' },
      { id: 'o1-mini', label: 'o1 Mini' },
      { id: 'o3-mini', label: 'o3 Mini' },
    ],
  },
  {
    name: 'Google',
    apiKey: '',
    enabled: false,
    models: [
      { id: 'gemini-2.5-pro-preview-03-25', label: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
      { id: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro' },
    ],
  },
  {
    name: 'OpenRouter',
    apiKey: '',
    enabled: false,
    models: [
      { id: 'anthropic/claude-3.7-sonnet', label: 'Claude 3.7 Sonnet' },
      { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
      { id: 'openai/gpt-4o', label: 'GPT-4o' },
      { id: 'openai/o3-mini', label: 'o3 Mini' },
      { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
      { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' },
      { id: 'deepseek/deepseek-r1', label: 'DeepSeek R1' },
    ],
  },
];

export const providersStore = atom<ProviderInfo[]>(DEFAULT_PROVIDERS);
export const selectedProviderStore = atom<string>('Anthropic');
export const selectedModelStore = atom<string>('claude-3-7-sonnet-20250219');

export function getDefaultProviders() {
  return DEFAULT_PROVIDERS;
}
