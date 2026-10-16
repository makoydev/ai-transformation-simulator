/** Shared display metadata used by several components. */
import { AlertTriangle, CheckCircle2, Sparkles, XCircle, type LucideIcon } from 'lucide-react';
import type { PilotResult, Verdict } from '@/engine/types';

export const VERDICT_META: Record<Verdict, { label: string; icon: LucideIcon; text: string; bg: string; ring: string }> = {
  great: { label: 'Excellent call', icon: Sparkles, text: 'text-emerald-300', bg: 'bg-emerald-400/10', ring: 'border-emerald-400/30' },
  good: { label: 'Good call', icon: CheckCircle2, text: 'text-sky-300', bg: 'bg-sky-400/10', ring: 'border-sky-400/30' },
  mixed: { label: 'Mixed results', icon: AlertTriangle, text: 'text-amber-300', bg: 'bg-amber-400/10', ring: 'border-amber-400/30' },
  bad: { label: 'Costly mistake', icon: XCircle, text: 'text-rose-300', bg: 'bg-rose-400/10', ring: 'border-rose-400/30' },
};

export const RESULT_STYLE: Record<PilotResult, { label: string; cls: string }> = {
  success: { label: 'Success', cls: 'border-emerald-400/50 text-emerald-300 bg-emerald-400/10' },
  mixed: { label: 'Mixed', cls: 'border-amber-300/50 text-amber-200 bg-amber-300/10' },
  failed: { label: 'Failed', cls: 'border-rose-400/50 text-rose-300 bg-rose-400/10' },
};

export function sensitivityLabel(v: number): { label: string; cls: string } {
  if (v >= 0.85) return { label: 'Critical stakes', cls: 'bg-rose-500/15 text-rose-200' };
  if (v >= 0.6) return { label: 'High stakes', cls: 'bg-orange-400/15 text-orange-200' };
  if (v >= 0.4) return { label: 'Moderate stakes', cls: 'bg-amber-300/15 text-amber-100' };
  return { label: 'Low stakes', cls: 'bg-emerald-400/15 text-emerald-200' };
}

export function dataNeedLabel(req: number): string {
  if (req === 0) return 'No data needed';
  if (req < 35) return 'Light data needs';
  if (req < 60) return 'Moderate data needs';
  return 'Heavy data needs';
}
