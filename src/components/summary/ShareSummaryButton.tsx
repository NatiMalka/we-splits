import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Share2 } from 'lucide-react';
import { useShare } from '../../hooks/useShare';

export function ShareSummaryButton({ text }: { text: string }) {
  const { outcome, share } = useShare();

  const label =
    outcome === 'shared'
      ? { icon: <Check size={18} />, text: 'נשלח!' }
      : outcome === 'copied'
        ? { icon: <Copy size={18} />, text: 'הועתק — הדביקו בוואטסאפ' }
        : outcome === 'failed'
          ? { icon: <Share2 size={18} />, text: 'לא הצלחנו לשתף — נסו שוב' }
          : { icon: <Share2 size={18} />, text: 'שתף את הסיכום שלי' };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => share({ text, title: 'הסיכום שלי' })}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-brand-amber-500 to-brand-coral-500 px-6 py-4 text-base font-bold text-brand-charcoal"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label.text}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          className="flex items-center gap-2"
        >
          {label.icon} {label.text}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
