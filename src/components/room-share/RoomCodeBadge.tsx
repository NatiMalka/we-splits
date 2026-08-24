import { motion } from 'motion/react';

export function RoomCodeBadge({ code }: { code: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5" dir="ltr">
      {code.split('').map((char, i) => (
        <motion.div
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: -8, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
          className="glass-card flex h-11 w-9 items-center justify-center text-xl font-bold text-brand-amber-300"
        >
          {char}
        </motion.div>
      ))}
    </div>
  );
}
