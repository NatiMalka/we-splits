import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { Spinner } from './Spinner';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'className'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
  /**
   * Work is in flight. Blocks further taps and shows a spinner, but — unlike
   * `disabled` — keeps the button at full opacity: the button that creates a
   * room used to signal a live Firestore write by dimming 60% and nothing else,
   * which reads as "broken", not "working".
   */
  loading?: boolean;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-l from-brand-amber-500 to-brand-coral-500 text-brand-charcoal shadow-lg shadow-brand-amber-500/20',
  secondary: 'glass-card text-brand-sand',
  ghost: 'text-brand-sand/80 hover:text-brand-sand',
};

/** Inherits the button's own text colour so it works on every variant. */
const SPINNER_CLASS = 'text-current';

export function Button({
  children,
  variant = 'primary',
  fullWidth,
  disabled,
  loading,
  ...rest
}: ButtonProps) {
  // A loading button must not be tappable either, or a double-tap fires the
  // handler twice — which is how a guest could join a room twice.
  const inert = disabled || loading;

  return (
    <motion.button
      whileTap={inert ? undefined : { scale: 0.96 }}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold transition-opacity ${VARIANT_CLASSES[variant]} ${fullWidth ? 'w-full' : ''} ${inert ? 'cursor-not-allowed' : ''} ${disabled && !loading ? 'opacity-40' : ''}`}
      disabled={inert}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size={17} className={SPINNER_CLASS} />}
      {children}
    </motion.button>
  );
}
