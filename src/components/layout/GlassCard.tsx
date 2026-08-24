import type { HTMLAttributes, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  solid?: boolean;
}

export function GlassCard({ children, solid, className = '', ...rest }: GlassCardProps) {
  return (
    <div className={`${solid ? 'glass-card-solid' : 'glass-card'} ${className}`} {...rest}>
      {children}
    </div>
  );
}
