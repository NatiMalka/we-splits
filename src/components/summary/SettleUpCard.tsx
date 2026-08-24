import { motion } from 'motion/react';
import { CheckCheck, Users } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { formatCurrency } from '../../lib/format';

interface SettleUpCardProps {
  unpaidAmount: number;
  paidCount: number;
  owingCount: number;
}

/**
 * Neutral by design: shows the group how far along they are, without implying
 * anyone is collecting from anyone.
 */
export function SettleUpCard({ unpaidAmount, paidCount, owingCount }: SettleUpCardProps) {
  const animated = useCountUp(unpaidAmount, 0.5);
  const allSettled = owingCount > 0 && paidCount >= owingCount;

  if (owingCount === 0) return null;

  return (
    <motion.div
      layout
      className={`glass-card flex items-center justify-between gap-3 p-4 ${allSettled ? 'border-brand-teal-500/30' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            allSettled ? 'bg-brand-teal-500/20 text-brand-teal-300' : 'bg-brand-amber-500/20 text-brand-amber-300'
          }`}
        >
          {allSettled ? <CheckCheck size={20} /> : <Users size={20} />}
        </div>
        <div>
          <p className="text-sm text-brand-sand/60">
            {allSettled ? 'הכל סגור' : 'טרם שולם'}
          </p>
          <p className="text-xs text-brand-sand/40">
            {paidCount} מתוך {owingCount} סימנו ששילמו
          </p>
        </div>
      </div>
      <span className={`text-xl font-bold ${allSettled ? 'text-brand-teal-300' : 'text-brand-sand'}`}>
        {allSettled ? '✓' : formatCurrency(animated)}
      </span>
    </motion.div>
  );
}
