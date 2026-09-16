import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Share2 } from 'lucide-react';
import { useShare } from '../../hooks/useShare';
import { ICON_SWAP, LABEL_SWAP } from '../ui/iconSwap';

export function ShareSummaryButton({ text }: { text: string }) {
  const { outcome, share } = useShare();

  const label =
    outcome === 'shared'
      ? { key: 'shared', icon: <Check size={18} />, text: 'נשלח!' }
      : outcome === 'copied'
        ? { key: 'copied', icon: <Copy size={18} />, text: 'הועתק — הדביקו בוואטסאפ' }
        : outcome === 'failed'
          ? { key: 'failed', icon: <Share2 size={18} />, text: 'לא הצלחנו לשתף — נסו שוב' }
          : { key: 'idle', icon: <Share2 size={18} />, text: 'שתף את הסיכום שלי' };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => share({ text, title: 'הסיכום שלי' })}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-brand-amber-500 to-brand-coral-500 px-6 py-4 text-base font-bold text-brand-charcoal"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={label.key} {...ICON_SWAP} className="flex">
          {label.icon}
        </motion.span>
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={label.key} {...LABEL_SWAP}>
          {label.text}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
