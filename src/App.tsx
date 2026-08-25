import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { UploadScreen } from './screens/UploadScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { RoomShareScreen } from './screens/RoomShareScreen';
import { JoinScreen } from './screens/JoinScreen';
import { MenuScreen } from './screens/MenuScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { BillClosedScreen } from './screens/BillClosedScreen';
import { EnterCodeScreen } from './screens/EnterCodeScreen';
import { NotFoundScreen } from './screens/NotFoundScreen';
import { AppShell } from './components/layout/AppShell';
import { Spinner } from './components/ui/Spinner';
import { Button } from './components/ui/Button';
import { useAuthState } from './hooks/useAuthUid';
import { WifiOff } from 'lucide-react';

export default function App() {
  const location = useLocation();
  const auth = useAuthState();

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
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<UploadScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/join" element={<EnterCodeScreen />} />
        <Route path="/room/:roomCode" element={<RoomShareScreen />} />
        <Route path="/join/:roomCode" element={<JoinScreen />} />
        <Route path="/room/:roomCode/menu" element={<MenuScreen />} />
        <Route path="/room/:roomCode/summary" element={<SummaryScreen />} />
        <Route path="/room/:roomCode/closed" element={<BillClosedScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </AnimatePresence>
  );
}
