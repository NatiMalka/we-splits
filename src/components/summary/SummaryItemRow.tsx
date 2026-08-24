import { motion } from 'motion/react';
import { formatCurrency } from '../../lib/format';

export function SummaryItemRow({ name, units, amount, index }: { name: string; units: number; amount: number; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between border-b border-white/5 py-2.5 last:border-0"
    >
      <span className="text-brand-sand/80">
        {name}
        {units !== 1 && <span className="ms-1.5 text-xs text-brand-sand/40">× {units}</span>}
      </span>
      <span className="font-medium text-brand-sand">{formatCurrency(amount)}</span>
    </motion.div>
  );
}
