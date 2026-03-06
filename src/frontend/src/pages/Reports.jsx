// pages/Reports.jsx
import { useState } from 'react'
import { api } from '../services/api'
import { PageWrapper, SectionHeader, LoadingState } from '../components/UI'
import { DollarSign, TrendingUp, FileText, FolderOpen } from 'lucide-react'

function ReportCard({ title, sub, icon: Icon, onRun, loading, result, renderResult }) {
  return (
    <div className="card fade-up" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--gold-glow)', border: '1px solid rgba(212,175,55,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={16} color="var(--gold-400)" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{sub}</div>
          </div>
        </div>
        <button className="btn-primary" onClick={onRun} disabled={loading}
          style={{ fontSize: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
          {loading
            ? <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Running</>
            : 'Run'}
        </button>
      </div>
      {loading && <LoadingState label="Running COBOL program..." />}
      {result && !loading && renderResult(result)}
    </div>
  )
}

export default function Reports() {
  const [fees, setFees]         = useState(null)
  const [interest, setInterest] = useState(null)
  const [eod, setEod]           = useState(null)
  const [files, setFiles]       = useState(null)
  const [loading, setLoading]   = useState({})

  const run = async (key, fn, setter) => {
    setLoading(l => ({ ...l, [key]: true }))
    try { setter(await fn()) }
    catch (e) { alert(`Error: ${e.message}`) }
    finally { setLoading(l => ({ ...l, [key]: false })) }
  }

  return (
    <PageWrapper>
      <SectionHeader
        title="Reports"
        sub="Fee engine · Interest calculator · End-of-day management report"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Fee Engine */}
        <ReportCard
          title="Fee Engine" icon={DollarSign}
          sub="FEE-ENGINE.cbl — maintenance, low-balance, overdraft fees"
          onRun={() => run('fees', api.runFees, setFees)}
          loading={loading.fees} result={fees}
          renderResult={r => (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[
                { label: 'Maintenance', value: r.fees.maintenance },
                { label: 'Low Balance', value: r.fees.low_balance },
                { label: 'Overdraft',   value: r.fees.overdraft },
                { label: 'Total Fees',  value: r.fees.total, gold: true },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--navy-900)', borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px', textAlign: 'center',
                }}>
                  <div className="label">{s.label}</div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 22,
                    color: s.gold ? 'var(--gold-400)' : 'var(--slate-100)',
                  }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        />

        {/* Interest Calculator */}
        <ReportCard
          title="Interest Calculator" icon={TrendingUp}
          sub="INTEREST-CALC.cbl — daily interest from rate table"
          onRun={() => run('interest', api.runInterest, setInterest)}
          loading={loading.interest} result={interest}
          renderResult={r => (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Accounts Credited', value: r.accounts_credited, color: 'var(--blue-400)' },
                { label: 'Total Interest',    value: r.total_interest,    color: 'var(--green-400)' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--navy-900)', borderRadius: 'var(--radius-sm)',
                  padding: '16px 20px', textAlign: 'center',
                }}>
                  <div className="label">{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: s.color }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        />

        {/* EOD Report */}
        <div className="card fade-up" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--gold-glow)', border: '1px solid rgba(212,175,55,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={16} color="var(--gold-400)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>End-of-Day Report</div>
                <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>EOD-REPORT.cbl — management summary</div>
              </div>
            </div>
            <button className="btn-primary" onClick={() => run('eod', api.getEOD, setEod)}
              disabled={loading.eod}
              style={{ fontSize: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              {loading.eod
                ? <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Generating</>
                : 'Generate Report'}
            </button>
          </div>
          {loading.eod && <LoadingState label="Running EOD-REPORT.cbl..." />}
          {eod && !loading.eod && (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <span className="badge badge-green">{eod.report_lines} lines</span>
                <span className="badge badge-gold">EOD-REPORT.dat</span>
              </div>
              <div style={{
                background: 'var(--navy-950)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px 20px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--green-400)',
                whiteSpace: 'pre',
                overflowX: 'auto',
                maxHeight: 400,
                overflowY: 'auto',
                lineHeight: 1.8,
              }}>
                {eod.report_text || '[ No report data — run the batch pipeline first ]'}
              </div>
            </>
          )}
        </div>

        {/* Output Files */}
        <div className="card fade-up" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <FolderOpen size={15} color="var(--slate-300)" />
              <span className="label" style={{ marginBottom: 0 }}>Output Files — data/output/</span>
            </div>
            <button className="btn-ghost" onClick={() => run('files', api.getOutputFiles, setFiles)}
              disabled={loading.files} style={{ fontSize: 12 }}>
              {loading.files ? 'Loading...' : 'Scan Files'}
            </button>
          </div>
          {files && (
            files.files.length === 0
              ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--slate-500)', fontSize: 13 }}>No output files found</div>
              : <table className="table">
                  <thead>
                    <tr><th>Filename</th><th>Size</th></tr>
                  </thead>
                  <tbody>
                    {files.files.map(f => (
                      <tr key={f.name}>
                        <td className="mono" style={{ color: 'var(--gold-400)', fontSize: 12 }}>{f.name}</td>
                        <td className="mono" style={{ color: 'var(--slate-500)', fontSize: 12 }}>{f.size_kb} KB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
