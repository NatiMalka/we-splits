import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmSheetProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Bottom sheet for anything that can't be undone. Escape and the backdrop both cancel. */
export function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-40 bg-brand-charcoal/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 flex justify-center"
          >
            <div className="glass-card-solid w-full max-w-md rounded-b-none p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  className={`mt-0.5 shrink-0 ${danger ? 'text-brand-coral-400' : 'text-brand-amber-300'}`}
                />
                <div>
                  <h2 className="font-bold text-brand-sand">{title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-brand-sand/70">{body}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <Button variant={danger ? 'primary' : 'primary'} fullWidth onClick={onConfirm}>
                  {confirmLabel}
                </Button>
                <Button variant="secondary" fullWidth onClick={onCancel}>
                  ביטול
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
