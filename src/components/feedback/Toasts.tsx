import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { VerdictBadge } from '@/components/ui/Verdict';
import { STAKEHOLDERS } from '@/data/stakeholders';
import { cn } from '@/lib/cn';
import { useGameStore, type Toast } from '@/store/gameStore';

const DURATION: Record<Toast['kind'], number> = { quip: 5500, debrief: 10000, error: 3000 };

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useGameStore((s) => s.dismissToast);
  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), DURATION[toast.kind]);
    return () => clearTimeout(t);
  }, [toast.id, toast.kind, dismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, scale: 0.95 }}
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
            <p className="text-sm leading-snug text-ink-100">{toast.text}</p>
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
          <p className="mt-0.5 line-clamp-4 text-xs leading-relaxed text-ink-200">{toast.text}</p>
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
  return (
    <div className="pointer-events-none fixed bottom-24 left-3 right-3 z-58 flex flex-col items-start gap-2 sm:left-4 sm:right-auto sm:w-96">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
