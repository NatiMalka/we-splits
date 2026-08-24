import { TextInput } from '../ui/TextInput';

interface YourNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function YourNameInput({ value, onChange }: YourNameInputProps) {
  return (
    <TextInput
      id="creator-name"
      label="השם שלך"
      placeholder="לדוגמה: דני"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
