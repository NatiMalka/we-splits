import { motion } from 'motion/react';
import { Wallet } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { formatCurrency } from '../../lib/format';

interface RemainingToCollectCardProps {
  remainingAmount: number;
  unpaidCount: number;
}

export function RemainingToCollectCard({ remainingAmount, unpaidCount }: RemainingToCollectCardProps) {
  const animated = useCountUp(remainingAmount, 0.5);
  const settled = remainingAmount <= 0;

  return (
    <motion.div
      layout
      className={`glass-card flex items-center justify-between gap-3 p-4 ${settled ? 'border-brand-teal-500/30' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            settled ? 'bg-brand-teal-500/20 text-brand-teal-300' : 'bg-brand-amber-500/20 text-brand-amber-300'
          }`}
        >
          <Wallet size={20} />
        </div>
        <div>
          <p className="text-sm text-brand-sand/60">נותר לגבות</p>
          <p className="text-xs text-brand-sand/40">
            {settled ? 'כולם שילמו' : `${unpaidCount} סועדים עדיין לא שילמו`}
          </p>
        </div>
      </div>
      <span className={`text-xl font-bold ${settled ? 'text-brand-teal-300' : 'text-brand-sand'}`}>
        {formatCurrency(animated)}
      </span>
    </motion.div>
  );
}
