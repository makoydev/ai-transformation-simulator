import type { StakeholderId, Tone, Verdict } from '@/engine/types';

export type QuipTrigger =
  | 'audit'
  | 'pilot_process'
  | 'pilot_buy'
  | 'pilot_build'
  | 'pilot_agentic'
  | 'results_success'
  | 'results_failed'
  | 'scale'
  | 'scale_no_hitl'
  | 'kill_smart'
  | 'kill_winner'
  | 'retire'
  | 'policy'
  | 'review_board'
  | 'data_sprint'
  | 'champions'
  | 'literacy'
  | 'townhall'
  | 'townhall_repeat'
  | 'demoday'
  | 'expectations'
  | 'hire'
  | 'kpi'
  | 'purgatory'
  | 'low_budget';

export interface Reaction {
  who: StakeholderId;
  tone: Tone;
  lines: string[];
}

/** Stakeholder reactions to your decisions. One reaction is chosen at random per trigger. */
export const QUIPS: Record<QuipTrigger, Reaction[]> = {
  audit: [
    { who: 'coo', tone: 'neutral', lines: ['Finally, someone who asks before building. Bring a hard hat.', 'They\'ll tell you it\'s a technology problem. It never is.'] },
    { who: 'ceo', tone: 'neutral', lines: ['Discovery is great. Can discovery be done by Friday?', 'Love the rigor. Love results more.'] },
  ],
  pilot_process: [
    { who: 'coo', tone: 'positive', lines: ['A process fix? You might be the first sane person in this building.', 'Cutting steps instead of adding robots. I could hug you. I won\'t.'] },
    { who: 'ceo', tone: 'negative', lines: ['Wait, where\'s the AI in this AI project?', 'I can\'t put "we changed a form" in a keynote.'] },
    { who: 'cfo', tone: 'positive', lines: ['Cheap, fast, measurable. My three favorite words.'] },
  ],
  pilot_buy: [
    { who: 'cto', tone: 'negative', lines: ['We could have built that. Probably. Eventually.', 'Another vendor? My team is becoming a procurement department.'] },
    { who: 'cfo', tone: 'positive', lines: ['Vendor carries the maintenance? Music to my ears.'] },
    { who: 'ciso', tone: 'neutral', lines: ['Send me the data processing agreement before anyone logs in.'] },
  ],
  pilot_build: [
    { who: 'cto', tone: 'positive', lines: ['Now we\'re talking. My team has been waiting for this.', 'Finally, a real engineering problem.'] },
    { who: 'cfo', tone: 'neutral', lines: ['Custom build. I\'ll be watching the burn rate.'] },
  ],
  pilot_agentic: [
    { who: 'ceo', tone: 'positive', lines: ['AGENTS! Can I tell the board it\'s autonomous?', 'This is the future. I can feel it.'] },
    { who: 'ciso', tone: 'negative', lines: ['An AI that takes actions on its own. In production systems. What could go wrong.', 'Please tell me it doesn\'t have write access to payments.'] },
  ],
  results_success: [
    { who: 'cfo', tone: 'positive', lines: ['Those pilot numbers are… actually good. Show me the production plan.'] },
    { who: 'ceo', tone: 'positive', lines: ['I knew it! Ship it to everyone!'] },
  ],
  results_failed: [
    { who: 'cfo', tone: 'negative', lines: ['So that didn\'t work. What\'s the plan, and what does it cost?'] },
    { who: 'coo', tone: 'neutral', lines: ['Told you. But fine, at least it was a pilot.'] },
  ],
  scale: [
    { who: 'ceo', tone: 'positive', lines: ['In production! That\'s going in my LinkedIn post.', 'This is what transformation looks like.'] },
    { who: 'cfo', tone: 'positive', lines: ['Production means real numbers. Good. Measure everything.'] },
    { who: 'coo', tone: 'neutral', lines: ['It\'s live. Now let\'s see if anyone actually uses it.'] },
  ],
  scale_no_hitl: [
    { who: 'ciso', tone: 'negative', lines: ['No human review? On THAT? I\'m drafting the incident report in advance.', 'Bold. I\'ll be updating my résumé and our cyber-insurance.'] },
  ],
  kill_smart: [
    { who: 'cfo', tone: 'positive', lines: ['You killed a project that wasn\'t working. Do you know how rare that is?', 'Sunk cost recognized. Budget reallocated. Beautiful.'] },
  ],
  kill_winner: [
    { who: 'cto', tone: 'negative', lines: ['We killed the one that WORKED? Explain it to my team, because I can\'t.'] },
    { who: 'ceo', tone: 'negative', lines: ['Wasn\'t that our success story?'] },
  ],
  retire: [
    { who: 'coo', tone: 'neutral', lines: ['Decommissioned. Somebody update the runbook.'] },
  ],
  policy: [
    { who: 'ciso', tone: 'positive', lines: ['A policy! With actual controls! I may frame this.', 'Governance before the incident, not after. Respect.'] },
    { who: 'cto', tone: 'negative', lines: ['More paperwork. Shipping velocity just dropped 4%. I measured.'] },
  ],
  review_board: [
    { who: 'ciso', tone: 'positive', lines: ['A model inventory. Regulators are going to love us.'] },
    { who: 'cto', tone: 'negative', lines: ['A review board. So now my engineers need a permission slip to ship.'] },
  ],
  data_sprint: [
    { who: 'cto', tone: 'positive', lines: ['Data cleanup. Unsexy, essential. Good call.'] },
    { who: 'ceo', tone: 'neutral', lines: ['Data plumbing. Sure. When do we get the shiny part?'] },
  ],
  champions: [
    { who: 'chro', tone: 'positive', lines: ['Champions! Peer learning beats a training video every time.', 'The champions are already running lunch-and-learns. Unprompted.'] },
  ],
  literacy: [
    { who: 'chro', tone: 'positive', lines: ['Training for everyone, not just the engineers. Thank you.', 'The night shift signed up first. Told you they were curious.'] },
    { who: 'cfo', tone: 'neutral', lines: ['Training spend. Show me it moves adoption.'] },
  ],
  townhall: [
    { who: 'chro', tone: 'positive', lines: ['People needed to hear it from you directly. The Q&A ran 40 minutes over.', 'Transparency works. The rumor mill is quiet for once.'] },
  ],
  townhall_repeat: [
    { who: 'chro', tone: 'neutral', lines: ['Another town hall already? People are starting to tune out.'] },
  ],
  demoday: [
    { who: 'ceo', tone: 'positive', lines: ['THAT is what I\'m talking about. The board was on its feet!', 'Can we do one every month?'] },
    { who: 'cfo', tone: 'negative', lines: ['Great demo. Now the board expects that in production by next quarter.'] },
  ],
  expectations: [
    { who: 'cfo', tone: 'positive', lines: ['Realistic targets. The board respects that more than they\'ll admit.'] },
    { who: 'ceo', tone: 'negative', lines: ['You talked the board DOWN? Whose side are you on?'] },
  ],
  hire: [
    { who: 'cto', tone: 'positive', lines: ['New engineers! I\'ve already cleared desks for them.', 'Real capacity. Now we can actually ship.'] },
    { who: 'cfo', tone: 'neutral', lines: ['Headcount is a recurring cost. Make it pay for itself.'] },
  ],
  kpi: [
    { who: 'cfo', tone: 'positive', lines: ['Baselines and a KPI dashboard. You speak my language.', 'Measured value. Finally, numbers I can defend in the boardroom.'] },
  ],
  purgatory: [
    { who: 'cfo', tone: 'negative', lines: ['Pilots that finished last quarter and still no decision? That\'s PoC purgatory.', 'Every quarter a pilot sits there, it\'s a cost with no return.'] },
  ],
  low_budget: [
    { who: 'cfo', tone: 'negative', lines: ['You\'re over budget. The board noticed. So did I.'] },
  ],
};

export const BOARD_QUOTES: Record<Verdict, string[]> = {
  great: [
    'The board is genuinely impressed. Someone used the word "exemplary". Out loud.',
    '"This is the first AI update that came with numbers instead of adjectives."',
    'The chair asked if you could brief the other portfolio companies.',
  ],
  good: [
    '"Solid progress. Keep the momentum, and keep it measurable."',
    'Nods around the table. The CFO only asked two follow-up questions.',
    '"We\'re cautiously optimistic, which for this board is a standing ovation."',
  ],
  mixed: [
    '"We hear a lot about potential. We\'d like to hear more about results."',
    'Polite silence. One director checked their phone during your ROI slide.',
    '"The strategy makes sense. The returns don\'t yet."',
  ],
  bad: [
    '"We\'re concerned. Very concerned. We\'ll be watching next quarter closely."',
    'The chair asked to "set up a quick sync" afterwards. That\'s never good.',
    '"Our competitors seem to be getting value from AI. Why aren\'t we?"',
  ],
};
