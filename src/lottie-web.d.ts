/**
 * lottie-web ships types for its default build but not for the deep `lottie_light`
 * path we import to keep the bundle down. This narrows it to just what we call.
 */
declare module 'lottie-web/build/player/lottie_light' {
  interface LottieAnimation {
    destroy: () => void;
    addEventListener: (event: string, handler: () => void) => void;
  }

  interface LoadAnimationParams {
    container: Element;
    animationData: unknown;
    renderer?: 'svg' | 'canvas' | 'html';
    loop?: boolean;
    autoplay?: boolean;
  }

  const lottie: { loadAnimation: (params: LoadAnimationParams) => LottieAnimation };
  export default lottie;
}
