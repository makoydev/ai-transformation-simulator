import { motion } from 'framer-motion';
import { BookOpen, Lock } from 'lucide-react';
import { useState } from 'react';
import { DebriefCard } from '@/components/feedback/DebriefCard';
import { VerdictBadge } from '@/components/ui/Verdict';
import { LESSON_CATEGORIES, LESSONS } from '@/data/lessons';
import type { LessonCategory } from '@/engine';
import { cn } from '@/lib/cn';
import { useGame } from '@/store/gameStore';

type Filter = LessonCategory | 'all';

export function PlaybookPanel() {
  const game = useGame();
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<'lessons' | 'log'>('lessons');
  const [openDebrief, setOpenDebrief] = useState<string | null>(null);
  const lessons = LESSONS.filter((l) => filter === 'all' || l.category === filter);
  const unlocked = game.lessons.length;

  return (
    <section aria-labelledby="playbook-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="playbook-title" className="text-xl font-bold text-white">
            The AI Transformation Playbook
          </h2>
          <p className="text-sm text-ink-300">Every decision teaches a principle. Collect them all.</p>
        </div>
        <div className="flex rounded-xl bg-white/4 p-1 text-sm" role="tablist">
          {(['lessons', 'log'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn('rounded-lg px-3 py-1.5 font-semibold transition', view === v ? 'bg-white/10 text-white' : 'text-ink-300 hover:text-white')}
            >
              {v === 'lessons' ? `Principles ${unlocked}/${LESSONS.length}` : `Decision log (${game.debriefs.length})`}
            </button>
          ))}
        </div>
      </div>

      {view === 'lessons' ? (
        <>
          <div className="mb-4">
            <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-brand-gradient"
                initial={false}
                animate={{ width: `${(unlocked / LESSONS.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {(['all', ...Object.keys(LESSON_CATEGORIES)] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition',
                    filter === f ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 text-ink-300 hover:text-white',
                  )}
                >
                  {f === 'all' ? 'All' : LESSON_CATEGORIES[f].label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {lessons.map((l, i) => {
              const has = game.lessons.includes(l.id);
              const cat = LESSON_CATEGORIES[l.category];
              return (
                <motion.article
                  key={l.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                  className={cn('glass p-4', !has && 'border-dashed border-white/10 bg-transparent shadow-none')}
                >
                  <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: cat.color }}>
                    {has ? <BookOpen size={13} aria-hidden /> : <Lock size={13} aria-hidden />}
                    {cat.label}
                  </div>
                  <h3 className={cn('mt-1.5 font-display font-semibold', has ? 'text-white' : 'text-ink-300')}>{has ? l.title : '???'}</h3>
                  {has ? (
                    <>
                      <p className="mt-1 text-sm font-medium text-ink-100">{l.principle}</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-ink-300">{l.detail}</p>
                    </>
                  ) : (
                    <p className="mt-1 text-xs text-ink-400">Make decisions in this area to unlock this principle.</p>
                  )}
                </motion.article>
              );
            })}
          </div>
        </>
      ) : game.debriefs.length === 0 ? (
        <p className="text-sm text-ink-400">No decisions yet.</p>
      ) : (
        <ol className="space-y-2">
          {[...game.debriefs].reverse().map((d) => (
            <li key={d.id}>
              {openDebrief === d.id ? (
                <button className="w-full text-left" onClick={() => setOpenDebrief(null)} aria-expanded>
                  <DebriefCard debrief={d} />
                </button>
              ) : (
                <button
                  onClick={() => setOpenDebrief(d.id)}
                  className="glass flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left hover:border-white/20"
                  aria-expanded={false}
                >
                  <span className="text-xs font-semibold text-ink-400">Q{d.quarter}</span>
                  <VerdictBadge verdict={d.verdict} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{d.title}</span>
                  <span className="text-[11px] capitalize text-ink-400">{d.kind}</span>
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
