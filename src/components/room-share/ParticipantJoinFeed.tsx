import { AnimatePresence, motion } from 'motion/react';
import type { Participant } from '../../types';
import { Avatar } from '../ui/Avatar';

export function ParticipantJoinFeed({ participants }: { participants: Participant[] }) {
  const sorted = [...participants].sort((a, b) => a.joinedAt - b.joinedAt);

  return (
    <div className="glass-card flex flex-col gap-3 p-4">
      <p className="text-sm font-medium text-brand-sand/60">הצטרפו לחדר ({sorted.length})</p>
      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {sorted.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="flex flex-col items-center gap-1"
            >
              <Avatar name={p.name} size={40} />
              <span className="max-w-[3.5rem] truncate text-xs text-brand-sand/70">{p.name}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {sorted.length === 0 && <p className="text-sm text-brand-sand/40">עדיין אין מצטרפים...</p>}
      </div>
    </div>
  );
}
