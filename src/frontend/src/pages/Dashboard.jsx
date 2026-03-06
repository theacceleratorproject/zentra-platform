// pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { StatCard, PageWrapper, Grid, LoadingState } from '../components/UI'
import {
  Users, DollarSign, Activity, Shield,
  ArrowRight, TrendingUp, Zap, Database
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

// Simulated trend data (Phase 5: replace with live DB)
const BALANCE_TREND = [
  { day: 'Mon', balance: 1180000 },
  { day: 'Tue', balance: 1215000 },
  { day: 'Wed', balance: 1198000 },
  { day: 'Thu', balance: 1250000 },
  { day: 'Fri', balance: 1371000 },
  { day: 'Sat', balance: 1371000 },
  { day: 'Today', balance: 1421000 },
]

const TXN_VOLUME = [
  { hour: '08', vol: 3 }, { hour: '09', vol: 8 }, { hour: '10', vol: 14 },
  { hour: '11', vol: 11 }, { hour: '12', vol: 6 }, { hour: '13', vol: 9 },
  { hour: '14', vol: 17 }, { hour: '15', vol: 12 }, { hour: '16', vol: 7 },
  { hour: '17', vol: 4 },
]

const QUICK_LINKS = [
  { to: '/accounts',      label: 'View Accounts',         icon: Users },
  { to: '/loans',         label: 'Loan Calculator',       icon: DollarSign },
  { to: '/transactions',  label: 'Validate Transactions', icon: Activity },
  { to: '/batch',         label: 'Run Daily Batch',       icon: Zap },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card" style={{ padding: '10px 14px', border: '1px solid rgba(212,175,55,0.2)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--slate-500)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--gold-400)' }}>
        {payload[0].name === 'balance'
          ? `$${(payload[0].value / 1000).toFixed(0)}k`
          : payload[0].value + ' txns'}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState(null)
  const [health, setHealth]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const now = new Date()

  useEffect(() => {
    Promise.allSettled([api.accounts(), api.health()])
      .then(([acctRes, healthRes]) => {
        if (acctRes.status === 'fulfilled') setAccounts(acctRes.value)
        if (healthRes.status === 'fulfilled') setHealth(healthRes.value)
      })
      .finally(() => setLoading(false))
  }, [])

  const totalBalance = accounts?.accounts?.reduce(
    (sum, a) => sum + parseFloat(a.balance || 0), 0
  ) ?? 0

  const activeAccounts = accounts?.accounts?.filter(a => a.status === 'A' || a.status === 'ACTIVE').length ?? 0

  return (
    <PageWrapper>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '2px',
          color: 'var(--slate-500)',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          fontWeight: 700,
          color: 'var(--slate-100)',
          letterSpacing: '-0.5px',
        }}>
          Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, Marck
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: 14, marginTop: 4 }}>
          Zentra Core Engine is {health?.status === 'healthy' ? 'running normally' : 'offline'} · {health?.cobol_core ?? 'Checking COBOL...'}
        </p>
      </div>

      {/* Stat Cards */}
      {loading ? <LoadingState label="Connecting to COBOL engine..." /> : (
        <>
          <Grid cols={4} gap={16}>
            <StatCard
              label="Total System Balance"
              value={`$${(totalBalance / 1000).toFixed(0)}k`}
              sub={`Across ${accounts?.count ?? 0} accounts`}
              icon={DollarSign}
            />
            <StatCard
              label="Active Accounts"
              value={activeAccounts}
              sub="Accounts in good standing"
              icon={Users}
              accent="var(--blue-400)"
            />
            <StatCard
              label="Daily Transactions"
              value="24"
              sub="9 approved · 3 rejected"
              icon={Activity}
              accent="var(--green-400)"
            />
            <StatCard
              label="COBOL Engine"
              value="Online"
              sub={health?.cobol_core?.split('(')[0] ?? 'GnuCOBOL'}
              icon={Database}
              accent="var(--gold-500)"
            />
          </Grid>

          {/* Charts */}
          <Grid cols={2} gap={20} style={{ marginTop: 20 }}>

            {/* Balance Trend */}
            <div className="card fade-up" style={{ padding: '24px', gridColumn: 'span 1' }}>
              <div style={{ marginBottom: 20 }}>
                <div className="label">System Balance — 7 Day Trend</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--slate-100)' }}>
                  $1,421,000
                </div>
                <div style={{ fontSize: 11, color: 'var(--green-400)', marginTop: 2 }}>
                  ↑ +3.2% this week
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={BALANCE_TREND} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: '#5a6490', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="balance" name="balance" stroke="#d4af37" strokeWidth={2} fill="url(#goldGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Transaction Volume */}
            <div className="card fade-up" style={{ padding: '24px' }}>
              <div style={{ marginBottom: 20 }}>
                <div className="label">Transaction Volume — Today</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--slate-100)' }}>
                  91 Processed
                </div>
                <div style={{ fontSize: 11, color: 'var(--blue-400)', marginTop: 2 }}>
                  Peak at 14:00 — 17 transactions
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={TXN_VOLUME} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="hour" tick={{ fill: '#5a6490', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="vol" name="vol" stroke="#60a5fa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Grid>

          {/* Account Snapshot */}
          <div className="card fade-up" style={{ marginTop: 20, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="label" style={{ marginBottom: 0 }}>Account Snapshot</div>
              <Link to="/accounts" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gold-400)', textDecoration: 'none' }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Account ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {accounts?.accounts?.slice(0, 4).map(a => (
                  <tr key={a.account_id}>
                    <td className="mono" style={{ color: 'var(--gold-400)', fontSize: 12 }}>{a.account_id}</td>
                    <td>{a.name}</td>
                    <td><span className="badge badge-blue">{a.account_type}</span></td>
                    <td className="mono" style={{ color: parseFloat(a.balance) < 0 ? 'var(--red-400)' : 'var(--green-400)' }}>
                      ${parseFloat(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge ${a.status === 'A' || a.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                        {a.status === 'A' || a.status === 'ACTIVE' ? 'Active' : a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 20 }}>
            {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div className="card fade-up" style={{
                  padding: '18px 20px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', transition: 'all 0.2s',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                >
                  <Icon size={16} color="var(--gold-400)" />
                  <span style={{ fontSize: 13, color: 'var(--slate-100)' }}>{label}</span>
                  <ArrowRight size={12} color="var(--slate-500)" style={{ marginLeft: 'auto' }} />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </PageWrapper>
  )
}
