import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-background flex justify-center">
      {/* min-h-dvh gives `flex-1` children a definite height to fill, so the
          centered loading/empty states still work — while still allowing the
          column to grow past the viewport and let the page scroll normally. */}
      <div className="relative z-10 flex min-h-dvh w-full max-w-md flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  );
}
