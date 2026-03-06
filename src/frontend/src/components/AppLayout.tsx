import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-950 flex">
      <AppSidebar />
      <main className="flex-1 ml-60 p-9 overflow-auto page-enter">
        {children}
      </main>
    </div>
  );
}
