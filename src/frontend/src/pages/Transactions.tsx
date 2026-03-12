import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { api, formatCurrency } from '@/services/api';
import { useT } from '@/i18n';

export default function Transactions() {
  const t = useT();

  const errorLegend = [
    { code: 'E01', desc: t.transactions.description === 'Description' ? 'Account not found' : 'Compte introuvable' },
    { code: 'E02', desc: t.transactions.description === 'Description' ? 'Account inactive' : 'Compte inactif' },
    { code: 'E03', desc: t.transactions.description === 'Description' ? 'Invalid amount' : 'Montant invalide' },
    { code: 'E04', desc: t.transactions.description === 'Description' ? 'Insufficient funds' : 'Fonds insuffisants' },
    { code: 'E05', desc: t.transactions.description === 'Description' ? 'Exceeds $100k limit' : 'Dépasse 100k$' },
    { code: 'E06', desc: t.transactions.description === 'Description' ? 'Invalid transfer target' : 'Cible de virement invalide' },
  ];

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
    { key: 'ledger' as const, label: t.transactions.ledger },
    { key: 'rejected' as const, label: t.transactions.rejected },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">{t.transactions.title}</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === tb.key ? 'border-primary text-gold' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Pipeline */}
      {tab === 'pipeline' && (
        <div className="relative pl-8">
          {/* Connector line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

          {/* Step 1 */}
          <div className={`zen-card p-5 mb-5 relative ${step1Done ? 'border-l-2 border-l-zen-green' : ''}`}>
            <div className="absolute -left-[25px] top-5 w-4 h-4 rounded-full bg-navy-800 border-2" style={{ borderColor: step1Done ? '#4ade80' : undefined, background: step1Done ? '#4ade80' : undefined }} />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{t.transactions.validateTitle}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">{t.transactions.validateSub}</p>
              </div>
              {!step1Done && (
                <button onClick={runStep1} disabled={step1Loading} className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                  {step1Loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} {t.transactions.runValidation}
                </button>
              )}
            </div>
            {step1Data && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-navy-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">{t.common.total}</p>
                  <p className="font-mono text-lg font-semibold">{step1Data.total_read}</p>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">{t.transactions.approved}</p>
                  <p className="font-mono text-lg font-semibold text-zen-green">{step1Data.approved}</p>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">{t.transactions.rejected}</p>
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
                <h3 className="font-semibold">{t.transactions.processTitle}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">{t.transactions.processSub}</p>
              </div>
              {!step2Done && step1Done && (
                <button onClick={runStep2} disabled={step2Loading} className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                  {step2Loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} {t.transactions.runProcessing}
                </button>
              )}
            </div>
            {step2Data && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-navy-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">{t.transactions.approved}</p>
                  <p className="font-mono text-lg font-semibold">{step2Data.applied}</p>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">{t.transactions.deposit}</p>
                  <p className="font-mono text-lg font-semibold text-zen-green">{formatCurrency(step2Data.deposited)}</p>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">{t.transactions.withdrawal}</p>
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
              {ledgerLoading ? <Loader2 size={14} className="animate-spin" /> : null} {t.transactions.ledger}
            </button>
          )}
          {ledger && (
            <div className="terminal-box p-4 max-h-[400px] overflow-auto">
              {ledger.map((e, i) => (
                <div key={i}>
                  {e.date} | {e.account} | {e.type} | {e.amount >= 0 ? '+' : ''}{formatCurrency(e.amount)} | {t.common.balance}: {formatCurrency(e.balance)}
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
              {rejLoading ? <Loader2 size={14} className="animate-spin" /> : null} {t.transactions.rejected}
            </button>
          )}
          {rejected && (
            <>
              <div className="zen-card p-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-border">
                      <th className="text-left py-2 px-3">{t.common.date}</th>
                      <th className="text-left py-2 px-3">{t.nav.accounts}</th>
                      <th className="text-left py-2 px-3">{t.common.type}</th>
                      <th className="text-left py-2 px-3">{t.transactions.errorCode}</th>
                      <th className="text-left py-2 px-3">{t.transactions.description}</th>
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
