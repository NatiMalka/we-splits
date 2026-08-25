import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, KeyRound } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/layout/GlassCard';
import { Button } from '../components/ui/Button';
import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from '../store/roomCode';
import { formatRoomCode } from '../lib/format';

export function EnterCodeScreen() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  // Codes are generated from a deliberately unambiguous alphabet (no 0/O, 1/I/L).
  // Filtering as they type means a misheard character fails here, with the field
  // still on screen, instead of as a confusing "room not found" after navigating.
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const cleaned = formatRoomCode(event.target.value)
      .split('')
      .filter((char) => ROOM_CODE_ALPHABET.includes(char))
      .join('')
      .slice(0, ROOM_CODE_LENGTH);
    setCode(cleaned);
  }

  const isComplete = code.length === ROOM_CODE_LENGTH;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isComplete) navigate(`/join/${code}`);
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="flex items-center gap-3 pb-4">
          <button onClick={() => navigate('/')} aria-label="חזור" className="text-brand-sand/60">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-lg font-bold text-brand-sand">הצטרפות עם קוד</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col items-center justify-center gap-6">
          <GlassCard className="flex w-full flex-col items-center gap-5 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-amber-500/20 text-brand-amber-300">
              <KeyRound size={24} />
            </div>

            <p className="text-center text-sm text-brand-sand/60">
              הזינו את {ROOM_CODE_LENGTH} התווים שמופיעים על המסך של מי שסרק את החשבונית
            </p>

            <div className="w-full">
              <label htmlFor="room-code" className="sr-only">
                קוד חדר
              </label>
              <input
                id="room-code"
                value={code}
                onChange={handleChange}
                autoFocus
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                inputMode="text"
                dir="ltr"
                placeholder="A7K9PX"
                aria-describedby="room-code-hint"
                className="w-full rounded-2xl border border-white/10 bg-white/8 py-4 text-center font-mono text-3xl font-bold tracking-[0.3em] text-brand-sand placeholder:text-brand-sand/25 outline-none backdrop-blur-xl transition-colors focus:border-brand-amber-400/60"
              />
              <p id="room-code-hint" className="mt-2 text-center text-xs text-brand-sand/40">
                {code.length} / {ROOM_CODE_LENGTH}
              </p>
            </div>

            <Button type="submit" fullWidth disabled={!isComplete}>
              הצטרף לחדר
            </Button>
          </GlassCard>
        </form>
      </PageTransition>
    </AppShell>
  );
}
