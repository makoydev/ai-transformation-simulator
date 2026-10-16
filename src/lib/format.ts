const MINUS = '−';

/** $1.25M / $450K, with optional explicit sign. Values are in $M. */
export function fmtMoney(v: number, opts: { sign?: boolean } = {}): string {
  const abs = Math.abs(v);
  const sign = v < -0.0005 ? MINUS : opts.sign && v > 0.0005 ? '+' : '';
  if (abs >= 1) return `${sign}$${abs.toFixed(abs >= 10 ? 1 : 2)}M`;
  return `${sign}$${Math.round(abs * 1000)}K`;
}

export function fmtSigned(v: number, digits = 0): string {
  const rounded = Number(v.toFixed(digits));
  if (rounded > 0) return `+${rounded.toFixed(digits)}`;
  if (rounded < 0) return `${MINUS}${Math.abs(rounded).toFixed(digits)}`;
  return (0).toFixed(digits);
}

export const fmtRoi = (v: number): string => `${v.toFixed(2)}x`;

export const fmtPct = (v: number): string => `${Math.round(v)}%`;

export function quarterLabel(q: number): string {
  return `Q${((q - 1) % 4) + 1} · Year ${Math.ceil(q / 4)}`;
}
