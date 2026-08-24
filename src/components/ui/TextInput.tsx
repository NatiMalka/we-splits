import type { InputHTMLAttributes } from 'react';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
}

export function TextInput({ label, id, ...rest }: TextInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-brand-sand/70">
          {label}
        </label>
      )}
      <input
        id={id}
        className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-base text-brand-sand placeholder:text-brand-sand/40 outline-none backdrop-blur-xl transition-colors focus:border-brand-amber-400/60"
        {...rest}
      />
    </div>
  );
}
