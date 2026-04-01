import { motion, type Variants } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { ScrollArea } from '~/components/ui/ScrollArea';
import {
  db,
  deleteById,
  getAll,
  chatId,
  updateChatDescription,
  duplicateChat,
  exportAllChats,
  importChats,
  type ChatHistoryItem,
} from '~/lib/persistence';
import { cubicEasingFn } from '~/utils/easings';
import { logger } from '~/utils/logger';
import { HistoryItem } from './HistoryItem';
import { binDates } from './date-binning';

const menuVariants = {
  closed: {
    opacity: 0,
    visibility: 'hidden',
    left: '-150px',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    opacity: 1,
    visibility: 'initial',
    left: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

type DialogContent = { type: 'delete'; item: ChatHistoryItem } | null;

export function Menu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<ChatHistoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadEntries = useCallback(() => {
    if (db) {
      getAll(db)
        .then((list) => list.filter((item) => item.urlId && item.description))
        .then(setList)
        .catch((error) => toast.error(error.message));
    }
  }, []);

  const deleteItem = useCallback((event: React.UIEvent, item: ChatHistoryItem) => {
    event.preventDefault();

    if (db) {
      deleteById(db, item.id)
        .then(() => {
          loadEntries();

          if (chatId.get() === item.id) {
            window.location.pathname = '/';
          }
        })
        .catch((error) => {
          toast.error('Failed to delete conversation');
          logger.error(error);
        });
    }
  }, []);

  const renameItem = useCallback((id: string, newName: string) => {
    if (db) {
      updateChatDescription(db, id, newName)
        .then(() => {
          loadEntries();
          toast.success('Chat renamed');
        })
        .catch((error) => {
          toast.error('Failed to rename');
          logger.error(error);
        });
    }
  }, []);

  const duplicateItem = useCallback((id: string) => {
    if (db) {
      duplicateChat(db, id)
        .then((newUrlId) => {
          loadEntries();
          toast.success('Chat duplicated');
          window.location.pathname = `/chat/${newUrlId}`;
        })
        .catch((error) => {
          toast.error('Failed to duplicate');
          logger.error(error);
        });
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (!db) {
      return;
    }

    try {
      const json = await exportAllChats(db);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hima-chats-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Chats exported');
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    }
  }, []);

  const handleImport = useCallback(() => {
    const database = db;

    if (!database) {
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (!file) {
        return;
      }

      try {
        const text = await file.text();
        const count = await importChats(database, text);
        loadEntries();
        toast.success(`Imported ${count} chat(s)`);
      } catch (error: any) {
        toast.error(`Import failed: ${error.message}`);
      }
    };

    input.click();
  }, []);

  const closeDialog = () => {
    setDialogContent(null);
  };

  useEffect(() => {
    if (open) {
      loadEntries();
    }
  }, [open, loadEntries]);

  useEffect(() => {
    const enterThreshold = 40;
    const exitThreshold = 40;

    function onMouseMove(event: MouseEvent) {
      if (event.pageX < enterThreshold) {
        setOpen(true);
      }

      if (menuRef.current && event.clientX > menuRef.current.getBoundingClientRect().right + exitThreshold) {
        setOpen(false);
      }
    }

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // filter chats by search query
  const filteredList = searchQuery
    ? list.filter((item) => item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : list;

  return (
    <motion.div
      ref={menuRef}
      initial="closed"
      animate={open ? 'open' : 'closed'}
      variants={menuVariants}
      className="flex flex-col side-menu fixed top-0 w-[350px] h-full bg-bolt-elements-background-depth-2 border-r rounded-r-3xl border-bolt-elements-borderColor z-sidebar shadow-xl shadow-bolt-elements-sidebar-dropdownShadow text-sm"
    >
      {/* Header spacer */}
      <div className="flex items-center h-[var(--header-height)]" />

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        {/* Start new chat button */}
        <div className="p-4">
          <a
            href="/"
            className="flex gap-2 items-center bg-bolt-elements-sidebar-buttonBackgroundDefault text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover rounded-md p-2 transition-colors"
          >
            <span className="inline-block i-bolt:chat scale-110" />
            Start new chat
          </a>
        </div>

        {/* Search input */}
        <div className="px-4 pb-2">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 i-ph:magnifying-glass text-bolt-elements-textTertiary text-sm" />
            <Input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-bolt-elements-background-depth-1 border-bolt-elements-borderColor text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary focus:border-bolt-elements-textTertiary"
              aria-label="Search chats"
            />
          </div>
        </div>

        {/* Chat history header */}
        <div className="text-bolt-elements-textPrimary font-semibold pl-6 pr-5 my-2 text-xs uppercase tracking-wide opacity-70">
          Your Chats
        </div>

        {/* Chat list */}
        <ScrollArea className="flex-1 px-4 pb-5">
          {filteredList.length === 0 && (
            <div className="pl-2 py-8 text-center text-bolt-elements-textTertiary text-sm">
              {searchQuery ? 'No matching chats found' : 'No previous conversations'}
            </div>
          )}

          <DialogRoot open={dialogContent !== null}>
            <div className="space-y-6">
              {binDates(filteredList).map(({ category, items }) => (
                <div key={category}>
                  <div className="text-bolt-elements-textTertiary text-xs font-medium uppercase tracking-wide opacity-60 mb-2 px-2">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <HistoryItem
                        key={item.id}
                        item={item}
                        onDelete={() => setDialogContent({ type: 'delete', item })}
                        onRename={renameItem}
                        onDuplicate={duplicateItem}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Delete confirmation dialog */}
            <Dialog onBackdrop={closeDialog} onClose={closeDialog}>
              {dialogContent?.type === 'delete' && (
                <>
                  <DialogTitle>Delete Chat?</DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-2">
                      <p>
                        You are about to delete <strong>{dialogContent.item.description}</strong>.
                      </p>
                      <p className="text-sm opacity-75">Are you sure? This action cannot be undone.</p>
                    </div>
                  </DialogDescription>
                  <div className="px-5 pb-4 bg-bolt-elements-background-depth-2 flex gap-2 justify-end">
                    <DialogButton type="secondary" onClick={closeDialog}>
                      Cancel
                    </DialogButton>
                    <DialogButton
                      type="danger"
                      onClick={(event) => {
                        deleteItem(event, dialogContent.item);
                        closeDialog();
                      }}
                    >
                      Delete
                    </DialogButton>
                  </div>
                </>
              )}
            </Dialog>
          </DialogRoot>
        </ScrollArea>

        {/* Footer: Export/Import + Theme toggle */}
        <div className="border-t border-bolt-elements-borderColor p-4 space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="flex-1 text-xs gap-1.5"
              title="Export all chats as JSON"
            >
              <div className="i-ph:download-simple text-sm" />
              Export
            </Button>
            <Button
              onClick={handleImport}
              variant="outline"
              size="sm"
              className="flex-1 text-xs gap-1.5"
              title="Import chats from JSON"
            >
              <div className="i-ph:upload-simple text-sm" />
              Import
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-bolt-elements-textTertiary">
              {list.length} {list.length === 1 ? 'chat' : 'chats'}
            </span>
            <ThemeSwitch className="ml-auto" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
