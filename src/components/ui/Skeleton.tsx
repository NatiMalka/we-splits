/**
 * A grey placeholder shape. Deliberately CSS-only (`.skeleton` in index.css):
 * skeletons are shown while a route chunk is still downloading, which is exactly
 * when the motion/react runtime may not have parsed yet.
 *
 * `aria-hidden` because the shapes are decorative — the surrounding loading
 * state owns the announcement via role="status".
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`skeleton ${className}`} />;
}
