import { motion } from 'motion/react';
import { useCountUp } from '../../hooks/useCountUp';
import { formatCurrency } from '../../lib/format';

export function SummaryTotalCard({ total }: { total: number }) {
  const animated = useCountUp(total, 0.9);

  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ delay: 0.9, duration: 0.35 }}
      className="glass-card flex flex-col items-center gap-1 p-8 text-center"
    >
      <p className="text-sm text-brand-sand/60">סה"כ לתשלום</p>
      <p className="bg-gradient-to-l from-brand-amber-400 to-brand-coral-400 bg-clip-text text-5xl font-extrabold text-transparent">
        {formatCurrency(animated)}
      </p>
    </motion.div>
  );
}
