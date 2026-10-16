import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Archive, ChevronDown, FlaskConical, Hourglass, Radio } from 'lucide-react';
import { useState } from 'react';
import { sel, type Project } from '@/engine';
import { cn } from '@/lib/cn';
import { useGame, useGameStore } from '@/store/gameStore';
import { ProjectCard } from './ProjectCard';

const COLUMNS: { stage: Project['stage']; title: string; hint: string; icon: typeof FlaskConical; accent: string }[] = [
  { stage: 'pilot', title: 'Piloting', hint: 'Building and testing. Results arrive when the timer runs out.', icon: FlaskConical, accent: '#38bdf8' },
  { stage: 'results', title: 'Decision needed', hint: 'Scale, iterate, or kill. Waiting a full quarter means PoC purgatory.', icon: Hourglass, accent: '#fbbf24' },
  { stage: 'production', title: 'Live in production', hint: 'Delivering value at the rate people adopt it.', icon: Radio, accent: '#34d399' },
];

export function PortfolioBoard() {
  const game = useGame();
  const setTab = useGameStore((s) => s.setTab);
  const [showArchive, setShowArchive] = useState(false);
  const archived = game.projects.filter((p) => !sel.isActive(p));

  return (
    <section aria-labelledby="portfolio-title">
      <div className="mb-4">
        <h2 id="portfolio-title" className="text-xl font-bold text-white">
          Portfolio
        </h2>
        <p className="text-sm text-ink-300">Move projects from pilot to production, and kill what isn't working.</p>
      </div>

      {game.projects.length === 0 ? (
        <div className="grid-bg glass flex flex-col items-center px-6 py-14 text-center">
          <FlaskConical size={36} className="text-brand-cyan" aria-hidden />
          <h3 className="mt-3 text-lg font-semibold text-white">No projects yet</h3>
          <p className="mt-1 max-w-md text-sm text-ink-300">
            Audit a department on the Org Map, read the clues, and launch your first pilot.
          </p>
          <button onClick={() => setTab('org')} className="mt-4 text-sm font-semibold text-brand-cyan hover:underline">
            Go to the Org Map →
          </button>
        </div>
      ) : (
        <LayoutGroup>
          <div className="grid gap-4 lg:grid-cols-3">
            {COLUMNS.map((col) => {
              const items = sel.projectsIn(game, col.stage);
              const Icon = col.icon;
              return (
                <div key={col.stage} className="glass flex min-h-[220px] flex-col p-3">
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <Icon size={16} style={{ color: col.accent }} aria-hidden />
                    <h3 className="font-display font-semibold text-white">{col.title}</h3>
                    <span className="ml-auto rounded-full bg-white/6 px-2 py-0.5 text-xs font-semibold text-ink-200">{items.length}</span>
                  </div>
                  <p className="mb-3 px-1 text-xs text-ink-400">{col.hint}</p>
                  <div className="flex flex-col gap-2.5">
                    <AnimatePresence mode="popLayout">
                      {items.map((p) => (
                        <ProjectCard key={p.id} project={p} />
                      ))}
                    </AnimatePresence>
                    {items.length === 0 && (
                      <div className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-ink-500">Empty</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </LayoutGroup>
      )}

      {archived.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowArchive((v) => !v)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-300 hover:text-white"
            aria-expanded={showArchive}
          >
            <Archive size={15} aria-hidden /> Graveyard ({archived.length})
            <ChevronDown size={15} className={cn('transition-transform', showArchive && 'rotate-180')} aria-hidden />
          </button>
          <AnimatePresence>
            {showArchive && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {archived.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
