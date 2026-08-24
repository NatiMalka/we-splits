import { useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../../lib/format';
import { Badge } from '../ui/Badge';

interface ParticipantSummaryRow {
  participantId: string;
  name: string;
  total: number;
  isHost: boolean;
  paid: boolean;
}

export function AllParticipantsSummary({ rows }: { rows: ParticipantSummaryRow[] }) {
  const [open, setOpen] = useState(false);
  const sum = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div className="glass-card overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-5 py-4">
        <span className="flex items-center gap-2 text-sm font-medium text-brand-sand/70">
          <Users size={16} /> כל הסועדים
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown size={16} className="text-brand-sand/50" />
        </motion.div>
      </button>
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex flex-col gap-2.5 px-5 pb-4">
          {rows.map((row) => (
            <div key={row.participantId} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-brand-sand/70">{row.name}</span>
                {row.isHost ? (
                  <Badge>מארח</Badge>
                ) : row.paid ? (
                  <Badge tone="teal">שולם</Badge>
                ) : (
                  <Badge>טרם שולם</Badge>
                )}
              </div>
              <span className="font-medium text-brand-sand">{formatCurrency(row.total)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-white/10 pt-2 text-sm font-semibold">
            <span className="text-brand-sand/80">סה"כ כולם</span>
            <span className="text-brand-sand">{formatCurrency(sum)}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
