import { TextInput } from '../ui/TextInput';

interface HostPaymentLinkInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function HostPaymentLinkInput({ value, onChange }: HostPaymentLinkInputProps) {
  return (
    <div className="glass-card flex flex-col gap-2 p-4">
      <TextInput
        id="payment-link"
        label="לינק לתשלום (Bit / PayBox) — אופציונלי"
        placeholder="https://..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir="ltr"
      />
    </div>
  );
}
