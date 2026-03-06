// pages/Accounts.jsx
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { PageWrapper, SectionHeader, StatCard, Grid, LoadingState, ErrorState } from '../components/UI'
import { Users, RefreshCw, TrendingDown, CheckCircle } from 'lucide-react'

export default function Accounts() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true); setError(null)
    api.accounts()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const accounts = data?.accounts ?? []
  const totalBal = accounts.reduce((s, a) => s + parseFloat(a.balance || 0), 0)
  const overdrafts = accounts.filter(a => parseFloat(a.balance) < 0).length
  const active = accounts.filter(a => a.status === 'A' || a.status === 'ACTIVE').length

  return (
    <PageWrapper>
      <SectionHeader
        title="Accounts"
        sub={`Master account file — ${data?.count ?? 0} records`}
        action={
          <button className="btn-ghost" onClick={load} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} className={loading ? 'spinner' : ''} />
            Refresh
          </button>
        }
      />

      <Grid cols={3} gap={16}>
        <StatCard label="Total Accounts" value={data?.count ?? '—'} icon={Users} />
        <StatCard label="Active" value={active} icon={CheckCircle} accent="var(--green-400)" />
        <StatCard label="Overdrafts" value={overdrafts} icon={TrendingDown} accent="var(--red-400)"
          sub={overdrafts > 0 ? 'Action required' : 'All accounts healthy'} />
      </Grid>

      <div className="card fade-up" style={{ marginTop: 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="label" style={{ marginBottom: 0 }}>Account Master File — ACCOUNTS-MASTER.dat</div>
        </div>

        {loading && <LoadingState label="Running ACCOUNT-LOADER.cbl..." />}
        {error   && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && (
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
              {accounts.map(a => {
                const bal = parseFloat(a.balance || 0)
                const isOverdraft = bal < 0
                const isActive = a.status === 'A' || a.status === 'ACTIVE'
                return (
                  <tr key={a.account_id}>
                    <td>
                      <span className="mono" style={{ color: 'var(--gold-400)', fontSize: 12 }}>
                        {a.account_id}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{a.name}</td>
                    <td><span className="badge badge-blue">{a.account_type}</span></td>
                    <td>
                      <span className="mono" style={{
                        color: isOverdraft ? 'var(--red-400)' : 'var(--green-400)',
                        fontSize: 13,
                      }}>
                        {isOverdraft ? '-' : ''}${Math.abs(bal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      {isOverdraft && <span className="badge badge-red" style={{ marginLeft: 8 }}>OD</span>}
                    </td>
                    <td>
                      <span className={`badge ${isActive ? 'badge-green' : 'badge-red'}`}>
                        {isActive ? 'Active' : a.status === 'F' ? 'Frozen' : 'Closed'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {!loading && !error && accounts.length > 0 && (
          <div style={{
            padding: '14px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'flex-end',
            fontFamily: 'var(--font-mono)', fontSize: 12,
          }}>
            <span style={{ color: 'var(--slate-500)' }}>Net System Balance: </span>
            <span style={{ color: totalBal >= 0 ? 'var(--green-400)' : 'var(--red-400)', marginLeft: 8 }}>
              ${totalBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
