import { describe, expect, it } from 'vitest';
import { SCENARIO_ORDER } from '@/data/scenarios';
import { computeFinalScore } from './scoring';
import { roi } from './selectors';
import { createInitialState } from './state';
import { expertBot, idleBot, playGame, randomBot, type Bot } from './testing/bots';
import type { ScenarioId } from './types';

const SEEDS = Array.from({ length: 24 }, (_, i) => 1000 + i * 7919);

function runMany(bot: Bot, scenario: ScenarioId) {
  return SEEDS.map((seed) => {
    const final = playGame(bot, createInitialState(scenario, 'bot', seed));
    const score = computeFinalScore(final);
    return { final, score };
  });
}

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

describe('game balance (bot playthroughs)', () => {
  for (const scenario of SCENARIO_ORDER) {
    describe(scenario, () => {
      const expert = runMany(expertBot, scenario);
      const random = runMany(randomBot, scenario);
      const idle = runMany(idleBot, scenario);

      it('logs a balance summary', () => {
        const summary = (name: string, runs: typeof expert) => ({
          bot: name,
          survived: runs.filter((r) => r.final.outcome === 'completed').length,
          avgScore: Math.round(avg(runs.map((r) => r.score.total))),
          avgValue: avg(runs.map((r) => r.final.cumulativeValue)).toFixed(2),
          avgRoi: avg(runs.map((r) => roi(r.final))).toFixed(2),
          avgTrust: Math.round(avg(runs.map((r) => r.final.trust))),
          grades: runs.map((r) => r.score.grade).join(''),
        });
        console.table([summary('expert', expert), summary('random', random), summary('idle', idle)]);
        expect(true).toBe(true);
      });

      it('an expert usually survives all 8 quarters', () => {
        const survived = expert.filter((r) => r.final.outcome === 'completed').length;
        expect(survived / SEEDS.length).toBeGreaterThanOrEqual(0.8);
      });

      it('an expert scores far better than a random player', () => {
        expect(avg(expert.map((r) => r.score.total))).toBeGreaterThan(avg(random.map((r) => r.score.total)) + 150);
      });

      it('an idle player gets fired', () => {
        const fired = idle.filter((r) => r.final.outcome === 'fired').length;
        expect(fired / SEEDS.length).toBeGreaterThanOrEqual(0.9);
      });

      it('an expert delivers positive ROI', () => {
        expect(avg(expert.map((r) => roi(r.final)))).toBeGreaterThan(1);
      });
    });
  }
});
