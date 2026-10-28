import type { Change } from '@/engine';

const MINUS = '−';

/** $1.25M / $450K, with optional explicit sign. Values are in $M. */
export function fmtMoney(v: number, opts: { sign?: boolean } = {}): string {
  const abs = Math.abs(v);
  const sign = v < -0.0005 ? MINUS : opts.sign && v > 0.0005 ? '+' : '';
  if (abs >= 1) return `${sign}$${abs.toFixed(abs >= 10 ? 1 : 2)}M`;
  const k = Math.round(abs * 1000);
  return k === 0 ? '$0' : `${sign}$${k}K`;
}

export function fmtSigned(v: number, digits = 0): string {
  const rounded = Number(v.toFixed(digits));
  if (rounded > 0) return `+${rounded.toFixed(digits)}`;
  if (rounded < 0) return `${MINUS}${Math.abs(rounded).toFixed(digits)}`;
  return (0).toFixed(digits);
}

/** One cost format everywhere: "$350K · 1 capacity", "$100K", "1 capacity" or "Free". */
export function fmtCost(cost: { budget: number; capacity: number }): string {
  const parts: string[] = [];
  if (cost.budget > 0) parts.push(fmtMoney(cost.budget));
  if (cost.capacity > 0) parts.push(`${cost.capacity} capacity`);
  return parts.length ? parts.join(' · ') : 'Free';
}

export const fmtRoi = (v: number): string => `${v.toFixed(2)}x`;

export const fmtPct = (v: number): string => `${Math.round(v)}%`;

export function quarterLabel(q: number): string {
  return `Q${((q - 1) % 4) + 1} · Year ${Math.ceil(q / 4)}`;
}

/** One change from a decision: "Budget −$720K", "Board trust +2", "+ Acceptable Use Policy". */
export function fmtChange(c: Change): string {
  switch (c.format) {
    case 'money':
      return `${c.label} ${fmtMoney(c.delta, { sign: true })}`;
    case 'percent':
      return `${c.label} ${fmtSigned(c.delta)}%`;
    case 'flag':
      return `+ ${c.label}`;
    default:
      return `${c.label} ${fmtSigned(c.delta)}`;
  }
}
