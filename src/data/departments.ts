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
    color: '#38bdf8',
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    head: 'Elliot Marsh',
    headTitle: 'Group Controller',
    blurb: 'Closes the books in 14 days. Mostly in Excel. Some of it on paper.',
    sponsor: 'cfo',
    color: '#34d399',
  },
  legal: {
    id: 'legal',
    name: 'Legal',
    head: 'Helena Ford',
    headTitle: 'Deputy General Counsel',
    blurb: 'Eleven lawyers, 3,600 contracts a year, zero appetite for embarrassment.',
    sponsor: 'ciso',
    color: '#a78bfa',
  },
  hr: {
    id: 'hr',
    name: 'People & HR',
    head: 'Jamal Brooks',
    headTitle: 'Head of Talent',
    blurb: '9,000 employees, 40k applicants a year, and a benefits FAQ that is 94 pages long.',
    sponsor: 'chro',
    color: '#f472b6',
  },
  engineering: {
    id: 'engineering',
    name: 'Engineering & IT',
    head: 'Lin Zhou',
    headTitle: 'VP Engineering',
    blurb: '280 engineers maintaining systems older than most of the engineers.',
    sponsor: 'cto',
    color: '#818cf8',
  },
  sales: {
    id: 'sales',
    name: 'Sales',
    head: 'Trevor Banks',
    headTitle: 'Chief Revenue Officer',
    blurb: '160 reps who love closing deals and hate updating the CRM.',
    sponsor: 'ceo',
    color: '#fbbf24',
  },
  operations: {
    id: 'operations',
    name: 'Operations & Supply Chain',
    head: 'Maria Santos',
    headTitle: 'VP Supply Chain',
    blurb: '14 warehouses, 2,300 suppliers, and a forecasting process best described as "vibes".',
    sponsor: 'coo',
    color: '#fb923c',
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    head: 'Chloe Bennett',
    headTitle: 'Chief Marketing Officer',
    blurb: 'Wants to be "AI-first" by next week. Brand guidelines last updated in 2017.',
    sponsor: 'ceo',
    color: '#fb7185',
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
