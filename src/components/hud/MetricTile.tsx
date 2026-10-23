import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/cn';
import { FLASH_RING, useDeltaFloats, type DeltaFloat } from './useDeltaFloats';

interface Props {
  label: string;
  value: number;
  format: (v: number) => string;
  formatDelta: (d: number) => string;
  icon: LucideIcon;
  accent: string;
  tooltip: React.ReactNode;
  sub?: React.ReactNode;
  higherIsBetter?: boolean;
  /** Ignore changes smaller than this (avoids noisy floats). */
  epsilon?: number;
  children?: React.ReactNode;
  className?: string;
}

/** The floating signed deltas. Colour = direction × whether up is good. */
export function DeltaFloats({
  floats,
  formatDelta,
  higherIsBetter,
  className,
}: {
  floats: DeltaFloat[];
  formatDelta: (d: number) => string;
  higherIsBetter: boolean;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {floats.map((f) => {
        const good = higherIsBetter ? f.delta > 0 : f.delta < 0;
        return (
          <motion.span
            key={f.id}
            initial={{ opacity: 0, y: 4, scale: 0.8 }}
            animate={{ opacity: 1, y: -18, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={cn(
              'pointer-events-none absolute rounded-md px-1.5 py-0.5 text-xs font-bold',
              good ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300',
              className,
            )}
            aria-hidden
          >
            {formatDelta(f.delta)}
          </motion.span>
        );
      })}
    </AnimatePresence>
  );
}

/**
 * A stat tile: label, animated value, and a floating signed delta whenever
 * the value changes. Delta color = direction × whether up is good.
 */
export function MetricTile({
  label,
  value,
  format,
  formatDelta,
  icon: Icon,
  accent,
  tooltip,
  sub,
  higherIsBetter = true,
  epsilon = 0.5,
  children,
  className,
}: Props) {
  const { floats, flash } = useDeltaFloats(value, epsilon, higherIsBetter);

  return (
    <Tooltip content={tooltip} className={cn('block min-w-0', className)} width={288}>
      <div
        tabIndex={0}
        className={cn(
          'glass relative w-full overflow-visible rounded-xl px-3 py-2.5 text-left transition-shadow duration-300',
          flash && FLASH_RING[flash],
        )}
      >
        <span className="absolute inset-x-3 top-0 h-px opacity-70" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} aria-hidden />
        <div className="flex items-center gap-1.5 text-xs font-medium text-ink-300">
          <Icon size={13} style={{ color: accent }} aria-hidden />
          <span className="truncate">{label}</span>
        </div>
        <div className="mt-0.5 font-sans text-lg font-semibold text-white sm:text-xl">
          <AnimatedNumber value={value} format={format} />
        </div>
        {/* Wraps rather than truncates: at 12px some captions are wider than a phone tile. */}
        {sub && <div className="text-xs leading-snug text-ink-400">{sub}</div>}
        {children && <div className="mt-1.5">{children}</div>}

        <DeltaFloats floats={floats} formatDelta={formatDelta} higherIsBetter={higherIsBetter} className="right-2 top-1" />
      </div>
    </Tooltip>
  );
}
