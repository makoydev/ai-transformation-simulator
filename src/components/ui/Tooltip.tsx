import { X } from 'lucide-react';
import { cloneElement, useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { tooltipShift } from '@/lib/position';

interface Props {
  content: React.ReactNode;
  /** One focusable element. It gets `aria-describedby` pointing at the tooltip text. */
  children: React.ReactElement<{ 'aria-describedby'?: string }>;
  side?: 'top' | 'bottom';
  className?: string;
  /** Width in px. On narrow screens the tooltip shrinks to fit. */
  width?: number;
}

/**
 * Explanatory popover, nudged sideways so it stays on screen. It opens on mouse hover and
 * keyboard focus, and a tap or click pins it open with a close button, so touch players can
 * read it too. Escape or a tap elsewhere closes it. Screen readers get the text as the
 * trigger's description.
 */
export function Tooltip({ content, children, side = 'bottom', className, width = 256 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  const id = useId();
  const [shift, setShift] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || focused || pinned;

  // Measured as the tooltip is about to show, so it always matches the current layout.
  const place = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setShift(tooltipShift(r.left, r.width, width, document.documentElement.clientWidth));
  };

  const close = () => {
    setHovered(false);
    setFocused(false);
    setPinned(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setPinned(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className={cn('relative inline-flex', className)}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return;
        place();
        setHovered(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setHovered(false);
      }}
      onFocus={(e) => {
        // Keyboard focus only: a tap also focuses the trigger, and taps toggle the pin instead.
        if (!(e.target as Element).matches(':focus-visible')) return;
        place();
        setFocused(true);
      }}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      onClick={(e) => {
        if (popRef.current?.contains(e.target as Node)) return;
        place();
        setPinned((p) => !p);
      }}
    >
      {cloneElement(children, { 'aria-describedby': id })}
      <span
        ref={popRef}
        id={id}
        role="tooltip"
        style={{ width, transform: `translateX(calc(-50% + ${shift}px))` }}
        className={cn(
          // Closed tooltips use display:none so they never widen the page on small screens.
          'absolute left-1/2 z-40 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-ink-950/95 p-3 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-ink-200 shadow-xl backdrop-blur-sm',
          open ? 'block' : 'hidden',
          pinned ? 'pointer-events-auto pr-9' : 'pointer-events-none',
          side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
        )}
      >
        {content}
        {pinned && (
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 hover:bg-white/10 hover:text-white"
          >
            <X size={15} aria-hidden />
          </button>
        )}
      </span>
    </span>
  );
}
