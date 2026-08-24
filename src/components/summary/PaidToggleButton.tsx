import { AnimatePresence, motion } from 'motion/react';
import { Check, Circle } from 'lucide-react';

interface PaidToggleButtonProps {
  paid: boolean;
  onToggle: (paid: boolean) => void;
}

export function PaidToggleButton({ paid, onToggle }: PaidToggleButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => onToggle(!paid)}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-6 py-3.5 text-base font-semibold transition-colors ${
        paid
          ? 'border-brand-teal-500/40 bg-brand-teal-500/15 text-brand-teal-300'
          : 'border-white/10 bg-white/6 text-brand-sand/70'
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {paid ? (
          <motion.span key="paid" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="flex items-center gap-2">
            <Check size={18} /> סימנתי ששילמתי
          </motion.span>
        ) : (
          <motion.span key="unpaid" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="flex items-center gap-2">
            <Circle size={18} /> עדיין לא שילמתי
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
