import { motion } from 'framer-motion';
import { BookOpen, Globe } from 'lucide-react';
import { VerdictBadge } from '@/components/ui/Verdict';
import { LESSON_CATEGORIES, LESSON_MAP } from '@/data/lessons';
import type { Debrief } from '@/engine/types';
import { cn } from '@/lib/cn';
import { VERDICT_META } from '@/lib/labels';

/** The learning loop: why a decision worked or failed, plus the real-world parallel. */
export function DebriefCard({ debrief, className, compact = false }: { debrief: Debrief; className?: string; compact?: boolean }) {
  const lesson = debrief.lessonId ? LESSON_MAP[debrief.lessonId] : undefined;
  const meta = VERDICT_META[debrief.verdict];
  return (
    <div className={cn('rounded-2xl border p-4', meta.ring, meta.bg, className)}>
      <div className="flex flex-wrap items-center gap-2">
        <VerdictBadge verdict={debrief.verdict} />
        <span className="label-caps">Debrief</span>
      </div>
      <h4 className="mt-2 font-display text-lg font-semibold text-white">{debrief.title}</h4>
      <p className={cn('mt-1.5 text-sm leading-relaxed text-ink-100', compact && 'line-clamp-4')}>{debrief.insight}</p>
      {debrief.realWorld && !compact && (
        <div className="mt-3 flex gap-2 rounded-xl bg-ink-950/40 p-3 text-xs leading-relaxed text-ink-200">
          <Globe size={14} className="mt-0.5 shrink-0 text-brand-cyan" aria-hidden />
          <div>
            <div className="mb-0.5 font-semibold text-brand-cyan">In the real world</div>
            {debrief.realWorld}
          </div>
        </div>
      )}
      {lesson && !compact && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-3 flex items-start gap-2 rounded-xl border border-white/10 bg-white/4 p-3"
        >
          <BookOpen size={16} className="mt-0.5 shrink-0" style={{ color: LESSON_CATEGORIES[lesson.category].color }} aria-hidden />
          <div className="text-xs">
            <div className="font-semibold text-white">
              Playbook: {lesson.title}
              <span className="ml-1.5 font-normal text-ink-400">· {LESSON_CATEGORIES[lesson.category].label}</span>
            </div>
            <div className="mt-0.5 text-ink-200">{lesson.principle}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
