import { motion } from 'motion/react';

export function ProgressBar({ ratio }: { ratio: number }) {
  const clamped = Math.min(1, Math.max(0, ratio));
  const color = clamped >= 1 ? 'var(--color-brand-teal-300)' : 'var(--color-brand-amber-500)';

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped * 100}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  );
}
