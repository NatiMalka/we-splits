import { motion, useReducedMotion } from 'motion/react';

const COLORS = ['#F5A524', '#F06449', '#4FA69E', '#FBBF4A', '#C1502E'];

// Fixed values rather than Math.random(): a re-render must not reshuffle the
// confetti mid-flight, and this stays deterministic across devices.
const PIECES = [
  { left: 6, delay: 0, drift: 14, size: 9 },
  { left: 18, delay: 0.25, drift: -10, size: 7 },
  { left: 29, delay: 0.1, drift: 18, size: 11 },
  { left: 41, delay: 0.42, drift: -6, size: 8 },
  { left: 52, delay: 0.06, drift: 12, size: 10 },
  { left: 63, delay: 0.33, drift: -16, size: 7 },
  { left: 74, delay: 0.17, drift: 8, size: 12 },
  { left: 84, delay: 0.5, drift: -12, size: 8 },
  { left: 93, delay: 0.28, drift: 6, size: 10 },
];

/** Purely decorative — hidden entirely when the OS asks for reduced motion. */
export function Confetti() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PIECES.map((piece, i) => (
        <motion.span
          key={i}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: '105vh', opacity: [0, 1, 1, 0], rotate: 420, x: piece.drift }}
          transition={{ duration: 3.2, delay: piece.delay, ease: 'easeIn' }}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 0.5,
            backgroundColor: COLORS[i % COLORS.length],
          }}
        />
      ))}
    </div>
  );
}
