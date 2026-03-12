import { useState, useCallback } from 'react';
import { Zap, Check, X, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { useT } from '@/i18n';

interface Step {
  titleKey: string;
  program: string;
  descKey: string;
  stdout: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
}

export default function BatchPipeline() {
  const t = useT();

  const makeSteps = (): Step[] => [
    { titleKey: 'feeEngine', program: 'FEE-ENGINE.cbl', descKey: 'feeEngine', stdout: '', status: 'pending' },
    { titleKey: 'validator', program: 'TXN-VALIDATOR.cbl', descKey: 'validator', stdout: '', status: 'pending' },
    { titleKey: 'processor', program: 'TXN-PROCESSOR.cbl', descKey: 'processor', stdout: '', status: 'pending' },
    { titleKey: 'interest', program: 'INTEREST-CALC.cbl', descKey: 'interest', stdout: '', status: 'pending' },
    { titleKey: 'eodReport', program: 'EOD-REPORT.cbl', descKey: 'eodReport', stdout: '', status: 'pending' },
  ];

  const [steps, setSteps] = useState<Step[]>(makeSteps());
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');

  const runBatch = useCallback(async () => {
    setRunning(true);
    setDone(false);
    setError('');
    const freshSteps = makeSteps();
    setSteps(freshSteps);
    const start = Date.now();

    // Animate steps running while API executes
    for (let i = 0; i < freshSteps.length; i++) {
      setSteps(prev => prev.map((s, j) => j === i ? { ...s, status: 'running' } : s));
      await new Promise(r => setTimeout(r, 400));
      setSteps(prev => prev.map((s, j) => j === i ? { ...s, status: 'passed' } : s));
    }

    try {
      const result = await api.runBatch();
      if (result.steps) {
        setSteps(prev => prev.map((s, i) => {
          const stepResult = result.steps[i];
          return stepResult ? {
            ...s,
            status: stepResult.passed ? 'passed' : 'failed',
            stdout: stepResult.stdout || stepResult.output || '',
          } : s;
        }));
      }
    } catch (e) {
      setError(String(e));
      setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'failed' } : s));
    }

    setDuration(((Date.now() - start) / 1000).toFixed(2) + 's');
    setRunning(false);
    setDone(true);
  }, []);

  const passedCount = steps.filter(s => s.status === 'passed').length;
  const failedCount = steps.filter(s => s.status === 'failed').length;
  const activeIndex = steps.findIndex(s => s.status === 'running');
  const progressPct = done ? 100 : activeIndex >= 0 ? ((activeIndex) / steps.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold">{t.batch.title}</h1>

      {/* Hero control */}
      <div className="zen-card p-5 md:p-8 border border-primary/20 bg-gradient-to-br from-navy-800 to-navy-700 text-center">
        <h2 className="font-display text-xl md:text-2xl font-bold mb-2">{t.batch.subtitle}</h2>
        <p className="text-xs md:text-sm text-slate-300 mb-6 max-w-lg mx-auto">
          {t.batch.steps.feeEngine} → {t.batch.steps.validator} → {t.batch.steps.processor} → {t.batch.steps.interest} → {t.batch.steps.eodReport}
        </p>
        <button
          onClick={runBatch}
          disabled={running}
          className="inline-flex items-center gap-2 px-8 py-3 bg-gold-500 text-primary-foreground font-bold rounded-lg text-base hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
        >
          {running ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
          {running ? t.batch.running : t.batch.runBatch}
        </button>

        {done && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-6">
            <div><span className={failedCount > 0 ? 'badge-red' : 'badge-green'}>{failedCount > 0 ? t.batch.failed : t.batch.completed}</span></div>
            <div className="text-sm"><span className="text-slate-500">{t.batch.step}:</span> <span className="font-mono text-foreground">{passedCount}/5</span></div>
            <div className="text-sm"><span className="text-slate-500">{t.batch.duration}:</span> <span className="font-mono text-gold">{duration}</span></div>
          </div>
        )}
        {error && <p className="text-zen-red text-xs mt-3 font-mono">{error}</p>}
      </div>

      {/* Steps */}
      <div className="relative pl-10">
        {/* Progress line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border">
          <div className="w-full bg-gold-500 transition-all duration-500" style={{ height: `${progressPct}%` }} />
        </div>

        <div className="space-y-5">
          {steps.map((step, i) => (
            <div key={i} className={`zen-card p-4 md:p-5 relative transition-all duration-300 ${step.status === 'passed' ? 'border-l-2' : ''}`} style={{ borderLeftColor: step.status === 'passed' ? '#4ade80' : step.status === 'failed' ? '#f87171' : undefined }}>
              {/* Circle */}
              <div className={`absolute -left-[30px] top-5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step.status === 'passed' ? 'bg-zen-green text-primary-foreground' :
                step.status === 'running' ? 'bg-gold-500 text-primary-foreground' :
                step.status === 'failed' ? 'bg-zen-red text-primary-foreground' :
                'bg-navy-800 border-2 border-border text-slate-500'
              }`}>
                {step.status === 'passed' ? <Check size={14} /> : step.status === 'failed' ? <X size={14} /> : step.status === 'running' ? <Loader2 size={14} className="animate-spin" /> : i + 1}
              </div>

              <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm md:text-base">{t.batch.step} {i + 1} — {t.batch.steps[step.titleKey as keyof typeof t.batch.steps]}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.batch.stepDesc[step.descKey as keyof typeof t.batch.stepDesc]}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-mono text-xs text-gold hidden sm:inline">{step.program}</span>
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                    step.status === 'pending' ? 'bg-navy-700/50 text-slate-500' :
                    step.status === 'running' ? 'badge-gold' :
                    step.status === 'passed' ? 'badge-green' : 'badge-red'
                  }`}>
                    {step.status === 'pending' ? t.batch.idle :
                     step.status === 'running' ? t.batch.running :
                     step.status === 'passed' ? t.batch.completed : t.batch.failed}
                  </span>
                </div>
              </div>

              {(step.status === 'passed' || step.status === 'failed') && step.stdout && (
                <div className="terminal-box p-3 mt-3 text-xs">
                  {step.stdout}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
