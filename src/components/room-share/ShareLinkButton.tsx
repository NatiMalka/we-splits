import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy } from 'lucide-react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { ICON_SWAP, LABEL_SWAP } from '../ui/iconSwap';

export function ShareLinkButton({ url }: { url: string }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(url)}
      // The colour is the static half of the feedback: motion alone would leave
      // nothing on screen for anyone who has reduced motion turned on.
      className={`glass-card flex w-full items-center justify-center gap-2 py-3.5 text-base font-semibold transition-colors ${
        copied ? 'text-brand-teal-300' : 'text-brand-sand'
      }`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={copied ? 'check' : 'copy'} {...ICON_SWAP} className="flex">
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </motion.span>
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={copied ? 'check' : 'copy'} {...LABEL_SWAP}>
          {copied ? 'הועתק!' : 'העתק לינק לשיתוף'}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
