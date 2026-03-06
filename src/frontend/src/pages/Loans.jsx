// pages/Loans.jsx
import { useState } from 'react'
import { api } from '../services/api'
import { PageWrapper, SectionHeader } from '../components/UI'
import { Calculator, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend
} from 'recharts'

const PRESETS = [
  { label: '30yr Mortgage', principal: 350000, rate: 6.875, years: 30 },
  { label: '15yr Mortgage', principal: 300000, rate: 6.0,   years: 15 },
  { label: '5yr Auto',      principal: 45000,  rate: 5.9,   years: 5  },
  { label: 'Personal Loan', principal: 15000,  rate: 11.5,  years: 3  },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card" style={{ padding: '10px 14px', border: '1px solid rgba(212,175,55,0.2)', fontSize: 12 }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--slate-500)', marginBottom: 6 }}>Payment #{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontFamily: 'var(--font-mono)' }}>
          {p.name}: ${p.value.toFixed(2)}
        </div>
      ))}
    </div>
  )
}

export default function Loans() {
  const [form, setForm] = useState({ principal: 300000, annual_rate_pct: 6.5, years: 30 })
  const [result, setResult] = useState(null)
  const [sched, setSched]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)
  const [showFull, setShowFull] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const calculate = async () => {
    setLoading(true); setError(null); setSched(null)
    try {
      const [quick, amort] = await Promise.all([
        api.calculateLoan(form),
        api.amortizeLoan(form),
      ])
      setResult(quick)
      setSched(amort.schedule)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const applyPreset = (p) => {
    setForm({ principal: p.principal, annual_rate_pct: p.rate, years: p.years })
    setResult(null); setSched(null)
  }

  // Sample every Nth row so chart stays readable
  const chartData = sched ? sched.filter((_, i) => {
    const step = Math.max(1, Math.floor(sched.length / 60))
    return i % step === 0
  }).map(r => ({
    period: r.period,
    Principal: parseFloat(r.principal_payment.toFixed(2)),
    Interest:  parseFloat(r.interest_payment.toFixed(2)),
    Balance:   parseFloat(r.balance.toFixed(2)),
  })) : []

  return (
    <PageWrapper>
      <SectionHeader
        title="Loan Calculator"
        sub="Python amortization engine — COBOL-equivalent precision"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>

        {/* Input Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card fade-up" style={{ padding: 24 }}>
            <div className="label">Presets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PRESETS.map(p => (
                <button key={p.label} className="btn-ghost" onClick={() => applyPreset(p)}
                  style={{ textAlign: 'left', fontSize: 12 }}>
                  <span style={{ color: 'var(--slate-100)', fontWeight: 600 }}>{p.label}</span>
                  <span style={{ color: 'var(--slate-500)', marginLeft: 8 }}>
                    ${p.principal.toLocaleString()} @ {p.rate}% · {p.years}yr
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card fade-up" style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="label">Principal ($)</label>
                <input className="input" type="number" value={form.principal}
                  onChange={e => set('principal', +e.target.value)} />
              </div>
              <div>
                <label className="label">Annual Rate (%)</label>
                <input className="input" type="number" step="0.125" value={form.annual_rate_pct}
                  onChange={e => set('annual_rate_pct', +e.target.value)} />
              </div>
              <div>
                <label className="label">Term (Years)</label>
                <input className="input" type="number" min="1" max="30" value={form.years}
                  onChange={e => set('years', +e.target.value)} />
              </div>
              <button className="btn-primary" onClick={calculate} disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading
                  ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Calculating...</>
                  : <><Calculator size={14} /> Calculate</>}
              </button>
            </div>
            {error && <div style={{ color: 'var(--red-400)', fontSize: 12, marginTop: 12 }}>{error}</div>}
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result && (
            <>
              {/* Key Numbers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {[
                  { label: 'Monthly Payment', value: `$${result.monthly_payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: Calendar, accent: 'var(--gold-500)' },
                  { label: 'Total Interest',  value: `$${result.total_interest.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: TrendingUp, accent: 'var(--red-400)' },
                  { label: 'Total Cost',      value: `$${result.total_cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, accent: 'var(--blue-400)' },
                ].map(s => (
                  <div key={s.label} className="card fade-up" style={{ padding: '20px 22px', borderTop: `2px solid ${s.accent}` }}>
                    <div className="label">{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--slate-100)', marginTop: 4 }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interest vs Principal breakdown */}
              <div className="card fade-up" style={{ padding: 24 }}>
                <div className="label" style={{ marginBottom: 4 }}>Principal vs Interest Breakdown</div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12 }}>
                  <span style={{ color: 'var(--gold-400)' }}>■ Principal: ${result.principal.toLocaleString()}</span>
                  <span style={{ color: 'var(--red-400)' }}>■ Interest: ${result.total_interest.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                {/* Ratio bar */}
                <div style={{ height: 12, borderRadius: 6, overflow: 'hidden', background: 'var(--navy-900)', display: 'flex' }}>
                  <div style={{
                    width: `${(result.principal / result.total_cost * 100).toFixed(1)}%`,
                    background: 'var(--gold-500)', transition: 'width 0.6s ease'
                  }} />
                  <div style={{ flex: 1, background: 'var(--red-400)', opacity: 0.7 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--slate-500)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                  <span>{(result.principal / result.total_cost * 100).toFixed(1)}% principal</span>
                  <span>{(result.total_interest / result.total_cost * 100).toFixed(1)}% interest</span>
                </div>
              </div>

              {/* Amortization Chart */}
              {sched && (
                <div className="card fade-up" style={{ padding: 24 }}>
                  <div className="label" style={{ marginBottom: 16 }}>Amortization — Principal vs Interest per Payment</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="prinGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="period" tick={{ fill: '#5a6490', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="Principal" stroke="#d4af37" strokeWidth={2} fill="url(#prinGrad)" dot={false} />
                      <Area type="monotone" dataKey="Interest"  stroke="#f87171" strokeWidth={2} fill="url(#intGrad)"  dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Schedule Table (toggle) */}
              {sched && (
                <div className="card fade-up" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="label" style={{ marginBottom: 0 }}>Full Amortization Schedule ({sched.length} payments)</div>
                    <button className="btn-ghost" onClick={() => setShowFull(s => !s)} style={{ fontSize: 12 }}>
                      {showFull ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  {showFull && (
                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Payment</th>
                            <th>Principal</th>
                            <th>Interest</th>
                            <th>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sched.map(r => (
                            <tr key={r.period}>
                              <td className="mono" style={{ color: 'var(--slate-500)' }}>{r.period}</td>
                              <td className="mono">${r.payment.toFixed(2)}</td>
                              <td className="mono" style={{ color: 'var(--gold-400)' }}>${r.principal_payment.toFixed(2)}</td>
                              <td className="mono" style={{ color: 'var(--red-400)' }}>${r.interest_payment.toFixed(2)}</td>
                              <td className="mono">${r.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {!result && !loading && (
            <div className="card" style={{ padding: 60, textAlign: 'center' }}>
              <Calculator size={40} style={{ color: 'var(--slate-500)', marginBottom: 16 }} />
              <div style={{ color: 'var(--slate-300)', fontSize: 15, fontWeight: 600 }}>Select a preset or enter values</div>
              <div style={{ color: 'var(--slate-500)', fontSize: 13, marginTop: 6 }}>Results will appear here</div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
