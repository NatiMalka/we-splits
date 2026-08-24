import { AppShell } from '../components/layout/AppShell';
import { PageTransition } from '../components/layout/PageTransition';
import { RoomNotFoundState } from '../components/join/RoomNotFoundState';

export function NotFoundScreen() {
  return (
    <AppShell>
      <PageTransition>
        <div className="flex flex-1 items-center justify-center">
          <RoomNotFoundState />
        </div>
      </PageTransition>
    </AppShell>
  );
}
