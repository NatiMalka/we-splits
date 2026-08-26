import { motion } from 'motion/react';
import { AnimatedCurrency } from '../ui/AnimatedCurrency';

export function SummaryTotalCard({ total }: { total: number }) {
  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ delay: 0.9, duration: 0.35 }}
      className="glass-card flex flex-col items-center gap-1 p-8 text-center"
    >
      <p className="text-sm text-brand-sand/60">סה"כ לתשלום</p>
      <AnimatedCurrency
        value={total}
        duration={0.9}
        className="bg-gradient-to-l from-brand-amber-400 to-brand-coral-400 bg-clip-text text-5xl font-extrabold text-transparent"
      />
    </motion.div>
  );
}
