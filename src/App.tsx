import { Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { AppShell } from './components/layout/AppShell';
import { Spinner } from './components/ui/Spinner';
import { Button } from './components/ui/Button';
import { useAuthState } from './hooks/useAuthUid';
import { WifiOff } from 'lucide-react';
import {
  BillClosed,
  EnterCode,
  Join,
  Menu,
  NotFound,
  Review,
  RoomShare,
  RouteFallback,
  Summary,
  Upload,
  preloadNextScreen,
} from './routes/lazyScreens';

export default function App() {
  const location = useLocation();
  const auth = useAuthState();

  // Warm the chunk for the screen the user will most likely open next, once the
  // current one has settled. requestIdleCallback keeps it off the critical path;
  // Safari doesn't have it, so fall back to a timeout.
  useEffect(() => {
    const warm = () => preloadNextScreen(location.pathname);
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(warm, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 600);
    return () => clearTimeout(id);
  }, [location.pathname]);

  // Gate all routes on the anonymous sign-in resolving once — every write in
  // FirestoreRoomStore assumes auth.currentUser is already set.
  if (auth.status === 'signing-in') {
    return (
      <AppShell>
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Spinner />
          <p className="text-sm text-brand-sand/40">מתחבר...</p>
        </div>
      </AppShell>
    );
  }

  // Previously this same state showed an endless spinner with nothing logged, so
  // a bad key or a disabled provider was indistinguishable from a slow network.
  if (auth.status === 'failed') {
    return (
      <AppShell>
        <div className="flex flex-1 items-center justify-center">
          <div className="glass-card flex max-w-sm flex-col items-center gap-4 p-8 text-center">
            <WifiOff size={36} className="text-brand-coral-400" />
            <div>
              <h1 className="text-lg font-bold text-brand-sand">לא הצלחנו להתחבר</h1>
              <p className="mt-1 text-sm text-brand-sand/60">
                בדקו את חיבור האינטרנט ונסו שוב.
              </p>
            </div>
            <Button fullWidth onClick={auth.retry}>
              נסה שוב
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    // One place to honour the phone's "reduce motion" setting for every
    // motion/react component in the app — there are ~35 of them, and only two
    // used to check it individually. `reducedMotion="user"` keeps opacity
    // changes (so things still appear) while dropping transforms and disabling
    // the infinite loops. The CSS half lives in index.css.
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Upload.Component />} />
            <Route path="/review" element={<Review.Component />} />
            <Route path="/join" element={<EnterCode.Component />} />
            <Route path="/room/:roomCode" element={<RoomShare.Component />} />
            <Route path="/join/:roomCode" element={<Join.Component />} />
            <Route path="/room/:roomCode/menu" element={<Menu.Component />} />
            <Route path="/room/:roomCode/summary" element={<Summary.Component />} />
            <Route path="/room/:roomCode/closed" element={<BillClosed.Component />} />
            <Route path="*" element={<NotFound.Component />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </MotionConfig>
  );
}
