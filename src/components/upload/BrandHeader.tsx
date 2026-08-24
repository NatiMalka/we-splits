import { motion } from 'motion/react';
import { Receipt } from 'lucide-react';

export function BrandHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex flex-col items-center gap-3 text-center"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-amber-500 to-brand-coral-500 text-brand-charcoal">
          <Receipt size={19} strokeWidth={2.2} />
        </div>
        <h1 className="text-2xl font-extrabold text-brand-sand">מתחלקים</h1>
      </div>
      <p className="max-w-[16rem] text-sm leading-relaxed text-brand-sand/55">
        כי לחשב מי אכל מה זה כאב ראש — תנו לנו לעשות את זה בשבילכם
      </p>
    </motion.div>
  );
}
