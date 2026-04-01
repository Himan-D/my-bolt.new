import { useStore } from '@nanostores/react';
import { chatStore } from '~/lib/stores/chat';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { useState } from 'react';
import { Settings } from '~/components/settings/Settings.client';

export function Header() {
  const chat = useStore(chatStore);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="flex items-center bg-bolt-elements-background-depth-1 border-b border-bolt-elements-borderColor h-[var(--header-height)] px-5 py-2.5 w-full gap-4">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 shrink-0 select-none" aria-label="Hima home">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 shadow-sm">
          <div className="i-ph:lightning-fill text-white text-base" />
        </div>
        <span className="text-xl font-bold leading-none bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
          Hima
        </span>
      </a>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {chat.started && (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 transition-all text-sm font-medium shadow-sm"
          >
            <div className="i-ph:rocket-launch-bold text-sm" />
            Publish
          </button>
        )}
        <button
          onClick={() => setIsSettingsOpen(true)}
          title="Settings"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2 transition-colors"
        >
          <div className="i-ph:gear text-lg" />
        </button>
        {chat.started && <HeaderActionButtons />}
      </div>

      <Settings open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
}
