import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { api, formatCurrency } from '@/services/api';

const errorLegend = [
  { code: 'E01', desc: 'Account not found' },
  { code: 'E02', desc: 'Account inactive' },
  { code: 'E03', desc: 'Invalid amount' },
  { code: 'E04', desc: 'Insufficient funds' },
  { code: 'E05', desc: 'Exceeds $100k limit' },
  { code: 'E06', desc: 'Invalid transfer target' },
];

export default function Transactions() {
  const [tab, setTab] = useState<'pipeline' | 'ledger' | 'rejected'>('pipeline');

  // Pipeline state
  const [step1Done, setStep1Done] = useState(false);
  const [step1Loading, setStep1Loading] = useState(false);
  const [step1Data, setStep1Data] = useState<{ total_read: number; approved: number; rejected: number } | null>(null);
  const [step2Done, setStep2Done] = useState(false);
  const [step2Loading, setStep2Loading] = useState(false);
  const [step2Data, setStep2Data] = useState<{ applied: number; deposited: number; withdrawn: number } | null>(null);

  // Ledger
  const [ledger, setLedger] = useState<Array<{ date: string; account: string; type: string; amount: number; balance: number }> | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Rejected
  const [rejected, setRejected] = useState<Array<{ date: string; account: string; type: string; errorCode: string; reason: string }> | null>(null);
  const [rejLoading, setRejLoading] = useState(false);

  const runStep1 = async () => {
    setStep1Loading(true);
    const data = await api.validateTxns();
    setStep1Data(data);
    setStep1Done(true);
    setStep1Loading(false);
  };

  const runStep2 = async () => {
    setStep2Loading(true);
    const data = await api.processTxns();
    setStep2Data(data);
    setStep2Done(true);
    setStep2Loading(false);
  };

  const loadLedger = async () => {
    setLedgerLoading(true);
    const data = await api.getLedger();
    setLedger(data.entries);
    setLedgerLoading(false);
  };

  const loadRejected = async () => {
    setRejLoading(true);
    const data = await api.getRejected();
    setRejected(data.rejected);
    setRejLoading(false);
  };

  const tabs = [
    { key: 'pipeline' as const, label: 'Pipeline' },
    { key: 'ledger' as const, label: 'Ledger' },
    { key: 'rejected' as const, label: 'Rejected' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Transactions</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-primary text-gold' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Pipeline */}
      {tab === 'pipeline' && (
        <div className="relative pl-8">
          {/* Connector line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

          {/* Step 1 */}
          <div className={`zen-card p-5 mb-5 relative ${step1Done ? 'border-l-2 border-l-zen-green' : ''}`} style={{ borderLeftColor: step1Done ? undefined : undefined }}>
            <div className="absolute -left-[25px] top-5 w-4 h-4 rounded-full bg-navy-800 border-2 ${step1Done ? 'border-zen-green bg-zen-green' : 'border-border'}" style={{ borderColor: step1Done ? '#4ade80' : undefined, background: step1Done ? '#4ade80' : undefined }} />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Step 1 — Validate Transactions</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">TXN-VALIDATOR.cbl — 6 business rules (E01–E06)</p>
              </div>
              {!step1Done && (
                <button onClick={runStep1} disabled={step1Loading} className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                  {step1Loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run
                </button>
              )}
            </div>
            {step1Data && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-navy-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">Total Read</p>
                  <p className="font-mono text-lg font-semibold">{step1Data.total_read}</p>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">Approved</p>
                  <p className="font-mono text-lg font-semibold text-zen-green">{step1Data.approved}</p>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">Rejected</p>
                  <p className="font-mono text-lg font-semibold text-zen-red">{step1Data.rejected}</p>
                </div>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className={`zen-card p-5 relative ${!step1Done ? 'opacity-50 pointer-events-none' : ''} ${step2Done ? 'border-l-2' : ''}`} style={{ borderLeftColor: step2Done ? '#4ade80' : undefined }}>
            <div className="absolute -left-[25px] top-5 w-4 h-4 rounded-full bg-navy-800 border-2" style={{ borderColor: step2Done ? '#4ade80' : undefined, background: step2Done ? '#4ade80' : undefined }} />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Step 2 — Process Transactions</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">TXN-PROCESSOR.cbl — apply approved, update balances</p>
              </div>
              {!step2Done && step1Done && (
                <button onClick={runStep2} disabled={step2Loading} className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                  {step2Loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run
                </button>
              )}
            </div>
            {step2Data && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-navy-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">Applied</p>
                  <p className="font-mono text-lg font-semibold">{step2Data.applied}</p>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">Deposited</p>
                  <p className="font-mono text-lg font-semibold text-zen-green">{formatCurrency(step2Data.deposited)}</p>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">Withdrawn</p>
                  <p className="font-mono text-lg font-semibold text-zen-red">{formatCurrency(step2Data.withdrawn)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ledger */}
      {tab === 'ledger' && (
        <div className="space-y-4">
          {!ledger && (
            <button onClick={loadLedger} disabled={ledgerLoading} className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {ledgerLoading ? <Loader2 size={14} className="animate-spin" /> : null} Load Ledger
            </button>
          )}
          {ledger && (
            <div className="terminal-box p-4 max-h-[400px] overflow-auto">
              {ledger.map((e, i) => (
                <div key={i}>
                  {e.date} | {e.account} | {e.type} | {e.amount >= 0 ? '+' : ''}{formatCurrency(e.amount)} | Balance: {formatCurrency(e.balance)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rejected */}
      {tab === 'rejected' && (
        <div className="space-y-4">
          {!rejected && (
            <button onClick={loadRejected} disabled={rejLoading} className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {rejLoading ? <Loader2 size={14} className="animate-spin" /> : null} Load Rejected
            </button>
          )}
          {rejected && (
            <>
              <div className="zen-card p-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-border">
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-left py-2 px-3">Account</th>
                      <th className="text-left py-2 px-3">Type</th>
                      <th className="text-left py-2 px-3">Error Code</th>
                      <th className="text-left py-2 px-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejected.map((r, i) => (
                      <tr key={i} className="border-b border-border/30">
                        <td className="py-2 px-3 font-mono text-xs">{r.date}</td>
                        <td className="py-2 px-3 font-mono text-gold">{r.account}</td>
                        <td className="py-2 px-3">{r.type}</td>
                        <td className="py-2 px-3"><span className="badge-red">{r.errorCode}</span></td>
                        <td className="py-2 px-3 text-slate-300">{r.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-slate-500 font-mono space-x-4">
                {errorLegend.map(e => (
                  <span key={e.code}><span className="text-zen-red">{e.code}</span> {e.desc}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
