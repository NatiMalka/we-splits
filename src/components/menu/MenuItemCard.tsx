import { motion } from 'motion/react';
import { Layers } from 'lucide-react';
import type { BillItem } from '../../types';
import { formatCurrency } from '../../lib/format';
import { ParticipantAvatarStack } from './ParticipantAvatarStack';

interface MenuItemCardProps {
  item: BillItem;
  claimantNames: string[];
  isClaimedByMe: boolean;
  onToggleClaim: () => void;
  onOpenQuantitySplit: () => void;
}

export function MenuItemCard({
  item,
  claimantNames,
  isClaimedByMe,
  onToggleClaim,
  onOpenQuantitySplit,
}: MenuItemCardProps) {
  const isMultiUnit = item.quantity > 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 backdrop-blur-xl transition-colors ${
        isClaimedByMe
          ? 'border-brand-teal-500/40 bg-brand-teal-500/15'
          : 'border-white/10 bg-white/6'
      }`}
    >
      <button type="button" onClick={onToggleClaim} className="flex flex-1 items-center gap-3 text-start">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-brand-sand">
            {item.name}
            {isMultiUnit && <span className="ms-1.5 text-xs text-brand-sand/40">× {item.quantity}</span>}
          </p>
          <p className="text-sm text-brand-sand/50">{formatCurrency(item.price)}</p>
        </div>
        <ParticipantAvatarStack names={claimantNames} />
      </button>

      {isMultiUnit && (
        <button
          type="button"
          onClick={onOpenQuantitySplit}
          aria-label="פצל כמות"
          className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-brand-sand/70"
        >
          <Layers size={16} />
        </button>
      )}
    </motion.div>
  );
}
