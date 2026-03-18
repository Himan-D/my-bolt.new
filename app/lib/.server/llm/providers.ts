import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export type ProviderName = 'Anthropic' | 'OpenAI' | 'Google';

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
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
