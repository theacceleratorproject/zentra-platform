import { useState } from 'react';
import { DollarSign, TrendingUp, FileText, FolderOpen, Loader2, Play } from 'lucide-react';
import { api, formatCurrency } from '@/services/api';
import { useT } from '@/i18n';

export default function Reports() {
  const t = useT();
  const [feesData, setFeesData] = useState<{ maintenance: number; low_balance: number; overdraft: number; total: number } | null>(null);
  const [feesLoading, setFeesLoading] = useState(false);
  const [intData, setIntData] = useState<{ accounts_credited: number; total_interest: number } | null>(null);
  const [intLoading, setIntLoading] = useState(false);
  const [eodData, setEodData] = useState<{ report: string; lines: number; file: string } | null>(null);
  const [eodLoading, setEodLoading] = useState(false);
  const [files, setFiles] = useState<Array<{ name: string; size: string }> | null>(null);
  const [filesLoading, setFilesLoading] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">{t.reports.title}</h1>

      {/* Fee Engine */}
      <div className="zen-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign size={20} className="text-gold" />
            <div>
              <h3 className="font-semibold">{t.reports.feeReport}</h3>
              <p className="text-xs text-slate-500 font-mono">{t.reports.feeSub}</p>
            </div>
          </div>
          {!feesData && (
            <button onClick={async () => { setFeesLoading(true); setFeesData(await api.runFees()); setFeesLoading(false); }} disabled={feesLoading} className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
              {feesLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} {t.reports.generateFees}
            </button>
          )}
        </div>
        {feesData && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-navy-700/50 rounded-lg p-3 text-center"><p className="text-xs text-slate-500">{t.reports.maintenanceFee}</p><p className="font-mono text-lg font-semibold">{feesData.maintenance}</p></div>
            <div className="bg-navy-700/50 rounded-lg p-3 text-center"><p className="text-xs text-slate-500">{t.reports.lowBalanceFee}</p><p className="font-mono text-lg font-semibold">{feesData.low_balance}</p></div>
            <div className="bg-navy-700/50 rounded-lg p-3 text-center"><p className="text-xs text-slate-500">{t.reports.overdraftFee}</p><p className="font-mono text-lg font-semibold">{feesData.overdraft}</p></div>
            <div className="bg-navy-700/50 rounded-lg p-3 text-center"><p className="text-xs text-slate-500">{t.reports.totalFees}</p><p className="font-mono text-lg font-semibold text-gold">{formatCurrency(feesData.total)}</p></div>
          </div>
        )}
      </div>

      {/* Interest Calculator */}
      <div className="zen-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-gold" />
            <div>
              <h3 className="font-semibold">{t.reports.interestReport}</h3>
              <p className="text-xs text-slate-500 font-mono">{t.reports.interestSub}</p>
            </div>
          </div>
          {!intData && (
            <button onClick={async () => { setIntLoading(true); setIntData(await api.runInterest()); setIntLoading(false); }} disabled={intLoading} className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
              {intLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} {t.reports.generateInterest}
            </button>
          )}
        </div>
        {intData && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-navy-700/50 rounded-lg p-3 text-center"><p className="text-xs text-slate-500">{t.reports.accountsProcessed}</p><p className="font-mono text-lg font-semibold">{intData.accounts_credited}</p></div>
            <div className="bg-navy-700/50 rounded-lg p-3 text-center"><p className="text-xs text-slate-500">{t.reports.totalInterest}</p><p className="font-mono text-lg font-semibold text-zen-green">{formatCurrency(intData.total_interest)}</p></div>
          </div>
        )}
      </div>

      {/* EOD Report */}
      <div className="zen-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-gold" />
            <div>
              <h3 className="font-semibold">{t.reports.eodReport}</h3>
              <p className="text-xs text-slate-500 font-mono">{t.reports.eodSub}</p>
            </div>
          </div>
          {!eodData && (
            <button onClick={async () => { setEodLoading(true); setEodData(await api.getEOD()); setEodLoading(false); }} disabled={eodLoading} className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
              {eodLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} {t.reports.generateEOD}
            </button>
          )}
        </div>
        {eodData && (
          <div className="mt-4 space-y-3">
            <div className="terminal-box p-4 whitespace-pre overflow-auto max-h-[400px] text-xs leading-relaxed">
              {eodData.report}
            </div>
            <div className="flex gap-2">
              <span className="badge-green">{eodData.lines} lines</span>
              <span className="badge-gold">{eodData.file}</span>
            </div>
          </div>
        )}
      </div>

      {/* Output Files */}
      <div className="zen-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FolderOpen size={20} className="text-gold" />
            <h3 className="font-semibold">{t.reports.reportOutput}</h3>
          </div>
          {!files && (
            <button onClick={async () => { setFilesLoading(true); setFiles((await api.getFiles()).files); setFilesLoading(false); }} disabled={filesLoading} className="flex items-center gap-2 px-4 py-2 border border-border text-foreground font-medium rounded-lg text-sm hover:border-primary/30 hover:text-gold transition-colors disabled:opacity-50">
              {filesLoading ? <Loader2 size={14} className="animate-spin" /> : null} {t.common.refresh}
            </button>
          )}
        </div>
        {files && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-border">
                <th className="text-left py-2 px-3">{t.common.name}</th>
                <th className="text-right py-2 px-3">{t.common.details}</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f, i) => (
                <tr key={f.name} className={`border-b border-border/30 ${i % 2 === 1 ? 'bg-navy-700/10' : ''}`}>
                  <td className="py-2 px-3 font-mono text-gold text-xs">{f.name}</td>
                  <td className="py-2 px-3 text-right font-mono text-xs text-slate-300">{f.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
