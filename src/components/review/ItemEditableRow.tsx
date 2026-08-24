import { Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { BillItem } from '../../types';
import { formatCurrency } from '../../lib/format';

interface ItemEditableRowProps {
  item: BillItem;
  onChange: (item: BillItem) => void;
  onRemove: (itemId: string) => void;
}

export function ItemEditableRow({ item, onChange, onRemove }: ItemEditableRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 border-b border-white/5 py-3 last:border-0"
    >
      <input
        value={item.name}
        onChange={(e) => onChange({ ...item, name: e.target.value })}
        className="min-w-0 flex-1 bg-transparent text-base text-brand-sand outline-none placeholder:text-brand-sand/30"
        placeholder="שם המנה"
      />
      <input
        type="number"
        min={1}
        value={item.quantity}
        onChange={(e) => onChange({ ...item, quantity: Math.max(1, Number(e.target.value) || 1) })}
        className="w-12 rounded-lg border border-white/10 bg-white/5 py-1 text-center text-sm text-brand-sand outline-none"
      />
      <input
        type="number"
        min={0}
        value={item.price}
        onChange={(e) => onChange({ ...item, price: Math.max(0, Number(e.target.value) || 0) })}
        className="w-16 rounded-lg border border-white/10 bg-white/5 py-1 text-center text-sm text-brand-sand outline-none"
      />
      <span className="w-14 shrink-0 text-start text-sm text-brand-sand/50">
        {formatCurrency(item.price * item.quantity)}
      </span>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label="מחק מנה"
        className="shrink-0 text-brand-coral-400/70 hover:text-brand-coral-400"
      >
        <Trash2 size={18} />
      </button>
    </motion.div>
  );
}
