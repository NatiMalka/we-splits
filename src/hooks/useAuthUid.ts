import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Module-level guard: prevents multiple useAuthUid() call sites (or React
// StrictMode's double-invoked effects) from each firing their own
// signInAnonymously() before the first one resolves, within this one tab.
let signInAttempted = false;

export function useAuthUid(): string | null {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUid(user.uid);
        return;
      }
      if (!signInAttempted) {
        signInAttempted = true;
        signInAnonymously(auth).catch(() => {
          signInAttempted = false;
        });
      }
    });
    return unsubscribe;
  }, []);

  return uid;
}
