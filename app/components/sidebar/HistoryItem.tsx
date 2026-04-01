import { useEffect, useRef, useState } from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '~/components/ui/ContextMenu';
import { Input } from '~/components/ui/Input';
import { type ChatHistoryItem } from '~/lib/persistence';

interface HistoryItemProps {
  item: ChatHistoryItem;
  onDelete?: (event: React.UIEvent) => void;
  onRename?: (id: string, newName: string) => void;
  onDuplicate?: (id: string) => void;
}

export function HistoryItem({ item, onDelete, onRename, onDuplicate }: HistoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.description || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRenameSubmit = () => {
    if (editValue.trim() && editValue.trim() !== item.description) {
      onRename?.(item.id, editValue.trim());
    }

    setIsEditing(false);
  };

  const handleContextMenuAction = (action: 'rename' | 'duplicate' | 'delete', event?: React.UIEvent) => {
    switch (action) {
      case 'rename': {
        setEditValue(item.description || '');
        setIsEditing(true);
        break;
      }

      case 'duplicate': {
        onDuplicate?.(item.id);
        break;
      }

      case 'delete': {
        if (event) {
          onDelete?.(event);
        }

        break;
      }
    }
  };

  if (isEditing) {
    return (
      <div className="px-2 py-1">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleRenameSubmit();
            }

            if (e.key === 'Escape') {
              setEditValue(item.description || '');
              setIsEditing(false);
            }
          }}
          className="text-sm"
          placeholder="Chat name"
          autoFocus
        />
      </div>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <a
          href={`/chat/${item.urlId}`}
          className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 transition-colors truncate cursor-pointer"
          title={item.description}
        >
          <span className="i-ph:chat text-base flex-shrink-0 opacity-60 group-hover:opacity-100" />
          <span className="flex-1 truncate">{item.description}</span>
        </a>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => handleContextMenuAction('rename')} className="flex gap-2">
          <span className="i-ph:pencil-simple text-base" />
          Rename
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleContextMenuAction('duplicate')} className="flex gap-2">
          <span className="i-ph:copy text-base" />
          Duplicate
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={(e: any) => handleContextMenuAction('delete', e)}
          className="flex gap-2 text-bolt-elements-item-contentDanger focus:text-bolt-elements-item-contentDanger focus:bg-bolt-elements-background-depth-3"
        >
          <span className="i-ph:trash text-base" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
