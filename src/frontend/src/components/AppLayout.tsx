import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-navy-950 flex">
      <AppSidebar />
      <main className="flex-1 ml-0 md:ml-60 p-4 pt-[72px] md:pt-9 md:p-9 overflow-x-hidden page-enter">
        <Outlet />
      </main>
    </div>
  );
}
