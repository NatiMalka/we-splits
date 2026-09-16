import { AnimatePresence, motion } from 'motion/react';
import { Check, Circle } from 'lucide-react';
import { ICON_SWAP, LABEL_SWAP } from '../ui/iconSwap';

interface PaidToggleButtonProps {
  paid: boolean;
  onToggle: (paid: boolean) => void;
}

export function PaidToggleButton({ paid, onToggle }: PaidToggleButtonProps) {
  const key = paid ? 'paid' : 'unpaid';

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => onToggle(!paid)}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-6 py-3.5 text-base font-semibold transition-colors ${
        paid
          ? 'border-brand-teal-500/40 bg-brand-teal-500/15 text-brand-teal-300'
          : 'border-white/10 bg-white/6 text-brand-sand/70'
      }`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={key} {...ICON_SWAP} className="flex">
          {paid ? <Check size={18} /> : <Circle size={18} />}
        </motion.span>
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={key} {...LABEL_SWAP}>
          {paid ? 'סימנתי ששילמתי' : 'עדיין לא שילמתי'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
