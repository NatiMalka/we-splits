/**
 * The one set of values every contextual icon swap in the app uses.
 *
 * Five components had each invented their own — `scale: 0.6`, no blur, no
 * explicit transition — so a state change read as a flicker rather than as one
 * glyph replacing another. 0.25 with a 4px blur is enough travel to register as
 * a swap; `bounce: 0` is deliberate, because these fire on state changes rather
 * than celebrations, and the glyph should land instead of wobbling.
 */
export const ICON_SWAP = {
  initial: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  transition: { type: 'spring', duration: 0.3, bounce: 0 },
} as const;

/**
 * Labels cross-fade on opacity alone. The same 0.25 scale that reads as a swap
 * on an 18px glyph is theatrical on a Hebrew sentence, and the two run side by
 * side inside the same button.
 */
export const LABEL_SWAP = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15, ease: 'easeOut' },
} as const;
