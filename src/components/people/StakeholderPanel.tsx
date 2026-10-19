import { AnimatePresence, motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Meter } from '@/components/ui/Meter';
import { Tooltip } from '@/components/ui/Tooltip';
import { STAKEHOLDER_ORDER, STAKEHOLDERS } from '@/data/stakeholders';
import { sel } from '@/engine';
import { cn } from '@/lib/cn';
import { useGame } from '@/store/gameStore';

const MOOD_LABEL: Record<ReturnType<typeof sel.mood>, { label: string; cls: string }> = {
  hostile: { label: 'Hostile', cls: 'text-rose-300' },
  wary: { label: 'Wary', cls: 'text-orange-200' },
  neutral: { label: 'Neutral', cls: 'text-ink-200' },
  supportive: { label: 'Supportive', cls: 'text-sky-200' },
  champion: { label: 'Champion', cls: 'text-emerald-300' },
};

export function StakeholderPanel({ className }: { className?: string }) {
  const game = useGame();
  const recent = [...game.inbox].reverse().slice(0, 8);

  return (
    <aside className={cn('space-y-4', className)} aria-label="Stakeholders">
      <div className="glass p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-base font-semibold text-white">Executive team</h2>
          <span className="text-[11px] text-ink-400">Support avg {Math.round(sel.stakeholderAverage(game))}</span>
        </div>
        <ul className="space-y-3">
          {STAKEHOLDER_ORDER.map((id) => {
            const s = STAKEHOLDERS[id];
            const value = game.stakeholders[id];
            const mood = MOOD_LABEL[sel.mood(value)];
            return (
              <li key={id}>
                <Tooltip
                  width={288}
                  content={
                    <>
                      <div className="font-semibold text-white">
                        {s.name} · {s.archetype}
                      </div>
                      <div className="italic text-ink-300">{s.catchphrase}</div>
                      <div className="mt-1.5">
                        <span className="text-emerald-200">Loves:</span> {s.loves}
                      </div>
                      <div>
                        <span className="text-rose-200">Hates:</span> {s.hates}
                      </div>
                      {s.weight > 1 && <div className="mt-1 text-amber-200">Extra influence with the board.</div>}
                    </>
                  }
                  className="w-full"
                >
                  <div tabIndex={0} className="flex w-full items-center gap-3 rounded-xl p-1 transition hover:bg-white/4">
                    <Avatar id={id} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-white">{s.name}</span>
                        <span className={cn('shrink-0 text-[11px] font-semibold', mood.cls)}>{mood.label}</span>
                      </div>
                      <div className="mb-1 truncate text-[11px] text-ink-400">{s.title}</div>
                      <Meter value={value} color={s.color} label={`${s.name} support`} />
                    </div>
                  </div>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="glass p-4">
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-white">
          <Inbox size={16} aria-hidden /> Inbox
        </h2>
        {recent.length === 0 ? (
          <p className="text-xs text-ink-400">Your executives will react to your decisions here.</p>
        ) : (
          <ul className="space-y-2.5" aria-live="polite">
            <AnimatePresence initial={false}>
              {recent.map((m) => (
                <motion.li
                  key={m.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2.5"
                >
                  <Avatar id={m.stakeholder} size="sm" />
                  <div
                    className={cn(
                      'min-w-0 flex-1 rounded-xl rounded-tl-sm border px-3 py-2 text-xs leading-relaxed',
                      m.tone === 'positive' && 'border-emerald-400/20 bg-emerald-400/6 text-ink-100',
                      m.tone === 'negative' && 'border-rose-400/20 bg-rose-400/6 text-ink-100',
                      m.tone === 'neutral' && 'border-white/6 bg-white/3 text-ink-200',
                    )}
                  >
                    <div className="mb-0.5 text-[10px] font-semibold text-ink-400">
                      {STAKEHOLDERS[m.stakeholder].name} · Q{m.quarter}
                    </div>
                    {m.text}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </aside>
  );
}
