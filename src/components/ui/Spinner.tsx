import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, ease: 'linear', duration: 0.9 }}
      className="inline-flex text-brand-amber-400"
    >
      <Loader2 size={size} />
    </motion.div>
  );
}
