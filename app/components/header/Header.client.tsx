import { useStore } from '@nanostores/react';
import { computed } from 'nanostores';
import { useState, useEffect } from 'react';
import { chatStore } from '~/lib/stores/chat';
import { cloudStore } from '~/lib/stores/cloud';
import { workbenchStore, type WorkbenchViewType } from '~/lib/stores/workbench';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { Settings } from '~/components/settings/Settings.client';

interface HeaderProps {
  currentView?: WorkbenchViewType;
  onViewChange?: (view: WorkbenchViewType) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const chat = useStore(chatStore);
  const cloud = useStore(cloudStore);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const hasProject = useStore(computed(workbenchStore.files, (files) => Object.keys(files).length > 0));
  const hasUnsaved = useStore(computed(workbenchStore.unsavedFiles, (unsaved) => Object.keys(unsaved).length > 0));

  const navLinks = [
    { href: '/projects', label: 'Projects', badge: 'NEW' },
    { href: '#templates', label: 'Templates' },
    { href: '#docs', label: 'Docs' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('hima-last-synced');
    if (saved) setLastSynced(saved);
  }, []);

  const handleGitHubPush = async () => {
    if (!cloud.githubToken) {
      setIsGitHubOpen(false);
      setIsSettingsOpen(true);
      return;
    }

    const repoName = window.prompt('Repository name:', cloud.githubRepo || 'hima-app');
    if (!repoName) return;

    setIsGitHubLoading(true);
    try {
      const result = await workbenchStore.publishToGithub(repoName);
      setLastSynced(new Date().toISOString());
      localStorage.setItem('hima-last-synced', new Date().toISOString());
      window.open(result.repoUrl, '_blank');
    } catch (error: any) {
      alert(error.message || 'Failed to push to GitHub');
    } finally {
      setIsGitHubLoading(false);
      setIsGitHubOpen(false);
    }
  };

  const handleGitHubPull = async () => {
    if (!cloud.githubToken) {
      setIsGitHubOpen(false);
      setIsSettingsOpen(true);
      return;
    }

    const repoName = window.prompt('Repository to pull:', cloud.githubRepo || 'hima-app');
    if (!repoName) return;

    setIsGitHubLoading(true);
    try {
      const result = await workbenchStore.syncFromGithub(repoName);
      setLastSynced(new Date().toISOString());
      localStorage.setItem('hima-last-synced', new Date().toISOString());
    } catch (error: any) {
      alert(error.message || 'Failed to pull from GitHub');
    } finally {
      setIsGitHubLoading(false);
      setIsGitHubOpen(false);
    }
  };

  const formatLastSynced = () => {
    if (!lastSynced) return null;
    const diff = Date.now() - new Date(lastSynced).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Hima home">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/25 group-hover:scale-105 group-hover:shadow-purple-500/40 transition-all">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight">Hima</span>
              <span className="text-[9px] -mt-0.5 text-zinc-500 font-semibold uppercase tracking-wider">
                AI Builder
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
                {link.badge && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-violet-500/20 text-violet-400 rounded-full">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Center Actions - Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            {/* GitHub Dropdown */}
            {chat.started && hasProject && (
              <div className="relative">
                <button
                  onClick={() => setIsGitHubOpen(!isGitHubOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  {/* Status Indicator */}
                  <span
                    className={`w-2 h-2 rounded-full ${hasUnsaved ? 'bg-amber-400 animate-pulse' : lastSynced ? 'bg-green-400' : 'bg-zinc-500'}`}
                  />
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.922.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* GitHub Dropdown Menu */}
                {isGitHubOpen && (
                  <div className="absolute right-0 mt-2 w-64 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl animate-fade-in">
                    <div className="px-4 py-2 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${hasUnsaved ? 'bg-amber-400 animate-pulse' : lastSynced ? 'bg-green-400' : 'bg-zinc-500'}`}
                        />
                        <span className="text-xs text-zinc-400">
                          {hasUnsaved ? 'Unsaved changes' : lastSynced ? `Synced ${formatLastSynced()}` : 'Not synced'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleGitHubPush}
                      disabled={isGitHubLoading}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Push to GitHub
                    </button>
                    <button
                      onClick={handleGitHubPull}
                      disabled={isGitHubLoading}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l4 4m0 0l4-4m-4 4V4"
                        />
                      </svg>
                      Pull from GitHub
                    </button>
                    <div className="border-t border-zinc-800 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setIsGitHubOpen(false);
                          setIsSettingsOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-300 hover:bg-white/5 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M10.325 4.317c.486-1.756 2.024-3 3.675-3a3.5 3.5 0 013.5 3.5c0 .574-.146 1.112-.41 1.59m-.41 2.59a3.5 3.5 0 010 4.922m0-7.59V16a3.5 3.5 0 003.5 3.5h1a3.5 3.5 0 003.5-3.5v-1c0-1.65-1.35-3-3-3h-1"
                          />
                        </svg>
                        GitHub Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Deploy Button */}
            {chat.started && hasProject && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9-7-9-7-9 7 9 7z" />
                </svg>
                <span>Deploy</span>
              </button>
            )}

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.486-1.756 2.024-3 3.675-3a3.5 3.5 0 013.5 3.5c0 .574-.146 1.112-.41 1.59m-.41 2.59a3.5 3.5 0 010 4.922m0-7.59V16a3.5 3.5 0 003.5 3.5h1a3.5 3.5 0 003.5-3.5v-1c0-1.65-1.35-3-3-3h-1"
                />
              </svg>
            </button>

            {chat.started && <HeaderActionButtons />}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-xl lg:hidden text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/5 py-4 space-y-2 animate-slide-in">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-white/5">
              {chat.started && hasProject && (
                <>
                  <button
                    onClick={handleGitHubPush}
                    className="w-full flex items-center gap-2 px-4 py-3 text-zinc-300 hover:bg-white/5 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Push to GitHub
                  </button>
                  <button
                    onClick={handleGitHubPull}
                    className="w-full flex items-center gap-2 px-4 py-3 text-zinc-300 hover:bg-white/5 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l4 4m0 0l4-4m-4 4V4"
                      />
                    </svg>
                    Pull from GitHub
                  </button>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-zinc-300 hover:bg-white/5 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 19l9-7-9-7-9 7 9 7z"
                      />
                    </svg>
                    Deploy
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10.325 4.317c.486-1.756 2.024-3 3.675-3a3.5 3.5 0 013.5 3.5c0 .574-.146 1.112-.41 1.59m-.41 2.59a3.5 3.5 0 010 4.922m0-7.59V16a3.5 3.5 0 003.5 3.5h1a3.5 3.5 0 003.5-3.5v-1c0-1.65-1.35-3-3-3h-1"
                  />
                </svg>
                Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close GitHub dropdown */}
      {isGitHubOpen && <div className="fixed inset-0 z-40" onClick={() => setIsGitHubOpen(false)} />}

      <Settings open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
}
