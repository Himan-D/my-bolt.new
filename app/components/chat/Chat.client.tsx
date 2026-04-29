import { useStore } from '@nanostores/react';
import type { Message } from 'ai';
import { useChat } from 'ai/react';
import { useAnimate } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import { cssTransition, toast, ToastContainer } from 'react-toastify';
import { useMessageParser, usePromptEnhancer, useShortcuts, useSnapScroll } from '~/lib/hooks';
import { useChatHistory } from '~/lib/persistence';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { providersStore, selectedProviderStore, selectedModelStore } from '~/lib/stores/providers';
import { fileModificationsToHTML } from '~/utils/diff';
import { cubicEasingFn } from '~/utils/easings';
import { createScopedLogger, renderLogger } from '~/utils/logger';
import { BaseChat } from './BaseChat';
import { extractTextFromPDF } from '~/utils/pdf';

const toastAnimation = cssTransition({
  enter: 'animated fadeInRight',
  exit: 'animated fadeOutRight',
});

const logger = createScopedLogger('Chat');

export function Chat() {
  renderLogger.trace('Chat');

  const { ready, initialMessages, storeMessageHistory } = useChatHistory();

  return (
    <>
      {ready && <ChatImpl initialMessages={initialMessages} storeMessageHistory={storeMessageHistory} />}
      <ToastContainer
        closeButton={({ closeToast }) => {
          return (
            <button className="Toastify__close-button" onClick={closeToast}>
              <div className="i-ph:x text-lg" />
            </button>
          );
        }}
        icon={({ type }) => {
          switch (type) {
            case 'success': {
              return <div className="i-ph:check-bold text-bolt-elements-icon-success text-2xl" />;
            }
            case 'error': {
              return <div className="i-ph:warning-circle-bold text-bolt-elements-icon-error text-2xl" />;
            }
          }

          return undefined;
        }}
        position="bottom-right"
        pauseOnFocusLoss
        transition={toastAnimation}
      />
    </>
  );
}

interface ChatProps {
  initialMessages: Message[];
  storeMessageHistory: (messages: Message[]) => Promise<void>;
}

export const ChatImpl = memo(({ initialMessages, storeMessageHistory }: ChatProps) => {
  useShortcuts();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [chatStarted, setChatStarted] = useState(initialMessages.length > 0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { showChat } = useStore(chatStore);
  const selectedProvider = useStore(selectedProviderStore);
  const selectedModel = useStore(selectedModelStore);
  const allProviders = useStore(providersStore);

  const [animationScope, animate] = useAnimate();

  // get the API key for the selected provider
  const currentProviderConfig = allProviders.find((p) => p.name === selectedProvider);
  const currentApiKey = currentProviderConfig?.apiKey || '';

  const { messages, isLoading, input, handleInputChange, setInput, stop, append } = useChat({
    api: '/api/chat',
    body: {
      provider: selectedProvider,
      model: selectedModel,
      apiKey: currentApiKey || undefined,
    },
    onError: (error) => {
      logger.error('Request failed\n\n', error);

      let errorMessage = 'There was an error processing your request';

      if (error.message) {
        try {
          const errorData = JSON.parse(error.message);

          if (errorData.error?.includes('invalid x-api-key') || errorData.data?.error?.message?.includes('x-api-key')) {
            errorMessage = 'Invalid API Key. Please check your .env.local, .dev.vars, or settings.';
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          if (error.message.includes('401')) {
            errorMessage = 'Invalid API Key (401). Please check your credentials.';
          } else {
            errorMessage = error.message;
          }
        }
      }

      toast.error(errorMessage);
    },
    onFinish: () => {
      logger.debug('Finished streaming');
    },
    initialMessages,
  });

  const { enhancingPrompt, promptEnhanced, enhancePrompt, resetEnhancer } = usePromptEnhancer();
  const { parsedMessages, parseMessages } = useMessageParser();

  const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

  useEffect(() => {
    chatStore.setKey('started', initialMessages.length > 0);

    // Force OpenAI as default provider to avoid Anthropic API errors
    if (selectedProvider === 'Anthropic') {
      selectedProviderStore.set('OpenAI');
      selectedModelStore.set('gpt-4o');
    }
  }, [selectedProvider]);

  useEffect(() => {
    parseMessages(messages, isLoading);

    if (messages.length > initialMessages.length) {
      storeMessageHistory(messages).catch((error) => toast.error(error.message));
    }
  }, [messages, isLoading, parseMessages]);

  const scrollTextArea = () => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  };

  const abort = () => {
    stop();
    chatStore.setKey('aborted', true);
    workbenchStore.abortAllActions();
  };

  useEffect(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = 'auto';

      const scrollHeight = textarea.scrollHeight;

      textarea.style.height = `${Math.min(scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
      textarea.style.overflowY = scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
    }
  }, [input, textareaRef]);

  const runAnimation = async () => {
    if (chatStarted) {
      return;
    }

    await Promise.all([
      animate('#examples', { opacity: 0, display: 'none' }, { duration: 0.1 }),
      animate('#intro', { opacity: 0, flex: 1 }, { duration: 0.2, ease: cubicEasingFn }),
    ]);

    chatStore.setKey('started', true);

    setChatStarted(true);
  };

  const onFileUpload = (file: File) => {
    if (uploadedFiles.some((f) => f.name === file.name)) {
      toast.info('File already attached');
      return;
    }

    setUploadedFiles((prev) => [...prev, file]);
  };

  const onRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (_event: React.UIEvent, messageInput?: string) => {
    const _input = messageInput || input;

    if (!(_input.trim().length > 0 || uploadedFiles.length > 0) || isLoading) {
      return;
    }

    if (selectedProvider !== 'Anthropic' && !currentApiKey) {
      toast.error('Please set your API key in settings');
      return;
    }

    await workbenchStore.saveAllFiles();

    const fileModifications = workbenchStore.getFileModifcations();

    chatStore.setKey('aborted', false);

    runAnimation();

    let fileContentPrompt = '';
    const imageDataParts: Array<{ type: 'image'; image: string; mimeType: string; name: string }> = [];

    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        if (file.type === 'application/pdf') {
          const content = await extractTextFromPDF(file);
          fileContentPrompt += `\n\nFile: ${file.name}\nContent:\n${content}`;
        } else if (file.type.startsWith('image/')) {
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';

          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }

          const base64 = btoa(binary);
          imageDataParts.push({ type: 'image', image: base64, mimeType: file.type, name: file.name });
        } else {
          const content = await file.text();
          fileContentPrompt += `\n\nFile: ${file.name}\nContent:\n${content}`;
        }
      }
    }

    const fullInput = _input + fileContentPrompt;

    const imageCaption =
      imageDataParts.length > 0
        ? `\n\n[${imageDataParts.length} image${imageDataParts.length > 1 ? 's' : ''} attached: ${imageDataParts.map((p) => p.name).join(', ')}]`
        : '';

    if (fileModifications !== undefined) {
      const diff = fileModificationsToHTML(fileModifications);

      append({ role: 'user', content: `${diff}\n\n${fullInput}${imageCaption}` });

      workbenchStore.resetAllFileModifications();
    } else {
      append({ role: 'user', content: `${fullInput}${imageCaption}` });
    }

    setInput('');
    setUploadedFiles([]);

    resetEnhancer();

    textareaRef.current?.blur();
  };

  const [messageRef, scrollRef] = useSnapScroll();

  return (
    <BaseChat
      ref={animationScope}
      textareaRef={textareaRef}
      input={input}
      showChat={showChat}
      chatStarted={chatStarted}
      isStreaming={isLoading}
      enhancingPrompt={enhancingPrompt}
      promptEnhanced={promptEnhanced}
      sendMessage={sendMessage}
      messageRef={messageRef}
      scrollRef={scrollRef}
      handleInputChange={handleInputChange}
      handleStop={abort}
      onFileUpload={onFileUpload}
      uploadedFiles={uploadedFiles}
      onRemoveFile={onRemoveFile}
      messages={messages.map((message, i) => {
        if (message.role === 'user') {
          return message;
        }

        return {
          ...message,
          content: parsedMessages[i] || '',
        };
      })}
      enhancePrompt={() => {
        enhancePrompt(input, (input) => {
          setInput(input);
          scrollTextArea();
        });
      }}
    />
  );
});
