import { ChevronDown, Gauge, HeartPulse, PiggyBank, ShieldAlert, TrendingUp, Users, Wallet, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Meter } from '@/components/ui/Meter';
import { BALANCE, sel } from '@/engine';
import { cn } from '@/lib/cn';
import { fmtMoney, fmtRoi, fmtSigned } from '@/lib/format';
import { moraleLabel } from '@/lib/labels';
import { useGame } from '@/store/gameStore';
import { DeltaFloats, MetricTile } from './MetricTile';
import { FLASH_RING, useDeltaFloats } from './useDeltaFloats';
import { PALETTE } from '@/lib/palette';

/** Reserved status colors: always paired with a text label, never color alone. */
export const RISK_STATUS = {
  Low: { color: PALETTE.status.low, label: 'Low' },
  Moderate: { color: PALETTE.status.moderate, label: 'Moderate' },
  High: { color: PALETTE.status.high, label: 'High' },
  Critical: { color: PALETTE.status.critical, label: 'Critical' },
} as const;

const points = (v: number) => `${Math.round(v)}`;
const signedPoints = (d: number) => fmtSigned(d);
const money = (v: number) => fmtMoney(v);
const signedMoney = (d: number) => fmtMoney(d, { sign: true });

interface CompactProps {
  label: string;
  value: number;
  format: (v: number) => string;
  formatDelta: (d: number) => string;
  icon: LucideIcon;
  accent: string;
  higherIsBetter?: boolean;
  epsilon?: number;
  /** Shown in place of the number, e.g. a risk level. */
  display?: React.ReactNode;
  valueClassName?: string;
  className?: string;
}

/** One cell of the compact phone scoreboard, with the same floating deltas as the full tiles. */
function CompactMetric({ label, value, format, formatDelta, icon: Icon, accent, higherIsBetter = true, epsilon = 0.5, display, valueClassName, className }: CompactProps) {
  const { floats, flash } = useDeltaFloats(value, epsilon, higherIsBetter);
  return (
    <span className={cn('relative min-w-0 rounded-lg px-1 py-0.5 transition-shadow duration-300', flash && FLASH_RING[flash], className)}>
      <span className="flex items-center gap-1 text-xs font-medium text-ink-300">
        <Icon size={11} style={{ color: accent }} className="shrink-0" aria-hidden />
        <span className="truncate">{label}</span>
      </span>
      <span className={cn('block truncate text-sm font-semibold text-white', valueClassName)}>
        {display ?? <AnimatedNumber value={value} format={format} />}
      </span>
      <DeltaFloats floats={floats} formatDelta={formatDelta} higherIsBetter={higherIsBetter} className="-top-1 right-0" />
    </span>
  );
}

export function MetricsBar() {
  const game = useGame();
  const m = useMemo(() => {
    const runRate = sel.runRate(game);
    const risk = sel.totalRisk(game);
    return {
      runRate,
      expected: sel.expectedRunRate(game),
      perceived: runRate * sel.measuredFactor(game),
      roi: sel.roi(game),
      adoption: sel.avgAdoption(game),
      risk,
      riskLevel: sel.riskLevel(risk),
      costs: sel.quarterlyCosts(game).total,
      live: sel.productionProjects(game).length,
    };
  }, [game]);

  const riskStatus = RISK_STATUS[m.riskLevel];
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {/* Phones: one row with the numbers that matter most (value/quarter only from 360px). Tapping it shows all seven tiles.
          Trust and risk are short, so they take the width they need ("Moderate" never truncates) and the money columns share the rest. */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-controls="metric-tiles"
        className="glass grid w-full grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-0.5 rounded-xl px-1.5 py-2 text-left min-[360px]:grid-cols-[repeat(2,minmax(0,1fr))_auto_auto_auto] sm:hidden"
      >
        <CompactMetric label="Budget" value={game.budget} format={money} formatDelta={signedMoney} epsilon={0.005} icon={Wallet} accent={PALETTE.metric.budget} />
        <CompactMetric
          label="Value/q"
          value={m.runRate}
          format={money}
          formatDelta={signedMoney}
          epsilon={0.005}
          icon={PiggyBank}
          accent={PALETTE.metric.value}
          className="hidden min-[360px]:block"
        />
        <CompactMetric
          label="Trust"
          value={game.trust}
          format={points}
          formatDelta={signedPoints}
          icon={Gauge}
          accent={PALETTE.metric.trust}
          valueClassName={game.trust < BALANCE.warningThreshold ? 'text-rose-300' : undefined}
        />
        <CompactMetric
          label="Risk"
          value={m.risk}
          format={points}
          formatDelta={signedPoints}
          higherIsBetter={false}
          icon={ShieldAlert}
          accent={riskStatus.color}
          display={
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: riskStatus.color }} aria-hidden />
              {riskStatus.label}
            </span>
          }
        />
        <span className="flex h-8 w-7 items-center justify-center text-ink-300">
          <ChevronDown size={16} className={cn('transition-transform', expanded && 'rotate-180')} aria-hidden />
          <span className="sr-only">{expanded ? 'Hide' : 'Show'} all metrics</span>
        </span>
      </button>

      <div id="metric-tiles" className={cn('mt-2 grid-cols-2 gap-2 sm:mt-0 sm:grid sm:grid-cols-4 xl:grid-cols-7', expanded ? 'grid' : 'hidden')}>
        <MetricTile
          label="Budget"
          value={game.budget}
          format={money}
          formatDelta={signedMoney}
          epsilon={0.005}
          icon={Wallet}
          accent={PALETTE.metric.budget}
          sub={m.costs > 0 ? `${fmtMoney(m.costs)}/q run costs` : 'No run costs yet'}
          tooltip="Cash available this quarter. The board allocates more each quarter, and more when trust is high. Production systems, licenses, and hires carry recurring run costs. Overspending costs trust."
        />
        <MetricTile
          label="Value / quarter"
          value={m.runRate}
          format={money}
          formatDelta={signedMoney}
          epsilon={0.005}
          icon={PiggyBank}
          accent={PALETTE.metric.value}
          sub={m.expected > 0 ? `Board target ${fmtMoney(m.expected)}` : 'No target yet (honeymoon)'}
          tooltip={
            <>
              Business value your live systems generate per quarter at current adoption. The board compares it to a target
              that rises every quarter and is inflated by executive hype.
              {!game.kpiDashboard && (
                <span className="mt-1 block text-amber-200">
                  Without a KPI dashboard the board only credits about 65% of it ({fmtMoney(m.perceived)}).
                </span>
              )}
            </>
          }
        >
          <Meter
            value={m.expected > 0 ? Math.min(m.perceived / m.expected, 1.5) : 0}
            max={1.5}
            marker={1}
            color={PALETTE.metric.value}
            label="Value the board sees versus target"
          />
        </MetricTile>
        <MetricTile
          label="ROI to date"
          value={m.roi}
          format={fmtRoi}
          formatDelta={(d) => `${fmtSigned(d, 2)}x`}
          epsilon={0.01}
          icon={TrendingUp}
          accent={PALETTE.metric.roi}
          sub={`${fmtMoney(game.cumulativeValue)} value / ${fmtMoney(game.cumulativeSpend)} spent`}
          tooltip="Cumulative value delivered divided by cumulative spend. Expect a J-curve: spend comes first, value follows adoption."
        />
        <MetricTile
          label="Adoption"
          value={m.adoption}
          format={(v) => `${Math.round(v)}%`}
          formatDelta={signedPoints}
          icon={Users}
          accent={PALETTE.metric.adoption}
          sub={`${m.live} live system${m.live === 1 ? '' : 's'}`}
          tooltip="Average share of intended users actually using your production systems. Value scales with adoption, so deployment alone is worth nothing. Training, champions, and morale speed it up."
        >
          <Meter value={m.adoption} color={PALETTE.metric.adoption} label="Adoption" />
        </MetricTile>
        <MetricTile
          label="Risk exposure"
          value={m.risk}
          format={points}
          formatDelta={signedPoints}
          higherIsBetter={false}
          icon={ShieldAlert}
          accent={riskStatus.color}
          sub={
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: riskStatus.color }} aria-hidden />
              {riskStatus.label} risk
            </span>
          }
          tooltip="Shadow AI and vendor exposure plus each system's blast radius (approach × sensitivity), reduced by governance and HITL. Higher risk means a higher chance of an incident each quarter. Above 60, the board gets nervous."
        >
          <Meter value={m.risk} color={riskStatus.color} label="Risk exposure" />
        </MetricTile>
        <MetricTile
          label="Board trust"
          value={game.trust}
          format={points}
          formatDelta={signedPoints}
          icon={Gauge}
          accent={PALETTE.metric.trust}
          sub={game.trust < BALANCE.warningThreshold ? 'Danger zone' : 'Fired below 15'}
          tooltip="Your job security. Reviewed every quarter: value vs. expectations, executive support, PoC purgatory, risk, and budget discipline. Drop below 15 and you're out."
        >
          <Meter value={game.trust} color={PALETTE.metric.trust} marker={BALANCE.fireThreshold} label="Board trust" />
        </MetricTile>
        <MetricTile
          label="Morale"
          value={game.morale}
          format={points}
          formatDelta={signedPoints}
          icon={HeartPulse}
          accent={PALETTE.metric.morale}
          sub={moraleLabel(game.morale)}
          tooltip="How employees feel about AI. Fear slows adoption everywhere; transparency, training, and champions build it."
          className="col-span-2 sm:col-span-1"
        >
          <Meter value={game.morale} color={PALETTE.metric.morale} label="Morale" />
        </MetricTile>
      </div>
    </div>
  );
}
