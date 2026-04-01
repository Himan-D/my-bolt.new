import * as React from 'react';
import { cn } from '~/lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The orientation of the scrollbar.
   */
  orientation?: 'horizontal' | 'vertical' | 'both';
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, orientation = 'vertical', ...props }, ref) => (
    <div ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
      <div
        className={cn(
          'h-full w-full rounded-[inherit]',
          orientation === 'vertical' && 'overflow-y-auto',
          orientation === 'horizontal' && 'overflow-x-auto',
          orientation === 'both' && 'overflow-auto',
        )}
        style={
          {
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--accent)) transparent',
          } as React.CSSProperties
        }
      >
        {props.children}
      </div>
      {/* Custom scrollbar styling via CSS can be added globally */}
    </div>
  ),
);
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
