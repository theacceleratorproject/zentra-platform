import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Calculator, ArrowLeftRight, Zap, Loader2 } from 'lucide-react';
import { api, formatCurrency } from '@/services/api';
import { useT } from '@/i18n';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  status: string;
}

interface HealthData {
  status: string;
  cobol_core: string;
}

export default function Dashboard() {
  const t = useT();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.accounts().catch(() => ({ accounts: [] })),
      api.health().catch(() => null),
    ]).then(([acctData, healthData]) => {
      setAccounts(acctData.accounts || []);
      setHealth(healthData);
      setLoading(false);
    });
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const activeCount = accounts.filter(a => a.status === 'A' || a.status === 'Active').length;
  const odCount = accounts.filter(a => a.balance < 0).length;

  const quickActions = [
    { label: t.nav.accounts, icon: Users, to: '/accounts' },
    { label: t.nav.loans, icon: Calculator, to: '/loans' },
    { label: t.nav.transactions, icon: ArrowLeftRight, to: '/transactions' },
    { label: t.nav.batch, icon: Zap, to: '/batch' },
  ];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit' }).toUpperCase();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="font-mono text-xs text-slate-500 tracking-widest mb-2">{dateStr}</p>
        <h1 className="font-display text-3xl font-bold text-foreground">{t.dashboard.title}</h1>
        <p className="text-slate-300 text-sm mt-1">{t.dashboard.subtitle}</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gold" />
          <span className="ml-3 text-slate-400">{t.common.loading}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {[
            { label: t.dashboard.totalBalance, value: formatCurrency(totalBalance), sub: `${accounts.length} ${t.nav.accounts.toLowerCase()}`, accent: 'zen-card-gold-top' },
            { label: t.dashboard.totalAccounts, value: String(activeCount), sub: t.common.active, accent: 'zen-card-blue-top' },
            { label: t.dashboard.overdraftAlert, value: String(odCount), sub: odCount > 0 ? t.dashboard.accountsInOD : '—', accent: 'zen-card-red-top' },
            { label: t.dashboard.cobolEngine, value: health ? t.dashboard.available : t.dashboard.unavailable, sub: health?.cobol_core || '—', accent: 'zen-card-gold-top' },
          ].map((s) => (
            <div key={s.label} className={`zen-card ${s.accent} p-4 md:p-5`}>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{s.label}</p>
              <p className="font-mono text-xl md:text-2xl font-semibold text-foreground">{s.value}</p>
              <p className="text-xs text-slate-300 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Account snapshot */}
      <div className="zen-card p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">{t.nav.accounts}</h3>
          <Link to="/accounts" className="text-xs text-gold flex items-center gap-1 hover:underline min-h-[44px] min-w-[44px] justify-center md:min-h-0 md:min-w-0">{t.common.view} <ArrowRight size={12} /></Link>
        </div>
        {accounts.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">{t.common.noData}</p>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-border">
                  <th className="text-left py-2 px-3">{t.accounts.accountId}</th>
                  <th className="text-left py-2 px-3">{t.common.name}</th>
                  <th className="text-left py-2 px-3">{t.common.type}</th>
                  <th className="text-right py-2 px-3">{t.common.balance}</th>
                  <th className="text-left py-2 px-3">{t.common.status}</th>
                </tr>
              </thead>
              <tbody>
                {accounts.slice(0, 5).map((a) => (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-navy-700/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-gold">{a.id}</td>
                    <td className="py-2.5 px-3">{a.name}</td>
                    <td className="py-2.5 px-3"><span className="badge-blue">{a.type}</span></td>
                    <td className={`py-2.5 px-3 text-right font-mono ${a.balance < 0 ? 'text-zen-red' : 'text-zen-green'}`}>
                      {formatCurrency(a.balance)}
                      {a.balance < 0 && <span className="badge-red ml-2">OD</span>}
                    </td>
                    <td className="py-2.5 px-3"><span className="badge-green">{t.common.active}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {quickActions.map((qa) => (
          <Link
            key={qa.to}
            to={qa.to}
            className="zen-card p-5 flex items-center justify-between group hover:border-primary/30 transition-all duration-200 border border-transparent"
          >
            <div className="flex items-center gap-3">
              <qa.icon size={20} className="text-slate-500 group-hover:text-gold transition-colors" />
              <span className="text-sm font-medium">{qa.label}</span>
            </div>
            <ArrowRight size={16} className="text-slate-500 group-hover:text-gold transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
