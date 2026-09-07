import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  detail?: string;
  /** Give the user somewhere to go — an empty state with no exit is a dead end. */
  action?: { label: string; onClick: () => void };
}

/**
 * Before this the app had exactly one empty state in the whole codebase, so
 * several screens showed a bare "0 ₪" or an empty card and left the user to
 * guess whether that was the answer or a bug.
 */
export function EmptyState({ icon, title, detail, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card flex flex-col items-center gap-3 p-8 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/6 text-brand-sand/50">
        {icon}
      </div>
      <div>
        <p className="font-medium text-brand-sand">{title}</p>
        {detail && <p className="mt-1 text-sm text-brand-sand/60">{detail}</p>}
      </div>
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
