import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'className'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-l from-brand-amber-500 to-brand-coral-500 text-brand-charcoal shadow-lg shadow-brand-amber-500/20',
  secondary: 'glass-card text-brand-sand',
  ghost: 'text-brand-sand/80 hover:text-brand-sand',
};

export function Button({ children, variant = 'primary', fullWidth, disabled, ...rest }: ButtonProps) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold transition-opacity ${VARIANT_CLASSES[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
