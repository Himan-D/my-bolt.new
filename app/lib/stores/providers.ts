import { atom } from 'nanostores';

export interface ProviderInfo {
  name: string;
  apiKey: string;
  enabled: boolean;
  models: { id: string; label: string }[];
}

function getEnvApiKeys() {
  if (typeof window === 'undefined') {
    return {
      OpenAI: '',
      Anthropic: '',
      Google: '',
      OpenRouter: '',
    };
  }

  return {
    OpenAI: (window as any).ENV?.OPENAI_API_KEY || '',
    Anthropic: (window as any).ENV?.ANTHROPIC_API_KEY || '',
    Google: (window as any).ENV?.GOOGLE_API_KEY || '',
    OpenRouter: (window as any).ENV?.OPENROUTER_API_KEY || '',
  };
}

const DEFAULT_PROVIDERS: ProviderInfo[] = [
  {
    name: 'OpenAI',
    apiKey: '',
    enabled: true,
    models: [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'o1', label: 'o1' },
      { id: 'o1-mini', label: 'o1 Mini' },
      { id: 'o3-mini', label: 'o3 Mini' },
    ],
  },
  {
    name: 'Anthropic',
    apiKey: '',
    enabled: false,
    models: [
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
      { id: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
      { id: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' },
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
    ],
  },
  {
    name: 'Google',
    apiKey: '',
    enabled: false,
    models: [
      { id: 'gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      { id: 'gemini-pro', label: 'Gemini Pro' },
    ],
  },
  {
    name: 'OpenRouter',
    apiKey: '',
    enabled: false,
    models: [
      { id: 'anthropic/claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
      { id: 'anthropic/claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' },
      { id: 'openai/gpt-4o', label: 'GPT-4o' },
      { id: 'openai/o3-mini', label: 'o3 Mini' },
      { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
      { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' },
      { id: 'deepseek/deepseek-r1', label: 'DeepSeek R1' },
    ],
  },
];

export const providersStore = atom<ProviderInfo[]>(DEFAULT_PROVIDERS);
export const selectedProviderStore = atom<string>('OpenAI');
export const selectedModelStore = atom<string>('gpt-4o');

export function initializeProvidersFromEnv() {
  const envKeys = getEnvApiKeys();

  const updated = DEFAULT_PROVIDERS.map((provider) => {
    const envKey = envKeys[provider.name as keyof typeof envKeys];
    if (envKey) {
      return {
        ...provider,
        apiKey: envKey,
        enabled: true,
      };
    }
    return provider;
  });

  providersStore.set(updated);

  const enabledProvider = updated.find((p) => p.enabled);
  if (enabledProvider) {
    selectedProviderStore.set(enabledProvider.name);
    selectedModelStore.set(enabledProvider.models[0]?.id || '');
  }
}

export function getDefaultProviders() {
  return DEFAULT_PROVIDERS;
}
