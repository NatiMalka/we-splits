import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { formatCurrency } from '../../lib/format';
import type { ParticipantTotal } from '../../lib/calc/splitEngine';

interface LiveTotalsDrawerProps {
  myTotal: ParticipantTotal | undefined;
  allTotals: { name: string; total: number }[];
}

export function LiveTotalsDrawer({ myTotal, allTotals }: LiveTotalsDrawerProps) {
  const [expanded, setExpanded] = useState(false);
  const animatedTotal = useCountUp(myTotal?.total ?? 0, 0.35);

  return (
    <motion.div layout className="glass-card-solid sticky bottom-0 mt-3 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <span className="text-sm text-brand-sand/60">הסכום שלי</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-brand-sand">{formatCurrency(animatedTotal)}</span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
            <ChevronUp size={18} className="text-brand-sand/50" />
          </motion.div>
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex flex-col gap-2 px-5 pb-4"
        >
          {allTotals.map((p) => (
            <div key={p.name} className="flex items-center justify-between text-sm">
              <span className="text-brand-sand/70">{p.name}</span>
              <span className="font-medium text-brand-sand/90">{formatCurrency(p.total)}</span>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
