import { AnimatePresence, motion } from 'motion/react';
import type { BillItem } from '../../types';
import { NumberStepper } from '../ui/NumberStepper';
import { Button } from '../ui/Button';

interface QuantitySplitSheetProps {
  item: BillItem | null;
  myUnits: number;
  onChangeUnits: (units: number) => void;
  onClose: () => void;
}

export function QuantitySplitSheet({ item, myUnits, onChangeUnits, onClose }: QuantitySplitSheetProps) {
  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-brand-charcoal/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 flex justify-center"
          >
            <div className="glass-card-solid w-full max-w-md rounded-b-none p-6">
              <p className="text-center text-sm text-brand-sand/50">כמה יחידות לקחת?</p>
              <h2 className="mt-1 text-center text-lg font-bold text-brand-sand">
                {item.name} <span className="text-brand-sand/40">/ {item.quantity}</span>
              </h2>
              <div className="mt-5 flex justify-center">
                <NumberStepper value={myUnits} min={0} max={item.quantity} step={1} onChange={onChangeUnits} />
              </div>
              <div className="mt-6">
                <Button fullWidth onClick={onClose}>
                  אישור
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
