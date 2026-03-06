// pages/Batch.jsx
import { useState } from 'react'
import { api } from '../services/api'
import { PageWrapper, SectionHeader } from '../components/UI'
import { Play, CheckCircle, XCircle, Clock, Zap } from 'lucide-react'

const STEPS = [
  { key: 'fee_engine',    label: 'Fee Engine',             program: 'FEE-ENGINE.cbl',     desc: 'Generate fee transactions' },
  { key: 'txn_validator', label: 'Transaction Validator',  program: 'TXN-VALIDATOR.cbl',  desc: 'Apply 6 business rules' },
  { key: 'txn_processor', label: 'Transaction Processor',  program: 'TXN-PROCESSOR.cbl',  desc: 'Apply approved transactions' },
  { key: 'interest_calc', label: 'Interest Calculator',    program: 'INTEREST-CALC.cbl',  desc: 'Compute daily interest' },
  { key: 'eod_report',    label: 'End-of-Day Report',      program: 'EOD-REPORT.cbl',     desc: 'Generate management report' },
]

export default function Batch() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [startTs, setStartTs] = useState(null)
  const [elapsed, setElapsed] = useState(null)

  const runBatch = async () => {
    setLoading(true); setResult(null); setElapsed(null)
    const start = Date.now()
    setStartTs(start)
    try {
      const res = await api.runBatch()
      setResult(res)
      setElapsed(((Date.now() - start) / 1000).toFixed(2))
    } catch (e) {
      alert(`Batch error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const stepResult = (key) => result?.steps?.[key]

  return (
    <PageWrapper>
      <SectionHeader
        title="Batch Pipeline"
        sub="Full daily processing cycle — 5 COBOL programs in sequence"
      />

      {/* Control Card */}
      <div className="card fade-up" style={{
        padding: 32,
        marginBottom: 24,
        background: 'linear-gradient(135deg, var(--navy-800), var(--navy-900))',
        border: '1px solid rgba(212,175,55,0.15)',
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 8 }}>
          Daily Batch Cycle
        </div>
        <div style={{ color: 'var(--slate-500)', fontSize: 13, marginBottom: 28 }}>
          Orchestrates FEE-ENGINE → TXN-VALIDATOR → TXN-PROCESSOR → INTEREST-CALC → EOD-REPORT
        </div>

        <button
          className="btn-primary"
          onClick={runBatch}
          disabled={loading}
          style={{
            fontSize: 15, padding: '14px 36px',
            display: 'inline-flex', alignItems: 'center', gap: 10,
            borderRadius: 8,
          }}
        >
          {loading
            ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Running Pipeline...</>
            : <><Zap size={16} /> Run Full Batch</>}
        </button>

        {result && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 24 }}>
            <div>
              <div className="label">Outcome</div>
              <span className={`badge ${result.success ? 'badge-green' : 'badge-red'}`}>
                {result.success ? '✓ All Passed' : '✗ Some Failed'}
              </span>
            </div>
            <div>
              <div className="label">Steps Passed</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--slate-100)' }}>
                {result.steps_passed} / {result.steps_run}
              </div>
            </div>
            <div>
              <div className="label">Duration</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--gold-400)' }}>
                {elapsed}s
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Steps */}
      <div style={{ position: 'relative' }}>
        {/* Connector line */}
        <div style={{
          position: 'absolute',
          left: 27, top: 40, bottom: 40,
          width: 2,
          background: 'linear-gradient(to bottom, var(--gold-500), var(--navy-600))',
          opacity: 0.3,
          zIndex: 0,
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map((step, i) => {
            const res = stepResult(step.key)
            const isRunning = loading
            const isPassed  = res?.success === true
            const isFailed  = res?.success === false
            const isPending = !res && !loading

            return (
              <div key={step.key} className="card fade-up" style={{
                padding: '18px 20px 18px 60px',
                position: 'relative',
                borderLeft: isPassed
                  ? '3px solid var(--green-400)'
                  : isFailed
                  ? '3px solid var(--red-400)'
                  : '3px solid var(--navy-600)',
                transition: 'all 0.3s',
                animationDelay: `${i * 0.06}s`,
              }}>
                {/* Step icon */}
                <div style={{
                  position: 'absolute',
                  left: 16, top: '50%', transform: 'translateY(-50%)',
                  width: 28, height: 28, borderRadius: '50%',
                  background: isPassed ? 'var(--green-dim)' : isFailed ? 'var(--red-dim)' : 'var(--navy-700)',
                  border: `1px solid ${isPassed ? 'var(--green-400)' : isFailed ? 'var(--red-400)' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1,
                }}>
                  {isPassed  && <CheckCircle size={14} color="var(--green-400)" />}
                  {isFailed  && <XCircle     size={14} color="var(--red-400)" />}
                  {isPending && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--slate-500)' }}>{i + 1}</span>}
                  {isRunning && !res && <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{step.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{step.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold-400)', marginBottom: 4 }}>
                      {step.program}
                    </div>
                    {isPassed && <span className="badge badge-green">PASSED</span>}
                    {isFailed && <span className="badge badge-red">FAILED</span>}
                    {isPending && !loading && <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--slate-500)' }}>PENDING</span>}
                    {loading && !res && <span className="badge badge-gold">RUNNING</span>}
                  </div>
                </div>

                {/* COBOL stdout preview */}
                {res?.stdout && (
                  <div style={{
                    marginTop: 10,
                    background: 'var(--navy-950)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--slate-500)',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 80,
                    overflowY: 'auto',
                    lineHeight: 1.7,
                  }}>
                    {res.stdout || '[ no output ]'}
                  </div>
                )}
                {res?.error && (
                  <div style={{
                    marginTop: 8,
                    background: 'var(--red-dim)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--red-400)',
                  }}>
                    {res.error}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Hint */}
      {!result && !loading && (
        <div style={{ textAlign: 'center', color: 'var(--slate-500)', fontSize: 13, marginTop: 32 }}>
          <Play size={14} style={{ verticalAlign: 'middle', marginRight: 6, opacity: 0.4 }} />
          Click "Run Full Batch" to execute all 5 COBOL programs in sequence
        </div>
      )}
    </PageWrapper>
  )
}
