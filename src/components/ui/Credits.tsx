import { Github } from 'lucide-react';
import { cn } from '@/lib/cn';

const REPO_URL = 'https://github.com/makoydev/ai-transformation-simulator';
const AUTHOR = { name: 'Michael Mendoza', url: 'https://github.com/makoydev' };

const link = 'inline-flex items-center gap-1.5 py-2 underline-offset-2 hover:text-white hover:underline';

/** Where the code lives and who made it, at the foot of the title and end screens. */
export function Credits({ className }: { className?: string }) {
  return (
    <footer className={cn('flex flex-wrap items-center justify-center gap-x-2 text-xs text-ink-400', className)}>
      <a href={REPO_URL} target="_blank" rel="noreferrer" className={link}>
        <Github size={13} aria-hidden /> Source on GitHub
      </a>
      <span aria-hidden>·</span>
      <span>
        Made by{' '}
        <a href={AUTHOR.url} target="_blank" rel="noreferrer" className={link}>
          {AUTHOR.name}
        </a>
      </span>
    </footer>
  );
}
