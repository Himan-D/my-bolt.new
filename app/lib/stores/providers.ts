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
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4 (6)' },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
    ],
  },
  {
    name: 'OpenAI',
    apiKey: '',
    enabled: false,
    models: [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
  },
  {
    name: 'Google',
    apiKey: '',
    enabled: false,
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    ],
  },
];

export const providersStore = atom<ProviderInfo[]>(DEFAULT_PROVIDERS);
export const selectedProviderStore = atom<string>('Anthropic');
export const selectedModelStore = atom<string>('claude-sonnet-4-6');

export function getDefaultProviders() {
  return DEFAULT_PROVIDERS;
}
