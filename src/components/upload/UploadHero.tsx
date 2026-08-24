import { useRef, type ChangeEvent } from 'react';
import { Camera, Receipt } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadHeroProps {
  onCapture: (file: File) => void;
}

export function UploadHero({ onCapture }: UploadHeroProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onCapture(file);
    event.target.value = ''; // allow re-selecting the same file later
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass-card flex flex-col items-center gap-6 px-6 py-12 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-amber-500 to-brand-coral-500 text-brand-charcoal"
      >
        <Receipt size={38} strokeWidth={2} />
      </motion.div>

      <p className="text-brand-sand/70">צלמו את החשבונית ונתחיל לחלק</p>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => inputRef.current?.click()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-brand-amber-500 to-brand-coral-500 px-6 py-4 text-lg font-bold text-brand-charcoal shadow-lg shadow-brand-amber-500/20"
      >
        <Camera size={22} />
        צלם / העלה חשבונית
      </motion.button>

      <p className="text-xs text-brand-sand/40">בלי הרשמה, בלי הורדה — פשוט מתחילים</p>

      {/* No `capture` attribute: on iOS Safari, setting capture forces the camera
          directly and hides the "Photo Library"/"Browse" options from the picker. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </motion.div>
  );
}
