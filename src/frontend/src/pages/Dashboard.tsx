import { Link } from 'react-router-dom';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, ArrowRight, Calculator, ArrowLeftRight, Zap, TrendingUp, Activity } from 'lucide-react';
import { formatCurrency } from '@/services/api';
import { useT } from '@/i18n';

const balanceData = [
  { day: 'Mon', value: 1180000 },
  { day: 'Tue', value: 1215000 },
  { day: 'Wed', value: 1198000 },
  { day: 'Thu', value: 1250000 },
  { day: 'Fri', value: 1371000 },
  { day: 'Sat', value: 1371000 },
  { day: 'Today', value: 1421000 },
];

const txnVolume = [
  { hour: '08', count: 3 }, { hour: '09', count: 7 }, { hour: '10', count: 11 },
  { hour: '11', count: 9 }, { hour: '12', count: 5 }, { hour: '13', count: 12 },
  { hour: '14', count: 17 }, { hour: '15', count: 14 }, { hour: '16', count: 8 },
  { hour: '17', count: 4 },
];

const accounts = [
  { id: 'ZNT-001', name: 'Alice Johnson', type: 'CHECKING', balance: 14250.75, status: 'Active' },
  { id: 'ZNT-002', name: 'Bob Martinez', type: 'SAVINGS', balance: 87500.00, status: 'Active' },
  { id: 'ZNT-003', name: 'Carol Whitfield', type: 'BUSINESS', balance: 312000.50, status: 'Active' },
  { id: 'ZNT-004', name: 'David Chen', type: 'CHECKING', balance: -450.25, status: 'Active' },
];

const chartTooltipStyle = {
  contentStyle: {
    background: '#0d1535',
    border: '1px solid rgba(212,175,55,0.3)',
    borderRadius: '8px',
    color: '#e8eaf2',
    fontFamily: '"DM Mono", monospace',
    fontSize: '12px',
  },
};

const now = new Date();
const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit' }).toUpperCase();

export default function Dashboard() {
  const t = useT();

  const quickActions = [
    { label: t.nav.accounts, icon: Users, to: '/accounts' },
    { label: t.nav.loans, icon: Calculator, to: '/loans' },
    { label: t.nav.transactions, icon: ArrowLeftRight, to: '/transactions' },
    { label: t.nav.batch, icon: Zap, to: '/batch' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="font-mono text-xs text-slate-500 tracking-widest mb-2">{dateStr}</p>
        <h1 className="font-display text-3xl font-bold text-foreground">{t.dashboard.title}</h1>
        <p className="text-slate-300 text-sm mt-1">{t.dashboard.subtitle} · <span className="font-mono text-gold">GnuCOBOL 3.2</span></p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-5">
        {[
          { label: t.dashboard.totalBalance, value: formatCurrency(1421000), sub: `6 ${t.nav.accounts.toLowerCase()}`, accent: 'zen-card-gold-top' },
          { label: t.dashboard.totalAccounts, value: '5', sub: t.common.active, accent: 'zen-card-blue-top' },
          { label: t.dashboard.todayTxns, value: '24', sub: `9 ${t.transactions.approved.toLowerCase()} · 3 ${t.transactions.rejectedStatus.toLowerCase()}`, accent: 'zen-card-green-top' },
          { label: t.dashboard.cobolEngine, value: t.dashboard.available, sub: 'GnuCOBOL 3.2', accent: 'zen-card-gold-top' },
        ].map((s) => (
          <div key={s.label} className={`zen-card ${s.accent} p-5`}>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{s.label}</p>
            <p className="font-mono text-2xl font-semibold text-foreground">{s.value}</p>
            <p className="text-xs text-slate-300 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5">
        <div className="zen-card p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-gold" />
              <h3 className="font-display text-lg font-semibold">{t.dashboard.balanceOverview}</h3>
            </div>
          </div>
          <p className="text-xs text-zen-green font-mono mb-4">+3.2%</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={balanceData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#5a6490', fontSize: 11, fontFamily: '"DM Mono"' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a6490', fontSize: 11, fontFamily: '"DM Mono"' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => [formatCurrency(v), t.common.balance]} />
              <Area type="monotone" dataKey="value" stroke="#d4af37" fill="url(#goldGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="zen-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} className="text-zen-blue" />
            <h3 className="font-display text-lg font-semibold">{t.dashboard.todayTxns}</h3>
          </div>
          <p className="text-xs text-zen-blue font-mono mb-4">Peak 14:00 — 17 txns</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={txnVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="hour" tick={{ fill: '#5a6490', fontSize: 11, fontFamily: '"DM Mono"' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a6490', fontSize: 11, fontFamily: '"DM Mono"' }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Account snapshot */}
      <div className="zen-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">{t.nav.accounts}</h3>
          <Link to="/accounts" className="text-xs text-gold flex items-center gap-1 hover:underline">{t.common.view} <ArrowRight size={12} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
              {accounts.map((a) => (
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
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-5">
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
