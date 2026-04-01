import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export type ProviderName = 'Anthropic' | 'OpenAI' | 'Google' | 'OpenRouter';

export function getModel(provider: ProviderName, apiKey: string, modelId: string) {
  switch (provider) {
    case 'Anthropic': {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(modelId);
    }
    case 'OpenAI': {
      const openai = createOpenAI({ apiKey });
      return openai(modelId);
    }
    case 'Google': {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelId);
    }
    case 'OpenRouter': {
      // OpenRouter is compatible with OpenAI API format
      const openrouter = createOpenAI({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
      });
      return openrouter(modelId);
    }
    default: {
      throw new Error(`Unknown provider: ${provider}`);
    }
  }
}
