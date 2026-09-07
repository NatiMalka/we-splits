import { memo, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { AnalyzeStage } from '../../lib/gemini/analyzeReceipt';
import { LottiePlayer } from '../ui/LottiePlayer';
import { describeStage } from './analyzeStageCopy';

/** How often the elapsed clock ticks — only used to cross the "this is slow" line. */
const TICK_MS = 1000;

const BREATHE_ANIMATE = { opacity: [0.55, 0.85, 0.55] };
const BREATHE_TRANSITION = { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } as const;
const SHEEN_ANIMATE = { x: ['-150%', '250%'] };
const SHEEN_TRANSITION = { duration: 1.4, repeat: Infinity, ease: 'linear' } as const;

export function AnalyzingOverlay({ stage }: { stage: AnalyzeStage }) {
  const [elapsedMs, setElapsedMs] = useState(0);

  // One clock for the whole overlay, started when it mounts. Note this is
  // deliberately not reset per stage: what matters to the user is how long
  // they've been staring at the screen in total, not how long the current
  // attempt has been running.
  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => setElapsedMs(Date.now() - startedAt), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const { title, detail, progress } = describeStage(stage, elapsedMs);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-brand-charcoal/80 backdrop-blur-md"
    >
      {/* The one place in the app where illustration beats code: this is the
          longest wait in the flow, and a beam sweeping over a receipt says what
          is happening in a way a spinning icon can't. Everything else stays in
          motion/react. The old rotating tile is the fallback, so reduced motion,
          a missing file or a failed fetch all still show something. */}
      <LottiePlayer
        src="/lottie/scan.json"
        className="h-32 w-32"
        fallback={
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 1.6 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-amber-500 to-brand-coral-500 text-brand-charcoal"
          >
            <Sparkles size={28} />
          </motion.div>
        }
      />

      {/* aria-live so the stage changes — especially "we're retrying" — reach a
          screen reader instead of only being visible. */}
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-1.5">
        <AnimatePresence mode="wait">
          <motion.p
            key={title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-medium text-brand-sand"
          >
            {title}
          </motion.p>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {detail && (
            <motion.p
              key={detail}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-brand-sand/60"
            >
              {detail}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <ProgressTrack progress={progress} />
    </motion.div>
  );
}

/**
 * memo, and not just for performance: AnalyzingOverlay re-renders every second
 * (the elapsed-time ticker) plus on every stage change, but the progress bar's
 * own visual state — which of the two modes it's in, and the target percentage
 * — changes far less often. Without this, ProgressTrack re-ran on every one of
 * those ticks, which handed the indeterminate sheen's `animate`/`transition`
 * props fresh object and array literals each time. Framer read that as the
 * target changing and kept restarting the sweep from its first keyframe before
 * it ever completed a lap — the "broken, choppy, in pieces" symptom. Memoizing
 * on the values that actually matter stops the interruption at its root,
 * rather than fighting it with more object-identity tricks.
 */
const ProgressTrack = memo(function ProgressTrack({
  progress,
}: {
  progress: ReturnType<typeof describeStage>['progress'];
}) {
  return (
    <div className="relative h-2 w-52 overflow-hidden rounded-full bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
      {progress.mode === 'determinate' ? (
        <motion.div
          // key forces a clean remount across the determinate <-> indeterminate
          // switch. Without it React reused the same DOM node for both branches
          // (same `motion.div` type, same JSX slot) and Framer left this
          // branch's inline `width: 0%` on the node behind — which, being
          // inline, silently overrode the indeterminate branch's `w-full`
          // class and rendered it at zero width. The bar just wasn't there.
          key="determinate"
          className="h-full rounded-full bg-gradient-to-l from-brand-amber-500 to-brand-coral-500 shadow-[0_0_12px_rgba(245,165,36,0.5)]"
          initial={{ width: '0%' }}
          animate={{ width: `${progress.value}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      ) : (
        <motion.div key="indeterminate" className="relative h-full w-full overflow-hidden rounded-full">
          {/* Solid base fill, always fully present — the earlier version was a
              single narrow chunk drifting through an otherwise-empty track,
              which read as a fragment rather than progress. This one always
              shows a full bar, so it never looks like it's "missing" most of
              the time. A slow opacity breathe says "still working" without
              claiming any specific amount of progress. */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-l from-brand-amber-500 to-brand-coral-500"
            animate={BREATHE_ANIMATE}
            transition={BREATHE_TRANSITION}
          />
          {/* The sheen: only `x` and `opacity` are animated here, both of which
              are transform/compositor properties — cheap, never touch layout
              or paint, and are the two values MotionConfig's
              reducedMotion="user" is built to neutralise, so this correctly
              goes still under reduce-motion with no extra code. The streak
              travels fully off-screen on both ends (-150% to 250% of its own
              width, clipped by the parent's overflow-hidden), so the loop's
              restart happens somewhere nobody can see it — no visible seam,
              unlike a bar that resets while still inside the visible track. */}
          <motion.div
            className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-l from-transparent via-white/70 to-transparent"
            animate={SHEEN_ANIMATE}
            transition={SHEEN_TRANSITION}
          />
        </motion.div>
      )}
    </div>
  );
});
