import type { Message } from 'ai';
import React, { type RefCallback } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { IconButton } from '~/components/ui/IconButton';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';

import styles from './BaseChat.module.scss';

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  onFileUpload?: (file: File) => void;
  uploadedFiles?: File[];
  onRemoveFile?: (index: number) => void;
}

const EXAMPLE_PROMPTS = [
  { text: 'Full-stack SaaS with Supabase + Clerk', icon: 'i-ph:rocket-launch-duotone' },
  { text: 'AI chatbot with streaming responses', icon: 'i-ph:robot-duotone' },
  { text: 'Dashboard with real-time charts', icon: 'i-ph:chart-line-up-duotone' },
  { text: 'Auth flow with Supabase + RLS', icon: 'i-ph:lock-key-duotone' },
  { text: 'REST API with Hono + Zod validation', icon: 'i-ph:cloud-arrow-up-duotone' },
  { text: 'Mobile-first e-commerce storefront', icon: 'i-ph:shopping-bag-duotone' },
];

const TEXTAREA_MIN_HEIGHT = 76;

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      enhancingPrompt = false,
      promptEnhanced = false,
      messages,
      input = '',
      sendMessage,
      handleInputChange,
      enhancePrompt,
      handleStop,
      onFileUpload,
      uploadedFiles = [],
      onRemoveFile,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    return (
      <div
        ref={ref}
        className={classNames(
          styles.BaseChat,
          'relative flex h-full w-full overflow-hidden bg-bolt-elements-background-depth-1',
        )}
        data-chat-visible={showChat}
      >
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <div ref={scrollRef} className="flex overflow-y-auto w-full h-full">
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow min-w-[var(--chat-min-width)] h-full')}>
            {!chatStarted && (
              <div id="intro" className="mt-[18vh] max-w-chat mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent text-xs font-medium mb-6 animate-fade-in">
                  <div className="i-ph:sparkle-duotone text-sm" />
                  AI-powered full-stack development
                </div>
                <h1 className="text-5xl sm:text-6xl font-extrabold text-bolt-elements-textPrimary mb-4 animate-fade-in leading-tight">
                  What do you want{' '}
                  <span className="bg-gradient-to-r from-violet-600 to-purple-400 bg-clip-text text-transparent">
                    to build?
                  </span>
                </h1>
                <p className="mb-2 text-lg text-bolt-elements-textSecondary animate-fade-in-delayed max-w-xl mx-auto">
                  Describe your idea and Hima will scaffold, code, and run it — right in the browser.
                </p>
              </div>
            )}
            <div
              className={classNames('pt-6 px-6', {
                'h-full flex flex-col': chatStarted,
              })}
            >
              <ClientOnly>
                {() => {
                  return chatStarted ? (
                    <Messages
                      ref={messageRef}
                      className="flex flex-col w-full flex-1 max-w-chat px-4 pb-6 mx-auto z-1"
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null;
                }}
              </ClientOnly>
              <div
                className={classNames('relative w-full max-w-chat mx-auto z-prompt', {
                  'sticky bottom-0': chatStarted,
                })}
              >
                <div
                  className={classNames(
                    'shadow-[0_8px_32px_rgba(139,92,246,0.12)] border border-bolt-elements-borderColor bg-bolt-elements-prompt-background backdrop-filter backdrop-blur-[12px] rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[0_8px_40px_rgba(139,92,246,0.2)] hover:border-accent-300',
                  )}
                >
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-2 py-1 bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor rounded-md text-xs text-bolt-elements-textPrimary animate-fade-in"
                        >
                          <div
                            className={classNames(
                              file.type === 'application/pdf'
                                ? 'i-ph:file-pdf-duotone'
                                : file.type.startsWith('image/')
                                  ? 'i-ph:image-duotone'
                                  : 'i-ph:file-text-duotone',
                              'text-lg',
                            )}
                          />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            onClick={() => onRemoveFile?.(index)}
                            className="text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary transition-colors ml-1"
                          >
                            <div className="i-ph:x-circle-fill text-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    className={`w-full pl-5 pt-5 pr-16 focus:outline-none resize-none text-base text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent leading-relaxed`}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        if (event.shiftKey) {
                          return;
                        }

                        event.preventDefault();

                        sendMessage?.(event);
                      }
                    }}
                    value={input}
                    onChange={(event) => {
                      handleInputChange?.(event);
                    }}
                    style={{
                      minHeight: TEXTAREA_MIN_HEIGHT,
                      maxHeight: TEXTAREA_MAX_HEIGHT,
                    }}
                    placeholder="How can Hima help you today?"
                    translate="no"
                  />
                  <ClientOnly>
                    {() => (
                      <SendButton
                        show={input.length > 0 || isStreaming || uploadedFiles.length > 0}
                        isStreaming={isStreaming}
                        onClick={(event) => {
                          if (isStreaming) {
                            handleStop?.();
                            return;
                          }

                          sendMessage?.(event);
                        }}
                      />
                    )}
                  </ClientOnly>
                  <div className="flex justify-between text-sm p-4 pt-2">
                    <div className="flex gap-1 items-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;

                          if (files) {
                            Array.from(files).forEach((file) => onFileUpload?.(file));
                            e.target.value = '';
                          }
                        }}
                        accept=".pdf,.txt,.md,.js,.ts,.tsx,.jsx,.json,.yaml,.yml,.csv,image/*"
                        multiple
                      />
                      <IconButton
                        title="Upload file"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isStreaming}
                      >
                        <div className="i-ph:paperclip text-xl" />
                      </IconButton>
                      <IconButton
                        title="Enhance prompt"
                        disabled={input.length === 0 || enhancingPrompt}
                        className={classNames({
                          'opacity-100!': enhancingPrompt,
                          'text-bolt-elements-item-contentAccent! pr-1.5 enabled:hover:bg-bolt-elements-item-backgroundAccent!':
                            promptEnhanced,
                        })}
                        onClick={() => enhancePrompt?.()}
                      >
                        {enhancingPrompt ? (
                          <>
                            <div className="i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress text-xl"></div>
                            <div className="ml-1.5">Enhancing prompt...</div>
                          </>
                        ) : (
                          <>
                            <div className="i-bolt:stars text-xl"></div>
                            {promptEnhanced && <div className="ml-1.5">Prompt enhanced</div>}
                          </>
                        )}
                      </IconButton>
                    </div>
                    {input.length > 3 ? (
                      <div className="text-xs text-bolt-elements-textTertiary">
                        Use <kbd className="kdb">Shift</kbd> + <kbd className="kdb">Return</kbd> for a new line
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="bg-bolt-elements-background-depth-1 pb-6">{/* Ghost Element */}</div>
              </div>
            </div>
            {!chatStarted && (
              <div id="examples" className="relative w-full max-w-2xl mx-auto mt-6 px-4">
                <p className="text-xs text-center text-bolt-elements-textTertiary mb-3 uppercase tracking-wide font-medium">
                  Try an example
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {EXAMPLE_PROMPTS.map((examplePrompt, index) => (
                    <button
                      key={index}
                      onClick={(event) => {
                        sendMessage?.(event, examplePrompt.text);
                      }}
                      className="group flex items-center gap-2 px-3.5 py-2 rounded-full border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 text-sm text-bolt-elements-textSecondary hover:border-accent-400 hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundAccent transition-all duration-150"
                    >
                      <div
                        className={`${examplePrompt.icon} text-base text-bolt-elements-textTertiary group-hover:text-bolt-elements-item-contentAccent transition-colors`}
                      />
                      {examplePrompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <ClientOnly>{() => <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />}</ClientOnly>
        </div>
      </div>
    );
  },
);
