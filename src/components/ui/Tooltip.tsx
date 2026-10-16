import { cn } from '@/lib/cn';

interface Props {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
  width?: string;
}

/** Lightweight CSS tooltip shown on hover and keyboard focus. */
export function Tooltip({ content, children, side = 'bottom', className, width = 'w-64' }: Props) {
  return (
    <span className={cn('group/tt relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          // Hidden tooltips use display:none so they never widen the page on small screens.
          'pointer-events-none absolute left-1/2 z-40 hidden max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border border-white/10 bg-ink-950/95 p-3 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-ink-200 shadow-xl backdrop-blur-sm',
          'group-hover/tt:block group-focus-within/tt:block',
          side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
          width,
        )}
      >
        {content}
      </span>
    </span>
  );
}
