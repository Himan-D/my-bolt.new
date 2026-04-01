import { env } from 'node:process';
import type { ProviderName } from '~/lib/.server/llm/providers';

export type APIKeyResult = string | { key: string; provider: ProviderName } | null;

export function getAPIKey(cloudflareEnv: Env, provider?: ProviderName): APIKeyResult {
  /**
   * The `cloudflareEnv` is only used when deployed or when previewing locally.
   * In development the environment variables are available through `env`.
   */
  
  // Provider-specific key retrieval
  if (provider === 'Anthropic') {
    const processKey = env.ANTHROPIC_API_KEY;
    const cloudflareKey = cloudflareEnv?.ANTHROPIC_API_KEY;
    const key = (processKey || cloudflareKey)?.trim();

    return key || null;
  }

  if (provider === 'OpenAI') {
    const processKey = env.OPENAI_API_KEY;
    const cloudflareKey = cloudflareEnv?.OPENAI_API_KEY;
    const key = (processKey || cloudflareKey)?.trim();

    return key || null;
  }

  if (provider === 'Google') {
    const processKey = env.GOOGLE_API_KEY;
    const cloudflareKey = cloudflareEnv?.GOOGLE_API_KEY;
    const key = (processKey || cloudflareKey)?.trim();

    return key || null;
  }

  if (provider === 'OpenRouter') {
    const processKey = env.OPENROUTER_API_KEY;
    const cloudflareKey = cloudflareEnv?.OPENROUTER_API_KEY;
    const key = (processKey || cloudflareKey)?.trim();

    return key || null;
  }

  // Fallback: Try to find any available key in priority order
  const providers: ProviderName[] = ['OpenRouter', 'Anthropic', 'OpenAI', 'Google'];
  for (const prov of providers) {
    const keyResult = getAPIKey(cloudflareEnv, prov);
    if (keyResult && typeof keyResult === 'string') {
      return { key: keyResult, provider: prov };
    }
  }

  return null;
}
