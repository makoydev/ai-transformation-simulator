import { cn } from '@/lib/cn';

/**
 * Says in visible text why one or more nearby buttons are disabled. A `title` tooltip
 * alone never reaches touch or keyboard players. Repeated reasons are shown once.
 */
export function DisabledReason({ reasons, className }: { reasons: (string | null | undefined)[]; className?: string }) {
  const unique = [...new Set(reasons.filter((r): r is string => Boolean(r)))];
  if (unique.length === 0) return null;
  return <p className={cn('text-xs text-rose-300', className)}>{unique.join(' ')}</p>;
}
