import { describe, expect, it } from 'vitest';
import { reviewTips, trustLosses } from './advice';
import { clamp } from './selectors';
import { createInitialState } from './state';
import { idleBot, playGame } from './testing/bots';
import type { QuarterReport, TrustFactor } from './types';

describe('reviewTips', () => {
  const s = createInitialState('pemberton', 'Test', 1);
  // The initial state has no report yet; build one with only the fields the tips read.
  const base = { quarter: 2, factors: [] } as unknown as QuarterReport;
  const report = (factors: TrustFactor[]): QuarterReport => ({ ...base, factors });

  it('picks the biggest losses first, at most two', () => {
    const tips = reviewTips(
      report([
        { kind: 'support', label: 'Executive team is skeptical', delta: -1 },
        { kind: 'value', label: 'Value below expectations', delta: -6 },
        { kind: 'governance', label: 'Confidence in AI governance', delta: 1 },
        { kind: 'purgatory', label: 'PoC purgatory', delta: -4 },
      ]),
      s,
    );
    expect(tips.map((t) => t.kind)).toEqual(['value', 'purgatory']);
    expect(tips.every((t) => t.tip.length > 0)).toBe(true);
  });

  it('suggests using the honeymoon when nothing was lost', () => {
    const tips = reviewTips(report([{ kind: 'honeymoon', label: 'Honeymoon period', delta: 2 }]), s);
    expect(tips.map((t) => t.kind)).toEqual(['honeymoon']);
  });

  it('ignores factors from older saves that have no kind', () => {
    expect(reviewTips(report([{ label: 'Value below expectations', delta: -6 }]), s)).toEqual([]);
  });

  it('points a value shortfall with nothing live at production', () => {
    const [t] = reviewTips(report([{ kind: 'value', label: 'Value below expectations', delta: -6 }]), s);
    expect(t.tip).toMatch(/into production/);
  });
});

describe('trustLosses', () => {
  it('explains a firing with the biggest net losses', () => {
    const final = playGame(idleBot, createInitialState('pemberton', 'bot', 7));
    expect(final.outcome).toBe('fired');
    const losses = trustLosses(final);
    expect(losses.length).toBeGreaterThan(0);
    expect(losses.length).toBeLessThanOrEqual(3);
    expect(losses.every((l) => l.delta < 0)).toBe(true);
    expect([...losses].sort((a, b) => a.delta - b.delta)).toEqual(losses);
    // An idle player never ships anything, so falling short on value is among the reasons.
    expect(losses.some((l) => l.kind === 'value' || l.kind === 'missStreak')).toBe(true);
  });

  it('records each review in history so the factors add up', () => {
    const final = playGame(idleBot, createInitialState('pemberton', 'bot', 7));
    for (const h of final.history) {
      const sum = h.factors!.reduce((a, f) => a + f.delta, 0);
      expect(h.trust).toBe(clamp(Math.round(h.trustBefore! + sum)));
    }
  });

  it('is empty for saves from before factors were kept', () => {
    const final = playGame(idleBot, createInitialState('pemberton', 'bot', 7));
    const old = { ...final, history: final.history.map(({ factors: _f, trustBefore: _t, ...h }) => h) };
    expect(trustLosses(old)).toEqual([]);
  });
});
