import { motion } from 'motion/react';

interface AnimatedCheckProps {
  size?: number;
  className?: string;
}

/**
 * A checkmark that draws itself on.
 *
 * Deliberately code and not a Lottie file: it inherits `currentColor`, scales to
 * any size, costs nothing to download, and works offline — none of which is true
 * of baked artwork. Lottie is reserved for illustration that code can't do.
 *
 * Replaces a literal "✓" text character that appeared with no transition at the
 * moment the group finished paying — the app's quietest big moment.
 */
export function AnimatedCheck({ size = 22, className = '' }: AnimatedCheckProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <motion.path
        d="M4 12.5 L9.5 18 L20 6.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </svg>
  );
}
