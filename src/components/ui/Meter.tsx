import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { PALETTE } from '@/lib/palette';

interface Props {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  /** Optional marker (e.g. a threshold) as a value on the same scale. */
  marker?: number;
  height?: string;
  label?: string;
}

export function Meter({ value, max = 100, color = PALETTE.brand.violet, className, marker, height = 'h-1.5', label }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={cn('relative w-full overflow-hidden rounded-full', height, className)}
      style={{ backgroundColor: `${color}26` }}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-label={label}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ backgroundColor: color }}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
      {marker !== undefined && (
        <div
          className="absolute inset-y-0 w-0.5 bg-white/70"
          style={{ left: `${Math.max(0, Math.min(100, (marker / max) * 100))}%` }}
          aria-hidden
        />
      )}
    </div>
  );
}
