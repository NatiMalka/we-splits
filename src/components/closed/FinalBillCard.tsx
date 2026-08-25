import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import { Avatar } from '../ui/Avatar';

interface FinalBillRow {
  participantId: string;
  name: string;
  total: number;
  paid: boolean;
}

interface FinalBillCardProps {
  rows: FinalBillRow[];
  restaurantName: string | null;
  myParticipantId: string;
}

export function FinalBillCard({ rows, restaurantName, myParticipantId }: FinalBillCardProps) {
  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);
  const owing = rows.filter((r) => r.total > 0);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } } }}
      className="glass-card flex flex-col gap-1 p-5"
    >
      <motion.p
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="pb-2 text-sm font-medium text-brand-sand/50"
      >
        {restaurantName ?? 'החשבון'} · סיכום סופי
      </motion.p>

      {owing.map((row) => (
        <motion.div
          key={row.participantId}
          variants={{ hidden: { opacity: 0, x: 12 }, show: { opacity: 1, x: 0 } }}
          className="flex items-center justify-between gap-3 border-b border-white/5 py-2.5 last:border-0"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar name={row.name} size={28} animate={false} />
            <span className="truncate text-brand-sand/85">
              {row.name}
              {row.participantId === myParticipantId && (
                <span className="ms-1.5 text-xs text-brand-amber-300">(אני)</span>
              )}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {row.paid && <Check size={15} className="text-brand-teal-300" />}
            <span className="font-semibold text-brand-sand tabular-nums">{formatCurrency(row.total)}</span>
          </div>
        </motion.div>
      ))}

      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="mt-2 flex items-center justify-between border-t border-white/10 pt-3"
      >
        <span className="font-semibold text-brand-sand/80">סה"כ</span>
        <span className="text-xl font-extrabold text-brand-sand tabular-nums">{formatCurrency(grandTotal)}</span>
      </motion.div>
    </motion.div>
  );
}
