import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy } from 'lucide-react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

export function ShareLinkButton({ url }: { url: string }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(url)}
      className="glass-card flex w-full items-center justify-center gap-2 py-3.5 text-base font-semibold text-brand-sand"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="flex items-center gap-2 text-brand-teal-300"
          >
            <Check size={18} /> הועתק!
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="flex items-center gap-2"
          >
            <Copy size={18} /> העתק לינק לשיתוף
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
