import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calculator,
  ArrowLeftRight,
  FileBarChart,
  Zap,
  Smartphone,
  Menu,
  X,
} from 'lucide-react';
import { useT, LanguageToggle } from '@/i18n';

export function AppSidebar() {
  const location = useLocation();
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { title: t.nav.dashboard, url: '/', icon: LayoutDashboard },
    { title: t.nav.accounts, url: '/accounts', icon: Users },
    { title: t.nav.loans, url: '/loans', icon: Calculator },
    { title: t.nav.transactions, url: '/transactions', icon: ArrowLeftRight },
    { title: t.nav.reports, url: '/reports', icon: FileBarChart },
    { title: t.nav.batch, url: '/batch', icon: Zap },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 bg-navy-900 border border-border rounded-lg"
        aria-label="Open menu"
      >
        <Menu size={22} className="text-gold" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={closeMobile} />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-60 bg-navy-900 border-r border-border flex flex-col z-50 transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Mobile close */}
        <button onClick={closeMobile} className="absolute top-5 right-4 md:hidden p-1" aria-label="Close menu">
          <X size={20} className="text-slate-400" />
        </button>

        {/* Logo */}
        <div className="px-6 pt-7 pb-5">
          <h1 className="font-display text-2xl font-bold text-gold tracking-wide">{t.app.name}</h1>
          <p className="font-mono text-[10px] text-slate-500 tracking-widest mt-0.5">{t.app.tagline.toUpperCase()}</p>
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
                onClick={closeMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group min-h-[44px] ${
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

        {/* Customer Portal Link */}
        <div className="px-3 mt-2">
          <div className="h-px bg-gradient-to-r from-primary/30 to-transparent mb-3" />
          <a
            href="/portal"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMobile}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group text-slate-300 hover:text-gold hover:bg-primary/5 border-l-2 border-transparent min-h-[44px]"
          >
            <Smartphone size={18} className="text-slate-500 group-hover:text-gold" />
            <span>{t.nav.portal}</span>
            <span className="ml-auto text-[10px] text-slate-500 group-hover:text-gold/70">&#8599;</span>
          </a>
        </div>

        {/* Language Toggle */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <LanguageToggle />
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zen-green animate-pulse" />
            <span className="font-mono text-[11px] text-zen-green tracking-wider">API ONLINE</span>
          </div>
          <div className="border border-primary/30 rounded-md px-3 py-2 text-center">
            <span className="font-mono text-[10px] text-gold tracking-wider">COBOL CORE ENGINE {t.app.version}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
