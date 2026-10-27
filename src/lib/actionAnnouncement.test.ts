import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, type GameAction, type GameState } from '@/engine';
import { actionAnnouncement } from './actionAnnouncement';

const planning = (): GameState => ({ ...createInitialState('lumen', 'Test', 3), phase: 'planning', pendingEvents: [] });
const say = (s: GameState, action: GameAction) => actionAnnouncement(s, applyAction(s, action), action);

describe('actionAnnouncement', () => {
  it('names the action, its costs and the capacity left', () => {
    const s = planning();
    expect(say(s, { type: 'audit', dept: 'finance' })).toMatch(/^Audited Finance: 3 use cases revealed\. Budget −\$50K(, [^.]+)?\. 2 of 3 capacity left\.$/);
  });

  it('describes a pilot launch by approach and use case', () => {
    const s = applyAction(planning(), { type: 'audit', dept: 'operations' });
    const text = say(s, { type: 'launchPilot', useCaseId: 'ops-demand', approach: 'predictive' });
    expect(text).toMatch(/^Predictive ML pilot launched for Demand Forecasting\. Budget −\$\d+K/);
    expect(text).toMatch(/1 of 3 capacity left\.$/);
  });

  it('names a policy once, without repeating it as a change', () => {
    const text = say(planning(), { type: 'policy', policy: 'aup' });
    expect(text.match(/Acceptable Use/g)).toHaveLength(1);
  });
});
