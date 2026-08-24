import QRCode from 'react-qr-code';
import { motion } from 'motion/react';

export function QRCodeCard({ url }: { url: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 22 }}
      className="glass-card flex flex-col items-center gap-3 p-6"
    >
      <div className="rounded-2xl bg-brand-sand p-4">
        <QRCode value={url} size={168} bgColor="#F4E9DA" fgColor="#0B1620" />
      </div>
      <p className="text-center text-sm text-brand-sand/60">סרקו כדי להצטרף לחדר</p>
    </motion.div>
  );
}
