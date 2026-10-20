import { motion, useAnimationControls } from 'framer-motion';
import { BookOpen, Briefcase, LayoutGrid, Map, Users } from 'lucide-react';
import { useEffect } from 'react';
import { EventModal } from '@/components/events/EventModal';
import { HowToPlay } from '@/components/feedback/HowToPlay';
import { Toasts } from '@/components/feedback/Toasts';
import { ActionBar } from '@/components/hud/ActionBar';
import { MetricsBar } from '@/components/hud/MetricsBar';
import { TopBar } from '@/components/hud/TopBar';
import { DepartmentModal } from '@/components/org/DepartmentModal';
import { OrgMap } from '@/components/org/OrgMap';
import { StakeholderPanel } from '@/components/people/StakeholderPanel';
import { PlaybookPanel } from '@/components/playbook/PlaybookPanel';
import { PortfolioBoard } from '@/components/portfolio/PortfolioBoard';
import { ProjectModal } from '@/components/portfolio/ProjectModal';
import { QuarterReportModal } from '@/components/report/QuarterReportModal';
import { StrategyPanel } from '@/components/strategy/StrategyPanel';
import { LESSONS } from '@/data/lessons';
import { sel } from '@/engine';
import { cn } from '@/lib/cn';
import { useGame, useGameStore, type Tab } from '@/store/gameStore';

const TABS: { id: Tab; label: string; icon: typeof Map; mobileOnly?: boolean }[] = [
  { id: 'org', label: 'Org Map', icon: Map },
  { id: 'portfolio', label: 'Portfolio', icon: LayoutGrid },
  { id: 'strategy', label: 'Strategy', icon: Briefcase },
  { id: 'playbook', label: 'Playbook', icon: BookOpen },
  { id: 'people', label: 'People', icon: Users, mobileOnly: true },
];

function TabBar() {
  const game = useGame();
  const tab = useGameStore((s) => s.tab);
  const setTab = useGameStore((s) => s.setTab);
  const awaiting = sel.projectsIn(game, 'results').length;

  return (
    <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-white/6 bg-ink-850/70 p-1" role="tablist" aria-label="Game views">
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.id;
        const badge = t.id === 'portfolio' && awaiting > 0 ? awaiting : t.id === 'playbook' ? `${game.lessons.length}/${LESSONS.length}` : null;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors sm:px-4',
              active ? 'text-white' : 'text-ink-300 hover:text-white',
              t.mobileOnly && 'lg:hidden',
            )}
          >
            {active && (
              <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-xl bg-white/9" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <Icon size={16} className="relative" aria-hidden />
            <span className="relative">{t.label}</span>
            {badge !== null && (
              <span
                className={cn(
                  'relative rounded-full px-1.5 text-[11px]',
                  t.id === 'portfolio' ? 'bg-[#d6ab5e] text-ink-950' : 'bg-white/10 text-ink-200',
                )}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function GameScreen() {
  const tab = useGameStore((s) => s.tab);
  const shake = useGameStore((s) => s.shake);
  const controls = useAnimationControls();

  useEffect(() => {
    if (shake === 0) return;
    void controls.start({ x: [0, -12, 12, -8, 8, -4, 4, 0], transition: { duration: 0.5 } });
  }, [shake, controls]);

  return (
    <>
      <motion.div animate={controls} className="mx-auto max-w-[1600px] px-4 pb-6 pt-4 sm:px-6">
        <TopBar />
        <div className="mt-4">
          <MetricsBar />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0">
            <TabBar />
            <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                role="tabpanel"
              >
                {tab === 'org' && <OrgMap />}
                {tab === 'portfolio' && <PortfolioBoard />}
                {tab === 'strategy' && <StrategyPanel />}
                {tab === 'playbook' && <PlaybookPanel />}
                {tab === 'people' && <StakeholderPanel detailed />}
            </motion.div>
          </main>
          <StakeholderPanel className="hidden lg:block" />
        </div>
        <ActionBar />
      </motion.div>

      <DepartmentModal />
      <ProjectModal />
      <EventModal />
      <QuarterReportModal />
      <HowToPlay />
      <Toasts />
    </>
  );
}
