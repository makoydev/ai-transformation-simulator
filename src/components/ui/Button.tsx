import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-gradient text-white shadow-glow hover:brightness-110 disabled:shadow-none',
  secondary: 'bg-white/6 text-ink-100 border border-white/10 hover:bg-white/10 hover:border-white/20',
  ghost: 'text-ink-200 hover:bg-white/6 hover:text-white',
  danger: 'bg-rose-500/15 text-rose-200 border border-rose-400/30 hover:bg-rose-500/25',
  success: 'bg-[#6db894] text-ink-950 hover:bg-[#7cc3a0] shadow-[0_6px_20px_-10px_rgba(109,184,148,0.35)]',
  warning: 'bg-amber-400/15 text-amber-100 border border-amber-300/30 hover:bg-amber-400/25',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', className, children, icon, disabled, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  );
});
