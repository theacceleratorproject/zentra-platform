import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api, formatCurrency } from '@/services/api';

export default function Accounts() {
  const [accounts, setAccounts] = useState([
    { id: 'ZNT-001', name: 'Alice Johnson', type: 'CHECKING', balance: 14250.75, status: 'Active' },
    { id: 'ZNT-002', name: 'Bob Martinez', type: 'SAVINGS', balance: 87500.00, status: 'Active' },
    { id: 'ZNT-003', name: 'Carol Whitfield', type: 'BUSINESS', balance: 312000.50, status: 'Active' },
    { id: 'ZNT-004', name: 'David Chen', type: 'CHECKING', balance: -450.25, status: 'Active' },
    { id: 'ZNT-005', name: 'Elena Kowalski', type: 'SAVINGS', balance: 5200.00, status: 'Active' },
    { id: 'ZNT-INT', name: 'Internal Reserve', type: 'INTERNAL', balance: 1002500.00, status: 'Active' },
  ]);
  const [loading, setLoading] = useState(false);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const activeCount = accounts.filter(a => a.status === 'Active').length;
  const odCount = accounts.filter(a => a.balance < 0).length;

  const handleRefresh = async () => {
    setLoading(true);
    const data = await api.accounts();
    setAccounts(data.accounts);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Accounts</h1>
        <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity">
          {loading ? <span className="gold-spinner" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="zen-card zen-card-gold-top p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Total Accounts</p>
          <p className="font-mono text-2xl font-semibold">{accounts.length}</p>
        </div>
        <div className="zen-card zen-card-green-top p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Active</p>
          <p className="font-mono text-2xl font-semibold text-zen-green">{activeCount}</p>
        </div>
        <div className="zen-card zen-card-red-top p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Overdrafts</p>
          <p className="font-mono text-2xl font-semibold text-zen-red">{odCount}</p>
          {odCount > 0 && <p className="text-xs text-zen-red mt-1">Action required</p>}
        </div>
      </div>

      <div className="zen-card p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-border">
              <th className="text-left py-2 px-3">Account ID</th>
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-left py-2 px-3">Type</th>
              <th className="text-right py-2 px-3">Balance</th>
              <th className="text-left py-2 px-3">Status</th>
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
                <td className="py-2.5 px-3"><span className="badge-green">{a.status}</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="text-right py-3 px-3 font-mono text-zen-green font-semibold">
                Net System Balance: {formatCurrency(totalBalance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
