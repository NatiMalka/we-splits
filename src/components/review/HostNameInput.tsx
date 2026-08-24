import { TextInput } from '../ui/TextInput';

interface HostNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function HostNameInput({ value, onChange }: HostNameInputProps) {
  return (
    <TextInput
      id="host-name"
      label="השם שלך"
      placeholder="לדוגמה: דני"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
