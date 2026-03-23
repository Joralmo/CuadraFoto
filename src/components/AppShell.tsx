import type { PropsWithChildren } from 'react';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(220,199,162,0.86),transparent_34%),linear-gradient(180deg,#fffaf3_0%,#f7efe4_44%,#f4ecdf_100%)]">
      <div className="safe-pb safe-px safe-pt mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 sm:gap-6 sm:px-6">
        {children}
      </div>
    </main>
  );
}
