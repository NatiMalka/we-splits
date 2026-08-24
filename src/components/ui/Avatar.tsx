import { motion } from 'motion/react';
import { colorFromName, initialFromName } from '../../lib/colorFromName';

interface AvatarProps {
  name: string;
  size?: number;
  animate?: boolean;
}

export function Avatar({ name, size = 32, animate = true }: AvatarProps) {
  const color = colorFromName(name);

  return (
    <motion.div
      initial={animate ? { scale: 0 } : false}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      title={name}
      className="flex items-center justify-center rounded-full border-2 border-brand-charcoal font-bold text-brand-charcoal"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
    >
      {initialFromName(name)}
    </motion.div>
  );
}
