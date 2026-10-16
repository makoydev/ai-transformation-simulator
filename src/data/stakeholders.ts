import type { StakeholderId } from '@/engine/types';

export interface StakeholderDef {
  id: StakeholderId;
  name: string;
  initials: string;
  title: string;
  archetype: string;
  catchphrase: string;
  loves: string;
  hates: string;
  /** Influence on the board's view of you. */
  weight: number;
  color: string;
}

export const STAKEHOLDERS: Record<StakeholderId, StakeholderDef> = {
  ceo: {
    id: 'ceo',
    name: 'Victoria Hale',
    initials: 'VH',
    title: 'Chief Executive Officer',
    archetype: 'The Visionary',
    catchphrase: '“Can we make it agentic?”',
    loves: 'Launches, demo days, anything she can mention on an earnings call.',
    hates: 'Hearing "next fiscal year".',
    weight: 1.5,
    color: '#a29ad4',
  },
  cfo: {
    id: 'cfo',
    name: 'Marcus Delgado',
    initials: 'MD',
    title: 'Chief Financial Officer',
    archetype: 'The ROI Hawk',
    catchphrase: '“What\'s the payback period?”',
    loves: 'Measured ROI, killed zombie projects, cheap fixes that work.',
    hates: 'Pilots that never end. Consultants. Surprises on the cloud bill.',
    weight: 1.5,
    color: '#6db894',
  },
  ciso: {
    id: 'ciso',
    name: 'Priya Raman',
    initials: 'PR',
    title: 'CISO & Chief Risk Officer',
    archetype: 'The Guardian',
    catchphrase: '“Who approved this vendor?”',
    loves: 'Policies, audits, human-in-the-loop, reading the terms of service.',
    hates: 'Autonomous agents with admin rights. Shadow AI.',
    weight: 1,
    color: '#d68a92',
  },
  coo: {
    id: 'coo',
    name: 'Doug Brenner',
    initials: 'DB',
    title: 'Chief Operating Officer',
    archetype: 'The Skeptic',
    catchphrase: '“We tried blockchain in 2018.”',
    loves: 'Practical fixes, fewer steps, things that work on the warehouse floor.',
    hates: 'Buzzwords. Being told his processes are "legacy".',
    weight: 1,
    color: '#d49763',
  },
  chro: {
    id: 'chro',
    name: 'Aiko Tanaka',
    initials: 'AT',
    title: 'Chief People Officer',
    archetype: 'The People Champion',
    catchphrase: '“How do I explain this to the night shift?”',
    loves: 'Training, transparency, champions, reskilling commitments.',
    hates: 'Leaked "headcount opportunity" slides.',
    weight: 1,
    color: '#cf8db0',
  },
  cto: {
    id: 'cto',
    name: 'Sam Okafor',
    initials: 'SO',
    title: 'Chief Technology Officer',
    archetype: 'The Builder',
    catchphrase: '“We could build that in a weekend.”',
    loves: 'Building in-house, new models, hiring engineers.',
    hates: 'Vendor lock-in. Review boards. Being told to just buy it.',
    weight: 1,
    color: '#6fa8c9',
  },
};

export const STAKEHOLDER_ORDER: StakeholderId[] = ['ceo', 'cfo', 'ciso', 'coo', 'chro', 'cto'];
