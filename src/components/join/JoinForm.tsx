import { useState } from 'react';
import { motion } from 'motion/react';
import type { Room } from '../../types';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/format';

interface JoinFormProps {
  room: Room;
  onJoin: (name: string) => Promise<void>;
}

export function JoinForm({ room, onJoin }: JoinFormProps) {
  const [name, setName] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    // Guard, not just cosmetic: the button used to stay live for the whole
    // Firestore write, so a double-tap on a slow connection called joinRoom
    // twice. The pending flag is checked as well as the disabled attribute
    // because a queued second tap can arrive before React re-renders.
    if (joining || !name.trim()) return;
    setJoining(true);
    setError(null);
    try {
      await onJoin(name.trim());
      // Deliberately no setJoining(false) on success — the caller navigates
      // away, and re-enabling the button first lets one more tap through.
    } catch {
      setError('לא הצלחנו להצטרף. בדקו את החיבור ונסו שוב.');
      setJoining(false);
    }
  }
  const total = room.billData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      className="glass-card flex flex-col gap-5 p-6"
    >
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="text-center">
        <p className="text-sm text-brand-sand/50">מצטרפים לחדר</p>
        <h1 className="text-xl font-bold text-brand-sand">{room.billData.restaurantName ?? 'החשבונית'}</h1>
        <p className="mt-1 text-sm text-brand-sand/60">
          {room.billData.items.length} פריטים · סה"כ {formatCurrency(total)}
        </p>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <TextInput
          id="guest-name"
          label="מה השם שלך?"
          placeholder="לדוגמה: מיכל"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </motion.div>

      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        className="flex flex-col gap-2"
      >
        <Button fullWidth disabled={!name.trim()} loading={joining} onClick={submit}>
          {joining ? 'מצטרפים...' : 'הצטרף'}
        </Button>
        {error && (
          <p role="alert" className="text-center text-sm text-brand-coral-400">
            {error}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
