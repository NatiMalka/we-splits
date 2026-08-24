import { AnimatePresence, motion } from 'motion/react';
import { Check, MessageCircle } from 'lucide-react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

export function CopyToWhatsAppButton({ text }: { text: string }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => copy(text)}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-brand-amber-500 to-brand-coral-500 px-6 py-4 text-base font-bold text-brand-charcoal"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span key="check" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="flex items-center gap-2">
            <Check size={18} /> הועתק! הדביקו בוואטסאפ
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="flex items-center gap-2">
            <MessageCircle size={18} /> העתק סיכום לוואטסאפ
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
