import { AnimatePresence, motion } from 'motion/react';
import type { Participant } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Skeleton } from '../ui/Skeleton';

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
        {sorted.length === 1 && (
          // The state the host is *actually* in while waiting. The zero case
          // below is nearly unreachable — whoever scanned the receipt is a
          // participant too, so this card shows "(1)" from the moment the room
          // exists, and a bare avatar with no prompt reads as "nothing to do".
          <p className="ms-1 self-center text-sm text-brand-sand/55">
            רק אתם כאן — שתפו את הקוד כדי שיצטרפו
          </p>
        )}

        {sorted.length === 0 && (
          // Placeholder slots rather than a line of text: this is the screen
          // where the host sits waiting for friends to scan, so the empty state
          // should look like it's listening, and should show the shape of what
          // is about to arrive.
          <div className="flex items-center gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-2.5 w-8" />
              </div>
            ))}
            <p className="ms-1 text-sm text-brand-sand/50">ממתינים למצטרפים...</p>
          </div>
        )}
      </div>
    </div>
  );
}
