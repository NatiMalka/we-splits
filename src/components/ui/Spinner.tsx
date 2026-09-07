import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SpinnerProps {
  size?: number;
  /** Override the colour — an amber spinner is invisible on an amber button. */
  className?: string;
}

export function Spinner({ size = 24, className = 'text-brand-amber-400' }: SpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, ease: 'linear', duration: 0.9 }}
      className={`inline-flex ${className}`}
    >
      <Loader2 size={size} />
    </motion.div>
  );
}
