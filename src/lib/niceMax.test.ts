import { describe, expect, it } from 'vitest';
import { niceMax } from './niceMax';

describe('niceMax', () => {
  it('keeps the axis close to the data', () => {
    expect(niceMax(2.97)).toBe(3); // was 5, leaving almost half the chart empty
    expect(niceMax(3.3)).toBe(4);
    expect(niceMax(110)).toBe(120);
    expect(niceMax(0.45)).toBe(0.5);
  });

  it('returns exact steps unchanged and handles empty data', () => {
    expect(niceMax(100)).toBe(100);
    expect(niceMax(0)).toBe(1);
  });

  it('always fits the data', () => {
    for (const v of [0.07, 1.01, 7.9, 23, 999]) expect(niceMax(v)).toBeGreaterThanOrEqual(v);
  });
});
