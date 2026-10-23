import { STAKEHOLDERS } from '@/data/stakeholders';
import type { StakeholderId } from '@/engine/types';
import { cn } from '@/lib/cn';

interface Props {
  id: StakeholderId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-xs', lg: 'h-14 w-14 text-base' };

export function Avatar({ id, size = 'md', className }: Props) {
  const s = STAKEHOLDERS[id];
  return (
    <div
      className={cn('relative flex shrink-0 items-center justify-center rounded-full font-display font-bold text-ink-950', SIZES[size], className)}
      style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}99)` }}
      aria-label={`${s.name}, ${s.title}`}
      role="img"
    >
      {s.initials}
    </div>
  );
}
