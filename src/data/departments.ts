import type { DeptId, StakeholderId } from '@/engine/types';
import { PALETTE } from '@/lib/palette';

export interface DepartmentDef {
  id: DeptId;
  name: string;
  head: string;
  headTitle: string;
  blurb: string;
  /** Executive who cares most about this department's results. */
  sponsor: StakeholderId;
  color: string;
}

export const DEPARTMENTS: Record<DeptId, DepartmentDef> = {
  support: {
    id: 'support',
    name: 'Customer Support',
    head: 'Rosa Kim',
    headTitle: 'VP Customer Care',
    blurb: '420 agents, 1.1M tickets a year, and a knowledge base nobody can find anything in.',
    sponsor: 'coo',
    color: PALETTE.hue.sky,
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    head: 'Elliot Marsh',
    headTitle: 'Group Controller',
    blurb: 'Closes the books in 14 days. Mostly in Excel. Some of it on paper.',
    sponsor: 'cfo',
    color: PALETTE.hue.green,
  },
  legal: {
    id: 'legal',
    name: 'Legal',
    head: 'Helena Ford',
    headTitle: 'Deputy General Counsel',
    blurb: 'Eleven lawyers, 3,600 contracts a year, zero appetite for embarrassment.',
    sponsor: 'ciso',
    color: PALETTE.hue.violet,
  },
  hr: {
    id: 'hr',
    name: 'People & HR',
    head: 'Jamal Brooks',
    headTitle: 'Head of Talent',
    blurb: '9,000 employees, 40k applicants a year, and a benefits FAQ that is 94 pages long.',
    sponsor: 'chro',
    color: PALETTE.hue.pink,
  },
  engineering: {
    id: 'engineering',
    name: 'Engineering & IT',
    head: 'Lin Zhou',
    headTitle: 'VP Engineering',
    blurb: '280 engineers maintaining systems older than most of the engineers.',
    sponsor: 'cto',
    color: PALETTE.hue.indigo,
  },
  sales: {
    id: 'sales',
    name: 'Sales',
    head: 'Trevor Banks',
    headTitle: 'Chief Revenue Officer',
    blurb: '160 reps who love closing deals and hate updating the CRM.',
    sponsor: 'ceo',
    color: PALETTE.hue.amber,
  },
  operations: {
    id: 'operations',
    name: 'Operations & Supply Chain',
    head: 'Maria Santos',
    headTitle: 'VP Supply Chain',
    blurb: '14 warehouses, 2,300 suppliers, and a forecasting process best described as "vibes".',
    sponsor: 'coo',
    color: PALETTE.hue.orange,
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    head: 'Chloe Bennett',
    headTitle: 'Chief Marketing Officer',
    blurb: 'Wants to be "AI-first" by next week. Brand guidelines last updated in 2017.',
    sponsor: 'ceo',
    color: PALETTE.hue.rose,
  },
};

export const DEPT_ORDER: DeptId[] = [
  'support',
  'finance',
  'operations',
  'sales',
  'hr',
  'legal',
  'engineering',
  'marketing',
];
