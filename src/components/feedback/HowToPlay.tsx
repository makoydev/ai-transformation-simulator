import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Briefcase, Gauge, Search, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/cn';
import { useGameStore } from '@/store/gameStore';

interface Slide {
  icon: LucideIcon;
  title: string;
  body: React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    icon: Briefcase,
    title: 'You are the new Head of AI Transformation',
    body: (
      <>
        <p>
          The CEO hired you to transform a traditional company with AI. You have <b>8 quarters</b> (two years), a budget, a
          small team, and six executives with very different opinions.
        </p>
        <p className="mt-2">
          Deliver real business value, keep risk under control, and bring people along, <b>without getting fired.</b>
        </p>
      </>
    ),
  },
  {
    icon: Search,
    title: 'Discover → Triage → Pilot → Scale or Kill',
    body: (
      <ul className="space-y-1.5">
        <li>
          <b>Audit</b> departments on the Org Map to uncover use cases and their data readiness.
        </li>
        <li>
          <b>Triage</b> each one: read the clues and pick an approach: Process Redesign, Buy, RAG, Agentic, Fine-tune, or
          Predictive ML. Some "AI problems" are really process problems.
        </li>
        <li>
          <b>Pilot</b> it. When results arrive, <b>scale</b> it to production, <b>iterate</b>, or <b>kill</b> it. Pilots left
          undecided fall into <b>PoC purgatory</b> and drain board trust.
        </li>
      </ul>
    ),
  },
  {
    icon: Gauge,
    title: 'Each quarter: spend capacity, then face the board',
    body: (
      <ul className="space-y-1.5">
        <li>
          Most actions cost <b>1 team capacity</b> plus budget. You start with 3 per quarter; hiring adds more.
        </li>
        <li>
          At quarter end, live systems deliver value <b>at the rate people adopt them</b>, run costs are paid, and the board
          compares your value to a rising target.
        </li>
        <li>
          <b>Board trust below 15 = fired.</b> Executive hype inflates the target, and unmeasured value only gets partial credit.
        </li>
      </ul>
    ),
  },
  {
    icon: ShieldCheck,
    title: 'Governance and people are not optional',
    body: (
      <ul className="space-y-1.5">
        <li>
          <b>Risk exposure</b> rises with shadow AI and with each system's blast radius. High risk triggers incidents:
          hallucinations, prompt injection, bias scandals.
        </li>
        <li>
          Policies and <b>human-in-the-loop</b> review cut risk. Training, champions, and honest communication raise
          <b> morale</b> and <b>adoption</b>.
        </li>
        <li>Every quarter brings a crisis, opportunity, or dilemma. Choose wisely.</li>
      </ul>
    ),
  },
  {
    icon: BookOpen,
    title: 'Learn from every decision',
    body: (
      <>
        <p>
          After major decisions and every crisis, you'll get a <b>Debrief</b>: why it worked or failed, and the real-world
          case it echoes.
        </p>
        <p className="mt-2">
          Each debrief unlocks a principle in your <b>Playbook</b>, and there are 36 to collect. At the end you'll get a
          scorecard, a grade, and your leadership archetype.
        </p>
      </>
    ),
  },
];

export function HowToPlay() {
  const open = useGameStore((s) => s.howTo);
  const setHowTo = useGameStore((s) => s.setHowTo);
  const transition = useGameStore((s) => s.transition);
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const Icon = slide.icon;
  const close = () => {
    setHowTo(false);
    setI(0);
  };

  return (
    <Modal open={open && !transition} onClose={close} size="md" label="How to play" z={60}>
      <div className="p-6 sm:p-8">
        <div className="label-caps">How to play · {i + 1}/{SLIDES.length}</div>
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
            <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
              <Icon size={24} className="text-white" aria-hidden />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">{slide.title}</h2>
            <div className="mt-3 text-sm leading-relaxed text-ink-200 [&_b]:text-white">{slide.body}</div>
          </motion.div>
        </AnimatePresence>
        <div className="mt-6 flex items-center gap-2">
          <div className="flex gap-1.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={cn('h-1.5 rounded-full transition-all', idx === i ? 'w-6 bg-brand-cyan' : 'w-1.5 bg-white/20')}
              />
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            {i > 0 && (
              <Button variant="ghost" onClick={() => setI(i - 1)} icon={<ArrowLeft size={16} />}>
                Back
              </Button>
            )}
            {i < SLIDES.length - 1 ? (
              <Button variant="primary" onClick={() => setI(i + 1)} icon={<ArrowRight size={16} />}>
                Next
              </Button>
            ) : (
              <Button variant="primary" onClick={close}>
                Let's go
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
