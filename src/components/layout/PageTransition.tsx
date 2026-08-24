import type { ReactNode } from 'react';
import { motion } from 'motion/react';

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
