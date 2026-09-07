import { lazy, type ComponentType } from 'react';

/**
 * One chunk per screen.
 *
 * Before this, all nine screens plus firebase, motion, lucide and the QR library
 * were a single 1.02 MB eager chunk — so a guest opening a WhatsApp join link
 * downloaded the receipt-scanning and review screens they will never see.
 *
 * `preload` is exposed alongside each lazy component because App warms the next
 * likely chunk on idle. Without that, every navigation would suspend, the
 * Suspense fallback would replace the outgoing screen, and the page transition
 * in App's AnimatePresence would be cut short. Dynamic imports are cached, so
 * calling `preload` repeatedly (or after the chunk has loaded) costs nothing.
 */
interface LazyScreen {
  Component: ComponentType;
  preload: () => void;
}

function lazyScreen(loader: () => Promise<{ default: ComponentType }>): LazyScreen {
  return {
    Component: lazy(loader),
    preload: () => {
      // Fire-and-forget: a failed warm-up must not surface as an unhandled
      // rejection. The real navigation will retry and report properly.
      void loader().catch(() => {});
    },
  };
}

export const Upload = lazyScreen(() =>
  import('../screens/UploadScreen').then((m) => ({ default: m.UploadScreen })),
);
export const Review = lazyScreen(() =>
  import('../screens/ReviewScreen').then((m) => ({ default: m.ReviewScreen })),
);
export const EnterCode = lazyScreen(() =>
  import('../screens/EnterCodeScreen').then((m) => ({ default: m.EnterCodeScreen })),
);
export const RoomShare = lazyScreen(() =>
  import('../screens/RoomShareScreen').then((m) => ({ default: m.RoomShareScreen })),
);
export const Join = lazyScreen(() =>
  import('../screens/JoinScreen').then((m) => ({ default: m.JoinScreen })),
);
export const Menu = lazyScreen(() =>
  import('../screens/MenuScreen').then((m) => ({ default: m.MenuScreen })),
);
export const Summary = lazyScreen(() =>
  import('../screens/SummaryScreen').then((m) => ({ default: m.SummaryScreen })),
);
export const BillClosed = lazyScreen(() =>
  import('../screens/BillClosedScreen').then((m) => ({ default: m.BillClosedScreen })),
);
export const NotFound = lazyScreen(() =>
  import('../screens/NotFoundScreen').then((m) => ({ default: m.NotFoundScreen })),
);

/**
 * The flow is almost entirely linear, so the next screen is predictable from the
 * current path. Warming it means the chunk is usually already parsed by the time
 * the user taps.
 */
export function preloadNextScreen(pathname: string): void {
  if (pathname === '/') return Review.preload();
  if (pathname === '/review') return RoomShare.preload();
  if (pathname === '/join') return Join.preload();
  // A room link can be opened by someone already in the room or by a newcomer,
  // so warm both the menu and the join screen.
  if (/^\/room\/[^/]+$/.test(pathname)) {
    Menu.preload();
    return Join.preload();
  }
  if (/^\/join\/[^/]+$/.test(pathname)) return Menu.preload();
  if (/\/menu$/.test(pathname)) return Summary.preload();
  if (/\/summary$/.test(pathname)) return BillClosed.preload();
}
