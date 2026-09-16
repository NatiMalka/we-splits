import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Heart, Share2 } from 'lucide-react';
import { useShare } from '../../hooks/useShare';
import { ICON_SWAP, LABEL_SWAP } from '../ui/iconSwap';

const APP_URL = 'https://we-splits.web.app';
const PITCH = 'חילקנו את החשבון במסעדה בלי מחשבון ובלי כאב ראש — שווה לנסות:';

/** Tell-a-friend, at the one moment people just had a good experience with the app. */
export function ShareAppButton() {
  const { outcome, share } = useShare();

  const label =
    outcome === 'shared'
      ? { key: 'shared', icon: <Check size={18} />, text: 'תודה על השיתוף!' }
      : outcome === 'copied'
        ? { key: 'copied', icon: <Copy size={18} />, text: 'הלינק הועתק' }
        : outcome === 'failed'
          ? { key: 'failed', icon: <Share2 size={18} />, text: 'לא הצלחנו לשתף — נסו שוב' }
          : { key: 'idle', icon: <Heart size={18} />, text: 'שתפו את מתחלקים עם חברים' };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => share({ text: PITCH, url: APP_URL, title: 'מתחלקים' })}
      className="glass-card inline-flex w-full items-center justify-center gap-2 py-3.5 text-base font-semibold text-brand-sand"
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
