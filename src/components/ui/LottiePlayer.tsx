import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';

interface LottiePlayerProps {
  /** Path to the animation JSON, served from `public/` — never bundled. */
  src: string;
  /**
   * Rendered instead of the animation whenever it isn't available: reduced
   * motion, a failed fetch, or simply while it's still downloading. Required,
   * not optional — an animation that fails must never leave a hole in the UI.
   */
  fallback: ReactNode;
  loop?: boolean;
  className?: string;
  onComplete?: () => void;
}

/**
 * Plays a Lottie animation, loading both the player and the artwork on demand.
 *
 * Two deliberate choices about weight:
 *
 * 1. The player is a dynamic `import()` of lottie-web's **light** build (~47 KB
 *    gzip vs ~77 KB for the full one, which adds expressions and 3D that these
 *    animations don't use). Same pattern as the Gemini SDK — nothing reaches the
 *    eager bundle, which matters because a guest arriving on a join link would
 *    otherwise pay for animation code they may never see.
 * 2. The artwork is `fetch`ed from `public/`, so it stays out of every JS chunk
 *    and can be swapped without a rebuild.
 *
 * Lottie is used only where illustrated artwork genuinely beats code. Checkmarks,
 * skeletons, sheet slides and count-ups all stay in motion/react: cheaper, and
 * they inherit the theme instead of baking colours in.
 */
export function LottiePlayer({ src, fallback, loop = true, className = '', onComplete }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Don't even fetch when the phone asks for less motion — the fallback is a
    // static icon, so downloading a player to not use it would be pure waste.
    if (reduceMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const abort = new AbortController();
    let animation: { destroy: () => void; addEventListener: (e: string, h: () => void) => void } | undefined;
    let cancelled = false;

    (async () => {
      try {
        // In parallel: the artwork is a network round trip, the player is a
        // chunk fetch. No reason to do them one after the other.
        const [lottieModule, animationData] = await Promise.all([
          import('lottie-web/build/player/lottie_light'),
          fetch(src, { signal: abort.signal }).then((res) => {
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            return res.json();
          }),
        ]);
        if (cancelled) return;

        const lottie = lottieModule.default;
        animation = lottie.loadAnimation({
          container,
          animationData,
          renderer: 'svg',
          loop,
          autoplay: true,
        });
        if (onComplete) animation.addEventListener('complete', onComplete);
        setReady(true);
      } catch (err) {
        if (abort.signal.aborted) return;
        // Warn rather than throw: a missing decoration is not worth breaking a
        // screen over, and the fallback is already on screen.
        console.warn(`Lottie animation "${src}" unavailable, using fallback:`, err);
      }
    })();

    return () => {
      cancelled = true;
      abort.abort();
      animation?.destroy();
    };
    // onComplete is intentionally excluded — an inline arrow from the caller
    // would otherwise tear down and refetch the animation on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, loop, reduceMotion]);

  return (
    <div className={`relative ${className}`}>
      {/* Kept mounted at full size even before it's ready, so lottie-web measures
          the real box. Toggling display instead would give it a 0×0 container. */}
      <div ref={containerRef} className="h-full w-full" style={{ opacity: ready ? 1 : 0 }} />
      {!ready && <div className="absolute inset-0 flex items-center justify-center">{fallback}</div>}
    </div>
  );
}
