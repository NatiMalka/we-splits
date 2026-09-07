import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { AnalyzeStage } from '../../lib/gemini/analyzeReceipt';
import { LottiePlayer } from '../ui/LottiePlayer';
import { describeStage } from './analyzeStageCopy';

/** How often the elapsed clock ticks — only used to cross the "this is slow" line. */
const TICK_MS = 1000;

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

function ProgressTrack({ progress }: { progress: ReturnType<typeof describeStage>['progress'] }) {
  const barClass = 'h-full rounded-full bg-gradient-to-l from-brand-amber-500 to-brand-coral-500';

  return (
    <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
      {progress.mode === 'determinate' ? (
        <motion.div
          className={barClass}
          initial={{ width: '0%' }}
          animate={{ width: `${progress.value}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      ) : (
        // A sweeping segment, because we genuinely don't know how far along the
        // request is. Opacity is animated alongside x on purpose: MotionConfig's
        // reducedMotion="user" drops transforms but keeps opacity, so this
        // degrades to a gentle pulse rather than freezing into a dead bar.
        <motion.div
          className={`${barClass} w-1/3`}
          animate={{ x: ['-100%', '300%'], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}
