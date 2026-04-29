import type { Message } from 'ai';
import React, { type RefCallback, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
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
  { text: 'Build a full-stack SaaS app', desc: 'React + Supabase + Auth' },
  { text: 'Create an AI chatbot', desc: 'Streaming responses' },
  { text: 'Make a dashboard', desc: 'Real-time charts' },
  { text: 'Build an API', desc: 'REST endpoints' },
];

const TEXTAREA_MIN_HEIGHT = 60;
const TEXTAREA_MAX_HEIGHT_MOBILE = 120;
const TEXTAREA_MAX_HEIGHT_DESKTOP = 200;

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
    const [isMobile] = useState(() => {
      if (typeof window === 'undefined') return false;
      return window.innerWidth < 640;
    });

    const textareaMaxHeight = isMobile ? TEXTAREA_MAX_HEIGHT_MOBILE : TEXTAREA_MAX_HEIGHT_DESKTOP;
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    return (
      <div
        ref={ref}
        className={classNames(styles.BaseChat, 'relative flex h-full w-full overflow-hidden bg-black')}
        data-chat-visible={showChat}
      >
        <ClientOnly fallback={<div className="h-14" />}>{() => <Menu />}</ClientOnly>

        <div ref={scrollRef} className="flex overflow-y-auto w-full h-full">
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow min-w-[var(--chat-min-width)] h-full')}>
            {/* Intro / Landing */}
            {!chatStarted && (
              <div id="intro" className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
                <div className="max-w-2xl w-full text-center">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-medium mb-8 animate-fade-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse" />
                    <span className="text-zinc-400">AI-powered full-stack development</span>
                  </div>

                  {/* Hero Title */}
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 animate-fade-in leading-tight">
                    <span className="text-white">What do you want </span>
                    <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                      to build?
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-base sm:text-lg text-zinc-500 mb-10 sm:mb-12 animate-fade-in-delayed max-w-lg mx-auto leading-relaxed">
                    Describe your idea and Hima will create a production-ready app — from database to deployment, right
                    in your browser.
                  </p>

                  {/* Example Prompt Cards */}
                  <div className="mt-8 sm:mt-12">
                    <p className="text-xs text-zinc-600 mb-4 uppercase tracking-widest font-medium">Try requesting</p>
                    <div className="grid grid-cols-2 gap-3">
                      {EXAMPLE_PROMPTS.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={(event) => sendMessage?.(event, prompt.text)}
                          className="group flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-violet-500/50 hover:bg-zinc-900 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10"
                        >
                          <span className="text-zinc-300 group-hover:text-white font-medium text-sm">
                            {prompt.text}
                          </span>
                          <span className="text-zinc-600 text-xs">{prompt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-6 sm:gap-8">
                    {[
                      { icon: '⚡', label: 'Instant deploy' },
                      { icon: '🔄', label: 'Real-time preview' },
                      { icon: '📦', label: 'One-click publish' },
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-zinc-500 text-sm">
                        <span>{feature.icon}</span>
                        <span>{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className={classNames('pt-4 sm:pt-6 px-3 sm:px-6', { 'h-full flex flex-col': chatStarted })}>
              <ClientOnly>
                {() =>
                  chatStarted ? (
                    <Messages
                      ref={messageRef}
                      className="flex flex-col w-full flex-1 max-w-chat px-2 sm:px-4 pb-4 sm:pb-6 mx-auto"
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null
                }
              </ClientOnly>

              {/* Input Area */}
              <div
                className={classNames('relative w-full max-w-chat mx-auto z-prompt', {
                  'sticky bottom-0': chatStarted,
                })}
              >
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-xl shadow-2xl overflow-hidden transition-all">
                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 border-b border-zinc-800">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 px-2 py-1 bg-zinc-900 rounded text-xs">
                          <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="truncate max-w-[120px] sm:max-w-[150px]">{file.name}</span>
                          <button onClick={() => onRemoveFile?.(index)} className="ml-1 hover:text-red-400">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Textarea */}
                  <textarea
                    ref={textareaRef}
                    className="w-full pl-5 pt-4 pr-14 pb-4 text-base text-white bg-transparent placeholder-zinc-600 focus:outline-none resize-none"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage?.(event);
                      }
                    }}
                    value={input}
                    onChange={handleInputChange}
                    style={{
                      minHeight: TEXTAREA_MIN_HEIGHT,
                      maxHeight: textareaMaxHeight,
                    }}
                    placeholder="Describe your app idea..."
                    translate="no"
                  />

                  {/* Send Button */}
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

                  {/* Actions */}
                  <div className="flex justify-between items-center px-4 pb-3 pt-1">
                    <div className="flex gap-2">
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
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isStreaming}
                        className="p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors disabled:opacity-50"
                        title="Upload file"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => enhancePrompt?.()}
                        disabled={input.length === 0 || enhancingPrompt}
                        className={classNames('p-2 rounded-xl transition-colors disabled:opacity-50', {
                          'text-violet-400': promptEnhanced,
                          'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900': !promptEnhanced,
                        })}
                        title="Enhance prompt"
                      >
                        {enhancingPrompt ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth={4}
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.99.84h4.433c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.433a1 1 0 00.99-.84l1.519-4.674z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {input.length > 3 && (
                      <span className="text-xs text-zinc-600 hidden sm:block">
                        <kbd className="px-1.5 py-0.5 bg-zinc-900 rounded text-xs">Shift</kbd> +{' '}
                        <kbd className="px-1.5 py-0.5 bg-zinc-900 rounded text-xs">Return</kbd> for new line
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-4 sm:h-6" />
              </div>
            </div>
          </div>

          {/* Workbench */}
          <ClientOnly fallback={<div />}>
            {() => <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />}
          </ClientOnly>
        </div>
      </div>
    );
  },
);
