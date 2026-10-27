import { motion } from 'framer-motion';
import type { Change } from '@/engine';
import { cn } from '@/lib/cn';
import { fmtChange } from '@/lib/format';

/** Animated chips summarizing the effects of a decision. */
export function ChangeChips({ changes, className }: { changes: Change[]; className?: string }) {
  if (!changes.length) return <p className="text-xs text-ink-400">No measurable change.</p>;
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {changes.map((c, i) => (
        <motion.span
          key={c.key}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.05, type: 'spring', stiffness: 400, damping: 24 }}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
            c.positive ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/25 bg-rose-400/10 text-rose-200',
          )}
        >
          <span aria-hidden>{c.positive ? '▲' : '▼'}</span>
          {fmtChange(c)}
        </motion.span>
      ))}
    </div>
  );
}
