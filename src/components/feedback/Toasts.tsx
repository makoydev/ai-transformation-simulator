import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from '@/components/ui/Avatar';
import { VerdictBadge } from '@/components/ui/Verdict';
import { STAKEHOLDERS } from '@/data/stakeholders';
import { cn } from '@/lib/cn';
import { dialogCount, subscribeDialogs } from '@/lib/dialogStack';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { selectDialogOpen, useGameStore, type Toast } from '@/store/gameStore';

const DURATION: Record<Toast['kind'], number> = { quip: 5500, debrief: 10000, error: 3000 };

function ToastItem({ toast, compact }: { toast: Toast; compact: boolean }) {
  const dismiss = useGameStore((s) => s.dismissToast);
  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), DURATION[toast.kind]);
    return () => clearTimeout(t);
  }, [toast.id, toast.kind, dismiss]);

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
        'glass-strong pointer-events-auto relative w-full max-w-sm overflow-hidden p-3 pr-9',
        toast.kind === 'error' && 'border-rose-400/40',
      )}
      role={toast.kind === 'error' ? 'alert' : 'status'}
    >
      <button onClick={() => dismiss(toast.id)} aria-label="Dismiss" className="absolute right-2 top-2 rounded-sm p-1 text-ink-400 hover:text-white">
        <X size={14} />
      </button>
      {toast.kind === 'quip' && toast.stakeholder && (
        <div className="flex gap-2.5">
          <Avatar id={toast.stakeholder} size="sm" />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-ink-300">{STAKEHOLDERS[toast.stakeholder].name}</div>
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
        </div>
      )}
      {toast.kind === 'error' && (
        <div className="flex items-center gap-2 text-sm text-rose-100">
          <AlertCircle size={16} aria-hidden /> {toast.text}
        </div>
      )}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-white/30"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: DURATION[toast.kind] / 1000, ease: 'linear' }}
      />
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
