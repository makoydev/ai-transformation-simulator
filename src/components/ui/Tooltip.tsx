import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { tooltipShift } from '@/lib/position';

interface Props {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
  /** Width in px. On narrow screens the tooltip shrinks to fit. */
  width?: number;
}

/** Lightweight CSS tooltip shown on hover and keyboard focus, nudged sideways so it stays on screen. */
export function Tooltip({ content, children, side = 'bottom', className, width = 256 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  // Measured as the tooltip is about to show, so it always matches the current layout.
  const place = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setShift(tooltipShift(r.left, r.width, width, document.documentElement.clientWidth));
  };

  return (
    <span ref={ref} onPointerEnter={place} onFocus={place} className={cn('group/tt relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        style={{ width, transform: `translateX(calc(-50% + ${shift}px))` }}
        className={cn(
          // Hidden tooltips use display:none so they never widen the page on small screens.
          'pointer-events-none absolute left-1/2 z-40 hidden max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-ink-950/95 p-3 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-ink-200 shadow-xl backdrop-blur-sm',
          'group-hover/tt:block group-focus-within/tt:block',
          side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
        )}
      >
        {content}
      </span>
    </span>
  );
}
