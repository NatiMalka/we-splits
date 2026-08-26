import { useLayoutEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { formatCurrency } from '../../lib/format';

interface AnimatedCurrencyProps {
  value: number;
  /** Seconds. */
  duration?: number;
  className?: string;
}

/**
 * Counts a money figure up to its new value by writing straight to the DOM node.
 *
 * The previous approach put every animation frame through React state, so each
 * instance re-rendered its component tree ~60 times a second — and the summary
 * screen mounts four of them at once. That competes with touch scrolling for the
 * main thread and makes the page feel like it's fighting back.
 *
 * `useLayoutEffect` (not `useEffect`) matters here: React paints the final value
 * as children first, and the animation has to overwrite it with its starting
 * frame before the browser paints, or the number visibly jumps to the total and
 * then rewinds.
 */
export function AnimatedCurrency({ value, duration = 0.5, className = '' }: AnimatedCurrencyProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const displayedRef = useRef(value);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    if (reduceMotion || displayedRef.current === value) {
      node.textContent = formatCurrency(value);
      displayedRef.current = value;
      return;
    }

    const controls = animate(displayedRef.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        node.textContent = formatCurrency(latest);
      },
    });

    return () => {
      controls.stop();
      // Land on the real figure even if interrupted — a half-finished animation
      // must never leave a wrong amount of money on screen.
      node.textContent = formatCurrency(value);
      displayedRef.current = value;
    };
  }, [value, duration, reduceMotion]);

  // Rendered so the correct figure exists for first paint and screen readers;
  // the effect above takes over immediately after.
  return (
    <span ref={nodeRef} className={`tabular-nums ${className}`}>
      {formatCurrency(value)}
    </span>
  );
}
