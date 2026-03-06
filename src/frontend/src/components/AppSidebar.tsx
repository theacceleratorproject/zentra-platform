import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calculator,
  ArrowLeftRight,
  FileBarChart,
  Zap,
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Accounts', url: '/accounts', icon: Users },
  { title: 'Loan Calculator', url: '/loans', icon: Calculator },
  { title: 'Transactions', url: '/transactions', icon: ArrowLeftRight },
  { title: 'Reports', url: '/reports', icon: FileBarChart },
  { title: 'Batch Pipeline', url: '/batch', icon: Zap },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-navy-900 border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 pt-7 pb-5">
        <h1 className="font-display text-2xl font-bold text-gold tracking-wide">ZENTRA</h1>
        <p className="font-mono text-[10px] text-slate-500 tracking-widest mt-0.5">BANKING PLATFORM</p>
        <div className="h-px bg-gradient-to-r from-primary/80 to-transparent mt-3" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'text-gold border-l-2 border-gold bg-primary/5'
                  : 'text-slate-300 hover:text-gold hover:bg-primary/5 border-l-2 border-transparent'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-gold' : 'text-slate-500 group-hover:text-gold'} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 pb-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zen-green animate-pulse" />
          <span className="font-mono text-[11px] text-zen-green tracking-wider">API ONLINE</span>
        </div>
        <div className="border border-primary/30 rounded-md px-3 py-2 text-center">
          <span className="font-mono text-[10px] text-gold tracking-wider">COBOL CORE ENGINE v2.0</span>
        </div>
      </div>
    </aside>
  );
}
