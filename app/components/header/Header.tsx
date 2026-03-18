import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { Settings } from '~/components/settings/Settings.client';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/remix';

export function Header() {
  const chat = useStore(chatStore);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header
      className={classNames(
        'flex items-center bg-bolt-elements-background-depth-1 p-5 border-b h-[var(--header-height)]',
        {
          'border-transparent': !chat.started,
          'border-bolt-elements-borderColor': chat.started,
        },
      )}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <div className="i-ph:sidebar-simple-duotone text-xl" />
        <a href="/" className="text-2xl font-semibold text-accent flex items-center">
          Hima
        </a>
      </div>
      <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
        <ClientOnly>{() => <ChatDescription />}</ClientOnly>
      </span>
      <div className="flex items-center gap-2">
        <ClientOnly>
          {() => (
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary transition-colors p-1.5 rounded-md hover:bg-bolt-elements-background-depth-2"
              title="Settings"
            >
              <div className="i-ph:gear text-xl" />
            </button>
          )}
        </ClientOnly>
        {chat.started && (
          <ClientOnly>
            {() => (
              <div className="mr-1">
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        )}
        <div className="ml-1 flex items-center">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
      <ClientOnly>{() => <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />}</ClientOnly>
    </header>
  );
}
