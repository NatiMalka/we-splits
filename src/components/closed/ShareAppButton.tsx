import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Heart, Share2 } from 'lucide-react';
import { useShare } from '../../hooks/useShare';

const APP_URL = 'https://we-splits.web.app';
const PITCH = 'חילקנו את החשבון במסעדה בלי מחשבון ובלי כאב ראש — שווה לנסות:';

/** Tell-a-friend, at the one moment people just had a good experience with the app. */
export function ShareAppButton() {
  const { outcome, share } = useShare();

  const label =
    outcome === 'shared'
      ? { icon: <Check size={18} />, text: 'תודה על השיתוף!' }
      : outcome === 'copied'
        ? { icon: <Copy size={18} />, text: 'הלינק הועתק' }
        : outcome === 'failed'
          ? { icon: <Share2 size={18} />, text: 'לא הצלחנו לשתף — נסו שוב' }
          : { icon: <Heart size={18} />, text: 'שתפו את מתחלקים עם חברים' };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => share({ text: PITCH, url: APP_URL, title: 'מתחלקים' })}
      className="glass-card inline-flex w-full items-center justify-center gap-2 py-3.5 text-base font-semibold text-brand-sand"
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
