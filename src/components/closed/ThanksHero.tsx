import { motion } from 'motion/react';
import { PartyPopper } from 'lucide-react';

export function ThanksHero({ restaurantName }: { restaurantName: string | null }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-amber-500 to-brand-coral-500 text-brand-charcoal"
      >
        <PartyPopper size={38} strokeWidth={2} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-1.5"
      >
        <h1 className="text-2xl font-extrabold text-brand-sand">החשבון נסגר!</h1>
        <p className="text-brand-sand/60">
          {restaurantName ? `תודה שהתחלקתם ב${restaurantName}` : 'תודה שהתחלקתם'}
        </p>
      </motion.div>
    </div>
  );
}
