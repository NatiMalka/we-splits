import { AnimatePresence, motion } from 'motion/react';
import { CheckCheck, Users } from 'lucide-react';
import { AnimatedCurrency } from '../ui/AnimatedCurrency';
import { AnimatedCheck } from '../ui/AnimatedCheck';

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
      {/* When the last person marks themselves paid the whole group crosses this
          line at once. It used to swap an animated amount for a bare "✓" text
          character with no transition at all. */}
      <AnimatePresence mode="wait" initial={false}>
        {allSettled ? (
          <motion.div
            key="settled"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="text-brand-teal-300"
          >
            <AnimatedCheck size={26} />
          </motion.div>
        ) : (
          <motion.div key="owing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AnimatedCurrency value={unpaidAmount} className="text-xl font-bold text-brand-sand" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
