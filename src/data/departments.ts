import type { DeptId, StakeholderId } from '@/engine/types';

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
    color: '#6fa8c9',
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    head: 'Elliot Marsh',
    headTitle: 'Group Controller',
    blurb: 'Closes the books in 14 days. Mostly in Excel. Some of it on paper.',
    sponsor: 'cfo',
    color: '#6db894',
  },
  legal: {
    id: 'legal',
    name: 'Legal',
    head: 'Helena Ford',
    headTitle: 'Deputy General Counsel',
    blurb: 'Eleven lawyers, 3,600 contracts a year, zero appetite for embarrassment.',
    sponsor: 'ciso',
    color: '#a29ad4',
  },
  hr: {
    id: 'hr',
    name: 'People & HR',
    head: 'Jamal Brooks',
    headTitle: 'Head of Talent',
    blurb: '9,000 employees, 40k applicants a year, and a benefits FAQ that is 94 pages long.',
    sponsor: 'chro',
    color: '#cf8db0',
  },
  engineering: {
    id: 'engineering',
    name: 'Engineering & IT',
    head: 'Lin Zhou',
    headTitle: 'VP Engineering',
    blurb: '280 engineers maintaining systems older than most of the engineers.',
    sponsor: 'cto',
    color: '#8e96d2',
  },
  sales: {
    id: 'sales',
    name: 'Sales',
    head: 'Trevor Banks',
    headTitle: 'Chief Revenue Officer',
    blurb: '160 reps who love closing deals and hate updating the CRM.',
    sponsor: 'ceo',
    color: '#d6ab5e',
  },
  operations: {
    id: 'operations',
    name: 'Operations & Supply Chain',
    head: 'Maria Santos',
    headTitle: 'VP Supply Chain',
    blurb: '14 warehouses, 2,300 suppliers, and a forecasting process best described as "vibes".',
    sponsor: 'coo',
    color: '#d49763',
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    head: 'Chloe Bennett',
    headTitle: 'Chief Marketing Officer',
    blurb: 'Wants to be "AI-first" by next week. Brand guidelines last updated in 2017.',
    sponsor: 'ceo',
    color: '#d68a92',
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
