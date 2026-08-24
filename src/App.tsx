import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { UploadScreen } from './screens/UploadScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { RoomShareScreen } from './screens/RoomShareScreen';
import { JoinScreen } from './screens/JoinScreen';
import { MenuScreen } from './screens/MenuScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { NotFoundScreen } from './screens/NotFoundScreen';
import { AppShell } from './components/layout/AppShell';
import { Spinner } from './components/ui/Spinner';
import { useAuthUid } from './hooks/useAuthUid';

export default function App() {
  const location = useLocation();
  const uid = useAuthUid();

  // Gate all routes on the anonymous sign-in resolving once — every write in
  // FirestoreRoomStore assumes auth.currentUser is already set.
  if (uid === null) {
    return (
      <AppShell>
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      </AppShell>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<UploadScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/room/:roomCode" element={<RoomShareScreen />} />
        <Route path="/join/:roomCode" element={<JoinScreen />} />
        <Route path="/room/:roomCode/menu" element={<MenuScreen />} />
        <Route path="/room/:roomCode/summary" element={<SummaryScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </AnimatePresence>
  );
}
