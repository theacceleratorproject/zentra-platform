// pages/Transactions.jsx
import { useState } from 'react'
import { api } from '../services/api'
import { PageWrapper, SectionHeader, LoadingState } from '../components/UI'
import { CheckCircle, XCircle, ArrowRight, FileText, AlertTriangle } from 'lucide-react'

const ERROR_CODES = {
  E01: 'Account not found',
  E02: 'Account inactive',
  E03: 'Invalid amount',
  E04: 'Insufficient funds',
  E05: 'Exceeds limit ($100k)',
  E06: 'Invalid transfer target',
}

function StepCard({ num, title, sub, onClick, loading, done, disabled, children }) {
  return (
    <div className="card fade-up" style={{
      padding: 24,
      borderLeft: done ? '3px solid var(--green-400)' : '3px solid var(--navy-600)',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: done ? 'var(--green-dim)' : 'var(--navy-700)',
          border: `1px solid ${done ? 'var(--green-400)' : 'rgba(255,255,255,0.1)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: done ? 'var(--green-400)' : 'var(--slate-500)',
        }}>
          {done ? '✓' : num}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{sub}</div>
        </div>
        <button className="btn-primary" onClick={onClick} disabled={loading || disabled}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 16px' }}>
          {loading
            ? <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Running</>
            : done ? 'Re-run' : 'Run'}
        </button>
      </div>
      {children}
    </div>
  )
}

export default function Transactions() {
  const [validResult, setValidResult] = useState(null)
  const [procResult, setProcResult]   = useState(null)
  const [ledger, setLedger]           = useState(null)
  const [rejected, setRejected]       = useState(null)
  const [loading, setLoading]         = useState({})
  const [tab, setTab]                 = useState('pipeline')

  const run = async (key, fn, setter) => {
    setLoading(l => ({ ...l, [key]: true }))
    try { setter(await fn()) }
    catch (e) { alert(`Error: ${e.message}`) }
    finally { setLoading(l => ({ ...l, [key]: false })) }
  }

  return (
    <PageWrapper>
      <SectionHeader
        title="Transactions"
        sub="COBOL validation pipeline — TXN-VALIDATOR · TXN-PROCESSOR"
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0 }}>
        {[['pipeline', 'Pipeline'], ['ledger', 'Ledger'], ['rejected', 'Rejected']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: 'none', border: 'none',
            padding: '8px 16px', fontSize: 13, fontWeight: 500,
            color: tab === key ? 'var(--gold-400)' : 'var(--slate-500)',
            borderBottom: `2px solid ${tab === key ? 'var(--gold-500)' : 'transparent'}`,
            cursor: 'pointer', marginBottom: -1, transition: 'all 0.15s',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Pipeline Tab */}
      {tab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step 1 — Validate */}
          <StepCard num="1" title="Validate Transactions" sub="TXN-VALIDATOR.cbl — 6 business rules (E01–E06)"
            onClick={() => run('validate', api.validateTxns, setValidResult)}
            loading={loading.validate} done={!!validResult}>
            {validResult && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  { label: 'Total Read',  value: validResult.total_read,     color: 'var(--slate-100)' },
                  { label: 'Approved',    value: validResult.approved_count,  color: 'var(--green-400)' },
                  { label: 'Rejected',    value: validResult.rejected_count,  color: 'var(--red-400)' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'var(--navy-900)', borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px', textAlign: 'center',
                  }}>
                    <div className="label">{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}
          </StepCard>

          {/* Step 2 — Process */}
          <StepCard num="2" title="Process Transactions" sub="TXN-PROCESSOR.cbl — apply approved, update balances"
            onClick={() => run('process', api.processTxns, setProcResult)}
            loading={loading.process} done={!!procResult}
            disabled={!validResult}>
            {procResult && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  { label: 'Applied',    value: procResult.transactions_applied, color: 'var(--slate-100)' },
                  { label: 'Deposited',  value: procResult.total_deposited,      color: 'var(--green-400)' },
                  { label: 'Withdrawn',  value: procResult.total_withdrawn,      color: 'var(--red-400)' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'var(--navy-900)', borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px', textAlign: 'center',
                  }}>
                    <div className="label">{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}
          </StepCard>

          {/* Flow hint */}
          {!validResult && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--slate-500)', fontSize: 13 }}>
              <ArrowRight size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Run Step 1 first — validation must precede processing
            </div>
          )}
        </div>
      )}

      {/* Ledger Tab */}
      {tab === 'ledger' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn-primary" onClick={() => run('ledger', api.getLedger, setLedger)}
              disabled={loading.ledger}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 16px' }}>
              {loading.ledger
                ? <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Loading</>
                : <><FileText size={13} /> Load Ledger</>}
            </button>
          </div>
          <div className="card fade-up" style={{ overflow: 'hidden' }}>
            {loading.ledger && <LoadingState label="Reading TXN-LEDGER.dat..." />}
            {!ledger && !loading.ledger && (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--slate-500)' }}>
                <FileText size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                <div>Click "Load Ledger" to read TXN-LEDGER.dat</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Run the pipeline first if no data exists</div>
              </div>
            )}
            {ledger && (
              <>
                <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="label" style={{ marginBottom: 0 }}>TXN-LEDGER.dat</span>
                  <span className="badge badge-green" style={{ marginLeft: 12 }}>{ledger.entry_count} entries</span>
                </div>
                <div style={{ maxHeight: 480, overflowY: 'auto', padding: '12px 24px' }}>
                  {ledger.entries.map((line, i) => (
                    <div key={i} style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11,
                      color: 'var(--slate-300)', padding: '4px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                    }}>
                      {line}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Rejected Tab */}
      {tab === 'rejected' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn-primary" onClick={() => run('rejected', api.getRejected, setRejected)}
              disabled={loading.rejected}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 16px' }}>
              {loading.rejected
                ? <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Loading</>
                : <><AlertTriangle size={13} /> Load Rejected</>}
            </button>
          </div>
          <div className="card fade-up" style={{ overflow: 'hidden' }}>
            {loading.rejected && <LoadingState label="Reading REJECTED-TRANSACTIONS.dat..." />}
            {!rejected && !loading.rejected && (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--slate-500)' }}>
                <XCircle size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                <div>Load rejected transactions to view failures</div>
              </div>
            )}
            {rejected && (
              <>
                <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="label" style={{ marginBottom: 0 }}>Rejected Records</span>
                  <span className="badge badge-red" style={{ marginLeft: 12 }}>{rejected.rejected_count} failed</span>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th><th>Account</th><th>Type</th><th>Error Code</th><th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejected.records.map((r, i) => (
                      <tr key={i}>
                        <td className="mono" style={{ fontSize: 12 }}>{r.date}</td>
                        <td className="mono" style={{ color: 'var(--gold-400)', fontSize: 12 }}>{r.account_id}</td>
                        <td><span className="badge badge-blue">{r.txn_type}</span></td>
                        <td><span className="badge badge-red">{r.error_code}</span></td>
                        <td style={{ color: 'var(--slate-300)', fontSize: 12 }}>{ERROR_CODES[r.error_code] ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
