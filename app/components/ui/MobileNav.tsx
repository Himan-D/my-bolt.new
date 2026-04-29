import { useStore } from '@nanostores/react';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';

interface MobileNavProps {
  activeView: 'chat' | 'code' | 'preview';
  onViewChange: (view: 'chat' | 'code' | 'preview') => void;
}

export function MobileNav({ activeView, onViewChange }: MobileNavProps) {
  const chat = useStore(chatStore);
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const hasPreview = useStore(workbenchStore.previews).length > 0;

  const btnClass = (view: string) =>
    `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
      activeView === view ? 'text-violet-400' : 'text-zinc-500'
    }`;

  if (!chat.started) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-zinc-950 border-t border-zinc-800 px-2 py-2">
      <div className="flex items-center justify-around">
        <button onClick={() => onViewChange('chat')} className={btnClass('chat')}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span className="text-xs">Chat</span>
        </button>

        <button
          onClick={() => {
            workbenchStore.showWorkbench.set(true);
            onViewChange('code');
          }}
          className={btnClass('code')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <span className="text-xs">Code</span>
        </button>

        <button
          onClick={() => hasPreview && workbenchStore.showWorkbench.set(true) && onViewChange('preview')}
          className={`${btnClass('preview')} ${!hasPreview ? 'opacity-50' : ''}`}
          disabled={!hasPreview}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="text-xs">Preview</span>
        </button>

        <button
          onClick={() =>
            showWorkbench ? workbenchStore.showWorkbench.set(false) : workbenchStore.showWorkbench.set(true)
          }
          className={btnClass('workbench')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-xs">{showWorkbench ? 'Hide' : 'Show'}</span>
        </button>
      </div>
    </div>
  );
}
