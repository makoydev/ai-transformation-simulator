/**
 * Public engine API. The engine is pure TypeScript with no React
 * dependencies: every function takes a GameState and returns a new one.
 */
export * from './types';
export { BALANCE } from './balance';
export { createInitialState, SAVE_VERSION } from './state';
export { applyAction, getActionCost, validateAction, initiativeCost, pendingHires } from './actions';
export { endQuarter, beginNextQuarter } from './turn';
export { resolveEvent, currentEvent, isChoiceAvailable } from './events';
export { computeFinalScore, determineArchetype, computeBadges, shareText, ARCHETYPES } from './scoring';
export { diffStates, STAKEHOLDER_SHORT, type Change } from './diff';
export { adviceFor, reviewTips, trustLosses, type BoardTip, type LossKind } from './advice';
export * as sel from './selectors';
