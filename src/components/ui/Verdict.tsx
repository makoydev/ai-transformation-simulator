import type { Verdict } from '@/engine/types';
import { cn } from '@/lib/cn';
import { VERDICT_META } from '@/lib/labels';

export function VerdictBadge({ verdict, className, label }: { verdict: Verdict; className?: string; label?: string }) {
  const m = VERDICT_META[verdict];
  const Icon = m.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', m.text, m.bg, m.ring, className)}>
      <Icon size={14} aria-hidden />
      {label ?? m.label}
    </span>
  );
}
