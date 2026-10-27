import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from '@/components/ui/Avatar';
import { VerdictBadge } from '@/components/ui/Verdict';
import { STAKEHOLDERS } from '@/data/stakeholders';
import { announce } from '@/lib/announce';
import { cn } from '@/lib/cn';
import { VERDICT_META } from '@/lib/labels';
import { dialogCount, subscribeDialogs } from '@/lib/dialogStack';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { selectDialogOpen, useGameStore, type Toast } from '@/store/gameStore';

const DURATION: Record<Toast['kind'], number> = { quip: 5500, debrief: 10000, error: 3000 };

// Toasts already read out, so a remount (or React's dev double effects) doesn't repeat them.
const announced = new Set<number>();

function ToastItem({ toast, compact }: { toast: Toast; compact: boolean }) {
  const dismiss = useGameStore((s) => s.dismissToast);
  const readDebrief = useGameStore((s) => s.readDebrief);

  // The time left, from 1 to 0: it drives the bar along the bottom, and the toast closes when it runs out.
  // Hovering, tapping or focusing the toast pauses it, so a toast stays while it is being read (WCAG 2.2.1).
  const left = useMotionValue(1);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  useEffect(() => {
    if (paused) return;
    const controls = animate(left, 0, {
      duration: (left.get() * DURATION[toast.kind]) / 1000,
      ease: 'linear',
      onComplete: () => dismiss(toast.id),
    });
    return () => controls.stop();
  }, [paused, left, toast.id, toast.kind, dismiss]);

  // Read out once, when the toast first appears (it may have waited for a dialog to close).
  useEffect(() => {
    if (announced.has(toast.id)) return;
    announced.add(toast.id);
    if (toast.kind === 'quip' && toast.stakeholder) announce(`${STAKEHOLDERS[toast.stakeholder].name}: ${toast.text}`);
    else if (toast.kind === 'debrief' && toast.verdict) announce(`Debrief, ${VERDICT_META[toast.verdict].label}: ${toast.title}. ${toast.text}`);
    else if (toast.kind === 'error') announce(toast.text, true);
  }, [toast]);

  // Phones slide toasts down from the top edge; larger screens slide them in from the left.
  const offset = compact ? { y: -24 } : { x: -40 };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, ...offset }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'glass-strong pointer-events-auto relative w-full max-w-sm overflow-hidden p-3 pr-11',
        toast.kind === 'error' && 'border-rose-400/40',
      )}
      // Taps count too: phones send mouseenter on a tap and mouseleave on the next tap elsewhere.
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => setFocused(e.currentTarget.contains(e.relatedTarget))}
    >
      <button
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss"
        className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 hover:bg-white/10 hover:text-white"
      >
        <X size={15} />
      </button>
      {toast.kind === 'quip' && toast.stakeholder && (
        <div className="flex gap-2.5">
          <Avatar id={toast.stakeholder} size="sm" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-ink-300">{STAKEHOLDERS[toast.stakeholder].name}</div>
            <p className={cn('text-sm leading-snug text-ink-100', compact && 'line-clamp-2')}>{toast.text}</p>
          </div>
        </div>
      )}
      {toast.kind === 'debrief' && toast.verdict && (
        <div>
          <div className="flex items-center gap-2">
            <VerdictBadge verdict={toast.verdict} />
            <span className="label-caps">Debrief</span>
          </div>
          <div className="mt-1.5 text-sm font-semibold text-white">{toast.title}</div>
          <p className={cn('mt-0.5 text-xs leading-relaxed text-ink-200', compact ? 'line-clamp-2' : 'line-clamp-4')}>{toast.text}</p>
          {toast.debriefId && (
            <button
              onClick={() => {
                readDebrief(toast.debriefId!);
                dismiss(toast.id);
              }}
              className="mt-0.5 py-1 text-sm font-semibold text-brand-cyan hover:underline"
            >
              Read in Playbook
            </button>
          )}
        </div>
      )}
      {toast.kind === 'error' && (
        <div className="flex items-center gap-2 text-sm text-rose-100">
          <AlertCircle size={16} aria-hidden /> {toast.text}
        </div>
      )}
      <motion.div className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-white/30" style={{ scaleX: left }} />
    </motion.div>
  );
}

export function Toasts() {
  const toasts = useGameStore((s) => s.toasts);
  const transition = useGameStore((s) => s.transition);
  const gameDialog = useGameStore(selectDialogOpen);
  // Also covers dialogs whose state lives outside the store, such as confirmations.
  const anyDialog = useSyncExternalStore(subscribeDialogs, () => dialogCount() > 0);
  const phone = useMediaQuery('(max-width: 639px)');

  // Toasts never cover a dialog or the quarter card: apart from errors they wait until it closes.
  // A toast's timer starts when it is shown, so held toasts keep their full reading time.
  const held = gameDialog || anyDialog || transition !== null;
  const ready = held ? toasts.filter((t) => t.kind === 'error') : toasts;
  // Phones show one compact toast at a time, oldest first, at the top of the screen.
  const shown = phone ? ready.slice(0, 1) : ready;

  // Rendered at the end of <body>, outside the app root that dialogs make inert.
  return createPortal(
    <div
      className={cn(
        'pointer-events-none fixed z-58 flex flex-col gap-2',
        phone ? 'inset-x-3 top-3 items-stretch' : 'bottom-24 left-4 w-96 items-start',
      )}
    >
      <AnimatePresence initial={false}>
        {shown.map((t) => (
          <ToastItem key={t.id} toast={t} compact={phone} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
