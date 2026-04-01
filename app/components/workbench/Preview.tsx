import { useStore } from '@nanostores/react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { IconButton } from '~/components/ui/IconButton';
import { workbenchStore } from '~/lib/stores/workbench';
import { PortDropdown } from './PortDropdown';

export const Preview = memo(() => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isPortDropdownOpen, setIsPortDropdownOpen] = useState(false);
  const hasSelectedPreview = useRef(false);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];

  const [url, setUrl] = useState('');
  const [iframeUrl, setIframeUrl] = useState<string | undefined>();
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (!activePreview) {
      setUrl('');
      setIframeUrl(undefined);

      return;
    }

    const { baseUrl } = activePreview;

    setUrl(baseUrl);
    setIframeUrl(baseUrl);
  }, [activePreview, iframeUrl]);

  const validateUrl = useCallback(
    (value: string) => {
      if (!activePreview) {
        return false;
      }

      const { baseUrl } = activePreview;

      if (value === baseUrl) {
        return true;
      } else if (value.startsWith(baseUrl)) {
        return ['/', '?', '#'].includes(value.charAt(baseUrl.length));
      }

      return false;
    },
    [activePreview],
  );

  const findMinPortIndex = useCallback(
    (minIndex: number, preview: { port: number }, index: number, array: { port: number }[]) => {
      return preview.port < array[minIndex].port ? index : minIndex;
    },
    [],
  );

  // when previews change, display the lowest port if user hasn't selected a preview
  useEffect(() => {
    if (previews.length > 1 && !hasSelectedPreview.current) {
      const minPortIndex = previews.reduce(findMinPortIndex, 0);

      setActivePreviewIndex(minPortIndex);
    }
  }, [previews]);

  const reloadPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {isPortDropdownOpen && (
        <div className="z-iframe-overlay w-full h-full absolute" onClick={() => setIsPortDropdownOpen(false)} />
      )}
      <div className="bg-bolt-elements-background-depth-2 p-2 flex items-center gap-1.5 border-b border-bolt-elements-borderColor">
        <div className="flex bg-bolt-elements-background-depth-1 rounded-md p-1 border border-bolt-elements-borderColor">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-md transition-colors ${
              device === 'desktop'
                ? 'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent shadow-sm'
                : 'text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2'
            }`}
            title="Desktop View"
          >
            <div className="i-ph:desktop text-lg" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded-md transition-colors ${
              device === 'mobile'
                ? 'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent shadow-sm'
                : 'text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2'
            }`}
            title="Mobile View"
          >
            <div className="i-ph:phone-bold text-lg" />
          </button>
        </div>
        <div className="w-[1px] h-6 bg-bolt-elements-borderColor mx-1" />
        <IconButton icon="i-ph:arrow-clockwise" onClick={reloadPreview} title="Reload Preview" />
        <div className="flex items-center gap-1 flex-grow bg-bolt-elements-preview-addressBar-background border border-bolt-elements-borderColor text-bolt-elements-preview-addressBar-text rounded-full px-3 py-1 text-sm hover:bg-bolt-elements-preview-addressBar-backgroundHover focus-within:bg-bolt-elements-preview-addressBar-backgroundActive focus-within:border-bolt-elements-borderColorActive focus-within:text-bolt-elements-preview-addressBar-textActive transition-all">
          <div className="i-ph:globe text-bolt-elements-textTertiary" />
          <input
            ref={inputRef}
            className="w-full bg-transparent outline-none ml-1"
            type="text"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && validateUrl(url)) {
                setIframeUrl(url);

                if (inputRef.current) {
                  inputRef.current.blur();
                }
              }
            }}
          />
        </div>
        {previews.length > 1 && (
          <PortDropdown
            activePreviewIndex={activePreviewIndex}
            setActivePreviewIndex={setActivePreviewIndex}
            isDropdownOpen={isPortDropdownOpen}
            setHasSelectedPreview={(value) => (hasSelectedPreview.current = value)}
            setIsDropdownOpen={setIsPortDropdownOpen}
            previews={previews}
          />
        )}
      </div>
      <div className="flex-1 bg-bolt-elements-background-depth-1 relative overflow-hidden">
        {activePreview ? (
          <div
            className={`h-full mx-auto transition-all duration-300 ease-in-out bg-white shadow-lg overflow-hidden ${
              device === 'mobile'
                ? 'w-[375px] my-4 rounded-[2rem] border-[12px] border-black h-[calc(100%-2rem)]'
                : 'w-full h-full'
            }`}
          >
            <iframe ref={iframeRef} className="border-none w-full h-full" src={iframeUrl} />
          </div>
        ) : (
          <div className="flex w-full h-full justify-center items-center text-bolt-elements-textTertiary">
            <div className="flex flex-col items-center gap-3">
              <div className="i-ph:browser text-4xl opacity-20" />
              <span>No preview available</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
