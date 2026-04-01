import { useState } from 'react';
import { createScopedLogger } from '~/utils/logger';
import { providersStore, selectedProviderStore, selectedModelStore } from '~/lib/stores/providers';

const logger = createScopedLogger('usePromptEnhancement');

export function usePromptEnhancer() {
  const [enhancingPrompt, setEnhancingPrompt] = useState(false);
  const [promptEnhanced, setPromptEnhanced] = useState(false);

  const resetEnhancer = () => {
    setEnhancingPrompt(false);
    setPromptEnhanced(false);
  };

  const enhancePrompt = async (input: string, setInput: (value: string) => void) => {
    setEnhancingPrompt(true);
    setPromptEnhanced(false);

    const selectedProvider = selectedProviderStore.get();
    const selectedModel = selectedModelStore.get();
    const allProviders = providersStore.get();
    const currentProvider = allProviders.find((p) => p.name === selectedProvider);
    const apiKey = currentProvider?.apiKey || '';

    const response = await fetch('/api/enhancer', {
      method: 'POST',
      body: JSON.stringify({
        message: input,
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKey || undefined,
      }),
    });

    const reader = response.body?.getReader();

    const originalInput = input;

    if (reader) {
      const decoder = new TextDecoder();

      let _input = '';
      let _error;

      try {
        setInput('');

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          _input += decoder.decode(value);

          logger.trace('Set input', _input);

          setInput(_input);
        }
      } catch (error) {
        _error = error;
      } finally {
        if (_error) {
          logger.error(_error);
          setInput(originalInput);
        }

        setEnhancingPrompt(false);
        setPromptEnhanced(true);

        if (!_error && _input) {
          setTimeout(() => {
            setInput(_input);
          });
        }
      }
    }
  };

  return { enhancingPrompt, promptEnhanced, enhancePrompt, resetEnhancer };
}
