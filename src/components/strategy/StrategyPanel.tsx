import { motion } from 'framer-motion';
import { Check, GraduationCap, Landmark, Megaphone, Presentation, ShieldCheck, TrendingDown, UserPlus, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DisabledReason } from '@/components/ui/DisabledReason';
import { INITIATIVE_ORDER, INITIATIVES, POLICIES, POLICY_ORDER } from '@/data/policies';
import { getActionCost, pendingHires, validateAction, STAKEHOLDER_SHORT, type GameAction, type InitiativeId, type StakeholderId } from '@/engine';
import { cn } from '@/lib/cn';
import { fmtCost } from '@/lib/format';
import { useGame, useGameStore } from '@/store/gameStore';
import { PALETTE } from '@/lib/palette';

const INITIATIVE_ICONS: Record<InitiativeId, LucideIcon> = {
  literacy: GraduationCap,
  townhall: Megaphone,
  demoday: Presentation,
  expectations: TrendingDown,
  kpi: Landmark,
  hire: UserPlus,
};

function StakeholderReactions({ deltas }: { deltas: Partial<Record<StakeholderId, number>> }) {
  const entries = Object.entries(deltas) as [StakeholderId, number][];
  if (!entries.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([id, d]) => (
        <span
          key={id}
          className={cn('rounded-md px-1.5 py-0.5 text-xs font-bold', d > 0 ? 'bg-emerald-400/10 text-emerald-200' : 'bg-rose-400/10 text-rose-200')}
        >
          {STAKEHOLDER_SHORT[id]} {d > 0 ? '▲' : '▼'}
        </span>
      ))}
    </div>
  );
}

interface CardProps {
  title: string;
  icon: LucideIcon;
  description: string;
  benefit: string;
  tradeoff: string;
  stakeholders: Partial<Record<StakeholderId, number>>;
  action: GameAction;
  done?: boolean;
  doneLabel?: string;
  level?: string;
  index: number;
  accent: string;
}

function ActionCard({ title, icon: Icon, description, benefit, tradeoff, stakeholders, action, done, doneLabel, level, index, accent }: CardProps) {
  const game = useGame();
  const perform = useGameStore((s) => s.perform);
  const reason = validateAction(game, action);
  const cost = getActionCost(game, action);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035 }}
      className={cn('glass flex flex-col p-4', done && 'border-emerald-400/25')}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${accent}1f`, color: accent }}>
          <Icon size={18} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-display font-semibold text-white">{title}</h4>
          {level && <div className="text-xs font-semibold text-ink-300">{level}</div>}
        </div>
        {done && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-semibold text-emerald-200">
            <Check size={12} aria-hidden /> {doneLabel ?? 'Active'}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-ink-200">{description}</p>
      <p className="mt-2 text-sm text-emerald-200/90">
        <span className="font-semibold">Effect:</span> {benefit}
      </p>
      <p className="mt-1 text-sm text-amber-200/80">
        <span className="font-semibold">Trade-off:</span> {tradeoff}
      </p>
      <div className="mt-3 flex flex-1 items-end justify-between gap-2">
        <StakeholderReactions deltas={stakeholders} />
        {!done && (
          <Button size="sm" variant="secondary" disabled={!!reason} onClick={() => perform(action)} className="shrink-0">
            {fmtCost(cost)}
          </Button>
        )}
      </div>
      {!done && <DisabledReason className="mt-2 text-right" reasons={[reason]} />}
    </motion.div>
  );
}

export function StrategyPanel() {
  const game = useGame();
  return (
    <section aria-labelledby="strategy-title" className="space-y-8">
      <div>
        <h2 id="strategy-title" className="text-xl font-bold text-white">
          Strategy
        </h2>
        <p className="text-sm text-ink-300">
          Guardrails let you move fast safely. Change management turns deployments into adoption. Board management buys you time.
        </p>
      </div>

      <div>
        <h3 className="label-caps mb-3 flex items-center gap-2">
          <ShieldCheck size={14} aria-hidden /> Governance & guardrails ({game.policies.length}/{POLICY_ORDER.length})
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {POLICY_ORDER.map((id, i) => {
            const def = POLICIES[id];
            return (
              <ActionCard
                key={id}
                index={i}
                title={def.name}
                icon={ShieldCheck}
                accent={PALETTE.hue.rose}
                description={def.description}
                benefit={def.benefit}
                tradeoff={def.tradeoff}
                stakeholders={def.stakeholders}
                action={{ type: 'policy', policy: id }}
                done={game.policies.includes(id)}
              />
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="label-caps mb-3 flex items-center gap-2">
          <GraduationCap size={14} aria-hidden /> Change, board & team
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {INITIATIVE_ORDER.map((id, i) => {
            const def = INITIATIVES[id];
            const done =
              (id === 'kpi' && game.kpiDashboard) ||
              (id === 'literacy' && game.literacy >= 3) ||
              (id === 'hire' && game.hires + pendingHires(game) >= 3);
            const level =
              id === 'literacy'
                ? `Level ${game.literacy}/3`
                : id === 'hire'
                  ? `${game.hires} squad${game.hires === 1 ? '' : 's'}${pendingHires(game) ? ` (+${pendingHires(game)} joining next quarter)` : ''}`
                  : id === 'demoday' || id === 'expectations'
                    ? `Executive hype: ${Math.round(game.hype * 100)}%`
                    : undefined;
            return (
              <ActionCard
                key={id}
                index={i + POLICY_ORDER.length}
                title={def.name}
                icon={INITIATIVE_ICONS[id]}
                accent={def.group === 'change' ? PALETTE.hue.pink : def.group === 'board' ? PALETTE.hue.violet : PALETTE.hue.sky}
                description={def.description}
                benefit={def.benefit}
                tradeoff={def.tradeoff}
                stakeholders={def.stakeholders}
                action={{ type: 'initiative', initiative: id }}
                done={done}
                doneLabel={id === 'literacy' ? 'Maxed' : id === 'hire' ? 'Cap reached' : 'Active'}
                level={level}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
