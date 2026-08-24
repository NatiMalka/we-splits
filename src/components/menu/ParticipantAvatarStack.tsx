import { AnimatePresence, motion } from 'motion/react';
import { Avatar } from '../ui/Avatar';

export function ParticipantAvatarStack({ names }: { names: string[] }) {
  if (names.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2 space-x-reverse">
      <AnimatePresence>
        {names.map((name) => (
          <motion.div key={name} layout>
            <Avatar name={name} size={26} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
