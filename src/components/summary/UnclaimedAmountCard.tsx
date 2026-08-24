import { motion } from 'motion/react';
import { PackageSearch } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { formatCurrency } from '../../lib/format';

export function UnclaimedAmountCard({ unclaimedAmount }: { unclaimedAmount: number }) {
  const animated = useCountUp(unclaimedAmount, 0.5);
  const allClaimed = unclaimedAmount <= 0.01;

  return (
    <motion.div
      layout
      className={`glass-card flex items-center justify-between gap-3 p-4 ${allClaimed ? 'border-brand-teal-500/30' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            allClaimed ? 'bg-brand-teal-500/20 text-brand-teal-300' : 'bg-brand-coral-500/20 text-brand-coral-300'
          }`}
        >
          <PackageSearch size={20} />
        </div>
        <div>
          <p className="text-sm text-brand-sand/60">טרם שויך</p>
          <p className="text-xs text-brand-sand/40">
            {allClaimed ? 'כל הפריטים שויכו למישהו' : 'יש עוד פריטים שאף אחד לא בחר'}
          </p>
        </div>
      </div>
      <span className={`text-xl font-bold ${allClaimed ? 'text-brand-teal-300' : 'text-brand-sand'}`}>
        {formatCurrency(animated)}
      </span>
    </motion.div>
  );
}
