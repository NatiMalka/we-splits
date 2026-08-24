import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const STATUS_LINES = ['סורק את החשבונית...', 'מזהה פריטים...', 'מחשב מחירים...'];

export function AnalyzingOverlay() {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((i) => Math.min(i + 1, STATUS_LINES.length - 1));
    }, 650);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-brand-charcoal/80 backdrop-blur-md"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 1.6 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-amber-500 to-brand-coral-500 text-brand-charcoal"
      >
        <Sparkles size={28} />
      </motion.div>

      <motion.p
        key={lineIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-medium text-brand-sand"
      >
        {STATUS_LINES[lineIndex]}
      </motion.p>

      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-brand-amber-500 to-brand-coral-500"
          initial={{ width: '0%' }}
          animate={{ width: '92%' }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}
