import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-navy-950 flex">
      <AppSidebar />
      <main className="flex-1 ml-60 p-9 overflow-auto page-enter">
        <Outlet />
      </main>
    </div>
  );
}
