import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Module-level guard: prevents multiple useAuthUid() call sites (or React
// StrictMode's double-invoked effects) from each firing their own
// signInAnonymously() before the first one resolves, within this one tab.
let signInAttempted = false;

export type AuthState =
  | { status: 'signing-in' }
  | { status: 'failed'; retry: () => void }
  | { status: 'ready'; uid: string };

/**
 * Anonymous sign-in, with the failure made visible.
 *
 * A swallowed failure here is the worst possible outcome: `uid` never arrives,
 * every screen sits on a spinner forever, and nothing is logged — so a wrong API
 * key or a disabled Anonymous provider looks exactly like a slow network.
 */
export function useAuthState(): AuthState {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [failed, setFailed] = useState(false);

  const attemptSignIn = useCallback(() => {
    signInAttempted = true;
    setFailed(false);
    signInAnonymously(auth).catch((err) => {
      console.error('Anonymous sign-in failed:', err);
      signInAttempted = false;
      setFailed(true);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUid(user.uid);
        setFailed(false);
        return;
      }
      if (!signInAttempted) attemptSignIn();
    });
    return unsubscribe;
  }, [attemptSignIn]);

  if (uid) return { status: 'ready', uid };
  if (failed) return { status: 'failed', retry: attemptSignIn };
  return { status: 'signing-in' };
}

/** Convenience wrapper for screens that only care about the resolved uid. */
export function useAuthUid(): string | null {
  const state = useAuthState();
  return state.status === 'ready' ? state.uid : null;
}
