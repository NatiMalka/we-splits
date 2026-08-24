import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export function RoomNotFoundState() {
  return (
    <div className="glass-card flex flex-col items-center gap-4 p-8 text-center">
      <AlertCircle size={40} className="text-brand-coral-400" />
      <div>
        <h1 className="text-lg font-bold text-brand-sand">החדר לא נמצא</h1>
        <p className="mt-1 text-sm text-brand-sand/60">ייתכן שהקוד שגוי או שהחדר נמחק</p>
      </div>
      <Link to="/" className="w-full">
        <Button fullWidth>חזרה למסך הבית</Button>
      </Link>
    </div>
  );
}
