import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'className'> {
  children: ReactNode;
  'aria-label': string;
}

export function IconButton({ children, ...rest }: IconButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      className="glass-card inline-flex h-11 w-11 items-center justify-center rounded-full text-brand-sand"
      {...rest}
    >
      {children}
    </motion.button>
  );
}
