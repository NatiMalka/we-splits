import { ArrowLeft, Receipt } from 'lucide-react';
import { Button } from '../ui/Button';

interface HostControlsProps {
  onGoToMenu: () => void;
  onGoToSummary: () => void;
}

export function HostControls({ onGoToMenu, onGoToSummary }: HostControlsProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <Button variant="primary" fullWidth onClick={onGoToMenu}>
        <Receipt size={18} />
        בחר את המנות שלי
      </Button>
      <Button variant="secondary" fullWidth onClick={onGoToSummary}>
        עבור לסיכום
        <ArrowLeft size={18} />
      </Button>
    </div>
  );
}
