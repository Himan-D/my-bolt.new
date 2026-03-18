import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useRef, useState } from 'react';
import { type ChatHistoryItem } from '~/lib/persistence';

interface HistoryItemProps {
  item: ChatHistoryItem;
  onDelete?: (event: React.UIEvent) => void;
  onRename?: (id: string, newName: string) => void;
  onDuplicate?: (id: string) => void;
}

export function HistoryItem({ item, onDelete, onRename, onDuplicate }: HistoryItemProps) {
  const [hovering, setHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.description || '');
  const hoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    function mouseEnter() {
      setHovering(true);

      if (timeout) {
        clearTimeout(timeout);
      }
    }

    function mouseLeave() {
      setHovering(false);
    }

    hoverRef.current?.addEventListener('mouseenter', mouseEnter);
    hoverRef.current?.addEventListener('mouseleave', mouseLeave);

    return () => {
      hoverRef.current?.removeEventListener('mouseenter', mouseEnter);
      hoverRef.current?.removeEventListener('mouseleave', mouseLeave);
    };
  }, []);

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

  return (
    <div
      ref={hoverRef}
      className="group rounded-md text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 overflow-hidden flex justify-between items-center px-2 py-1"
    >
      {isEditing ? (
        <input
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
          className="flex-1 bg-transparent border border-bolt-elements-borderColor rounded px-1 py-0.5 text-sm text-bolt-elements-textPrimary focus:outline-none focus:border-bolt-elements-textPrimary"
        />
      ) : (
        <a href={`/chat/${item.urlId}`} className="flex w-full relative truncate block">
          {item.description}
          <div className="absolute right-0 z-1 top-0 bottom-0 bg-gradient-to-l from-bolt-elements-background-depth-2 group-hover:from-bolt-elements-background-depth-3 to-transparent w-10 flex justify-end group-hover:w-22 group-hover:from-45%">
            {hovering && (
              <div className="flex items-center gap-1 p-1">
                {/* Rename */}
                <button
                  className="i-ph:pencil-simple scale-110 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
                  onClick={(event) => {
                    event.preventDefault();
                    setEditValue(item.description || '');
                    setIsEditing(true);
                  }}
                  title="Rename"
                />
                {/* Duplicate */}
                <button
                  className="i-ph:copy scale-110 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
                  onClick={(event) => {
                    event.preventDefault();
                    onDuplicate?.(item.id);
                  }}
                  title="Duplicate"
                />
                {/* Delete */}
                <Dialog.Trigger asChild>
                  <button
                    className="i-ph:trash scale-110 text-bolt-elements-textSecondary hover:text-bolt-elements-item-contentDanger"
                    onClick={(event) => {
                      event.preventDefault();
                      onDelete?.(event);
                    }}
                    title="Delete"
                  />
                </Dialog.Trigger>
              </div>
            )}
          </div>
        </a>
      )}
    </div>
  );
}
