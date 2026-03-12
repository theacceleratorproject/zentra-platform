import { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/services/api';
import { useT } from '@/i18n';

interface AmortRow {
  number: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export default function Loans() {
  const t = useT();

  const presets = [
    { label: t.loans.mortgage + ' 30yr', principal: 350000, rate: 6.875, years: 30 },
    { label: t.loans.mortgage + ' 15yr', principal: 300000, rate: 6.0, years: 15 },
    { label: t.loans.autoLoan, principal: 45000, rate: 5.9, years: 5 },
    { label: t.loans.personalLoan, principal: 15000, rate: 11.5, years: 3 },
  ];

  const [principal, setPrincipal] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [years, setYears] = useState<number>(0);
  const [result, setResult] = useState<{ monthlyPayment: number; totalInterest: number; totalCost: number; n: number } | null>(null);
  const [schedule, setSchedule] = useState<AmortRow[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);

  const calculate = () => {
    if (!principal || !rate || !years) return;
    const monthlyRate = rate / 100 / 12;
    const n = years * 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    const totalCost = payment * n;
    const totalInterest = totalCost - principal;
    setResult({ monthlyPayment: payment, totalInterest, totalCost, n });

    // Amortization
    const sched: AmortRow[] = [];
    let bal = principal;
    for (let i = 1; i <= n; i++) {
      const int = bal * monthlyRate;
      const prin = payment - int;
      bal -= prin;
      sched.push({ number: i, payment, principal: prin, interest: int, balance: Math.max(0, bal) });
    }
    setSchedule(sched);
  };

  const applyPreset = (p: typeof presets[0]) => {
    setPrincipal(p.principal);
    setRate(p.rate);
    setYears(p.years);
    setResult(null);
    setSchedule([]);
  };

  const principalPct = result ? (principal / result.totalCost * 100) : 0;
  const interestPct = result ? (result.totalInterest / result.totalCost * 100) : 0;

  // Chart data: sample every N rows
  const chartData = schedule.length > 0
    ? schedule.filter((_, i) => i % Math.max(1, Math.floor(schedule.length / 60)) === 0 || i === schedule.length - 1)
      .map(r => ({ month: r.number, Principal: r.principal, Interest: r.interest }))
    : [];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">{t.loans.title}</h1>

      <div className="flex gap-6">
        {/* Left panel */}
        <div className="w-[340px] shrink-0 space-y-5">
          <div className="zen-card p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">{t.loans.presets}</h3>
            <div className="space-y-2">
              {presets.map(p => (
                <button key={p.label} onClick={() => applyPreset(p)} className="w-full text-left px-3 py-2.5 rounded-lg border border-border hover:border-primary/30 transition-colors text-sm">
                  <span className="font-medium">{p.label}</span>
                  <span className="block font-mono text-xs text-slate-500 mt-0.5">
                    {formatCurrency(p.principal)} @ {p.rate}% · {p.years}yr
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="zen-card p-5 space-y-4">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">{t.loans.principal} ($)</label>
              <input type="number" value={principal || ''} onChange={e => setPrincipal(Number(e.target.value))} className="w-full mt-1 px-3 py-2 bg-navy-700 border border-border rounded-lg font-mono text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">{t.loans.interestRate} (%)</label>
              <input type="number" step={0.125} value={rate || ''} onChange={e => setRate(Number(e.target.value))} className="w-full mt-1 px-3 py-2 bg-navy-700 border border-border rounded-lg font-mono text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">{t.loans.termYears}</label>
              <input type="number" min={1} max={30} value={years || ''} onChange={e => setYears(Number(e.target.value))} className="w-full mt-1 px-3 py-2 bg-navy-700 border border-border rounded-lg font-mono text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <button onClick={calculate} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gold-500 text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity">
              <Calculator size={16} /> {t.loans.calculate}
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 space-y-5">
          {!result ? (
            <div className="zen-card p-12 flex flex-col items-center justify-center text-center">
              <Calculator size={40} className="text-slate-500 mb-3" />
              <p className="text-slate-300 font-medium">{t.loans.presets}</p>
              <p className="text-xs text-slate-500 mt-1">{t.loans.subtitle}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-5">
                <div className="zen-card zen-card-gold-top p-5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{t.loans.monthlyPayment}</p>
                  <p className="font-mono text-2xl font-semibold text-gold">{formatCurrency(result.monthlyPayment)}</p>
                </div>
                <div className="zen-card zen-card-red-top p-5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{t.loans.totalInterest}</p>
                  <p className="font-mono text-2xl font-semibold text-zen-red">{formatCurrency(result.totalInterest)}</p>
                </div>
                <div className="zen-card zen-card-blue-top p-5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{t.loans.totalPayment}</p>
                  <p className="font-mono text-2xl font-semibold text-zen-blue">{formatCurrency(result.totalCost)}</p>
                </div>
              </div>

              {/* Ratio bar */}
              <div className="zen-card p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">{t.loans.principal} vs {t.loans.totalInterest}</p>
                <div className="flex rounded-full overflow-hidden h-5">
                  <div className="bg-gold-500 flex items-center justify-center text-[10px] font-mono font-semibold text-primary-foreground" style={{ width: `${principalPct}%` }}>
                    {principalPct.toFixed(1)}%
                  </div>
                  <div className="bg-zen-red flex items-center justify-center text-[10px] font-mono font-semibold" style={{ width: `${interestPct}%` }}>
                    {interestPct.toFixed(1)}%
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>{t.loans.principal}: {formatCurrency(principal)}</span>
                  <span>{t.loans.totalInterest}: {formatCurrency(result.totalInterest)}</span>
                </div>
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div className="zen-card p-5">
                  <h3 className="font-display text-lg font-semibold mb-4">{t.loans.principalPaid} vs {t.loans.interestPaid}</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="iGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fill: '#5a6490', fontSize: 11, fontFamily: '"DM Mono"' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#5a6490', fontSize: 11, fontFamily: '"DM Mono"' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toFixed(0)}`} />
                      <Tooltip contentStyle={{ background: '#0d1535', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: '#e8eaf2', fontFamily: '"DM Mono"', fontSize: '12px' }} formatter={(v: number) => formatCurrency(v)} />
                      <Area type="monotone" dataKey="Principal" stroke="#d4af37" fill="url(#pGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Interest" stroke="#f87171" fill="url(#iGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Amortization */}
              <div className="zen-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-lg font-semibold">{t.loans.amortization} ({result.n} {t.loans.payment.toLowerCase()}s)</h3>
                  <button onClick={() => setShowSchedule(!showSchedule)} className="flex items-center gap-1 text-xs text-gold hover:underline">
                    {showSchedule ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
                {showSchedule && (
                  <div className="max-h-[360px] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-navy-800">
                        <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-border">
                          <th className="text-left py-2 px-3">#</th>
                          <th className="text-right py-2 px-3">{t.loans.payment}</th>
                          <th className="text-right py-2 px-3">{t.loans.principalPaid}</th>
                          <th className="text-right py-2 px-3">{t.loans.interestPaid}</th>
                          <th className="text-right py-2 px-3">{t.loans.remainingBal}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((r, i) => (
                          <tr key={r.number} className={`border-b border-border/30 ${i % 2 === 1 ? 'bg-navy-700/10' : ''}`}>
                            <td className="py-1.5 px-3 font-mono text-xs text-slate-500">{r.number}</td>
                            <td className="py-1.5 px-3 text-right font-mono text-xs">{formatCurrency(r.payment)}</td>
                            <td className="py-1.5 px-3 text-right font-mono text-xs text-gold">{formatCurrency(r.principal)}</td>
                            <td className="py-1.5 px-3 text-right font-mono text-xs text-zen-red">{formatCurrency(r.interest)}</td>
                            <td className="py-1.5 px-3 text-right font-mono text-xs">{formatCurrency(r.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
