import type { ReactNode } from 'react';

export function Badge({ children, tone = 'amber' }: { children: ReactNode; tone?: 'amber' | 'teal' }) {
  const toneClasses =
    tone === 'teal'
      ? 'bg-brand-teal-500/20 text-brand-teal-300 border-brand-teal-500/30'
      : 'bg-brand-amber-500/20 text-brand-amber-300 border-brand-amber-500/30';

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${toneClasses}`}>
      {children}
    </span>
  );
}
