import { useState, useEffect } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { api, formatCurrency } from '@/services/api';
import { useT } from '@/i18n';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  status: string;
}

export default function Accounts() {
  const t = useT();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.accounts();
      setAccounts(data.accounts || []);
    } catch {
      setAccounts([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadAccounts(); }, []);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const activeCount = accounts.filter(a => a.status === 'A' || a.status === 'Active').length;
  const odCount = accounts.filter(a => a.balance < 0).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="font-display text-2xl md:text-3xl font-bold">{t.accounts.title}</h1>
        <button onClick={loadAccounts} className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity min-h-[44px] w-full sm:w-auto justify-center">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {t.common.refresh}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
        <div className="zen-card zen-card-gold-top p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{t.accounts.totalAccounts}</p>
          <p className="font-mono text-2xl font-semibold">{accounts.length}</p>
        </div>
        <div className="zen-card zen-card-green-top p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{t.common.active}</p>
          <p className="font-mono text-2xl font-semibold text-zen-green">{activeCount}</p>
        </div>
        <div className="zen-card zen-card-red-top p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{t.accounts.overdrafted}</p>
          <p className="font-mono text-2xl font-semibold text-zen-red">{odCount}</p>
          {odCount > 0 && <p className="text-xs text-zen-red mt-1">{t.dashboard.overdraftAlert}</p>}
        </div>
      </div>

      <div className="zen-card p-4 md:p-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-gold" />
            <span className="ml-3 text-slate-400">{t.common.loading}</span>
          </div>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">{t.common.noData}</p>
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
              {accounts.map((a, i) => (
                <tr key={a.id} className={`border-b border-border/50 hover:bg-navy-700/30 transition-colors ${i % 2 === 1 ? 'bg-navy-700/10' : ''}`}>
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
            <tfoot>
              <tr>
                <td colSpan={5} className="text-right py-3 px-3 font-mono text-zen-green font-semibold">
                  {t.accounts.totalBalance}: {formatCurrency(totalBalance)}
                </td>
              </tr>
            </tfoot>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
