// Axis tops that split into four even, readable gridlines (1 → 0.25s, 3 → 0.75s, 6 → 1.5s).
const STEPS = [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10];

/** The smallest "nice" axis maximum at or above v, so the data fills most of the chart. */
export function niceMax(v: number): number {
  if (v <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = STEPS.find((s) => s * pow >= v - 1e-9) ?? 10;
  return Number((step * pow).toPrecision(6));
}
