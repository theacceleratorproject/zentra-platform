import { useState, useCallback } from 'react';
import { Zap, Check, X, Loader2 } from 'lucide-react';

interface Step {
  title: string;
  program: string;
  description: string;
  stdout: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
}

const initialSteps: Step[] = [
  { title: 'Fee Engine', program: 'FEE-ENGINE.cbl', description: 'Generate fee transactions', stdout: 'Fees Generated: 4 | Maintenance: 2 | Low-Bal: 1 | OD: 1 | Total: $75.00', status: 'pending' },
  { title: 'Transaction Validator', program: 'TXN-VALIDATOR.cbl', description: 'Apply 6 business rules (E01–E06)', stdout: 'Read: 12 | Approved: 9 | Rejected: 3', status: 'pending' },
  { title: 'Transaction Processor', program: 'TXN-PROCESSOR.cbl', description: 'Apply approved transactions', stdout: 'Applied: 9 | Deposited: $15,000.00 | Withdrawn: $2,310.00', status: 'pending' },
  { title: 'Interest Calculator', program: 'INTEREST-CALC.cbl', description: 'Compute daily interest', stdout: 'Accounts Credited: 5 | Total Interest: $127.43', status: 'pending' },
  { title: 'End-of-Day Report', program: 'EOD-REPORT.cbl', description: 'Generate management report', stdout: 'Report Generated: 47 lines | File: EOD-REPORT.dat', status: 'pending' },
];

export default function BatchPipeline() {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [duration, setDuration] = useState('');

  const runBatch = useCallback(async () => {
    setRunning(true);
    setDone(false);
    setSteps(initialSteps);
    const start = Date.now();

    for (let i = 0; i < initialSteps.length; i++) {
      // Set current to running
      setSteps(prev => prev.map((s, j) => j === i ? { ...s, status: 'running' } : s));
      await new Promise(r => setTimeout(r, 600));
      // Set current to passed
      setSteps(prev => prev.map((s, j) => j === i ? { ...s, status: 'passed' } : s));
    }

    setDuration(((Date.now() - start) / 1000).toFixed(2) + 's');
    setRunning(false);
    setDone(true);
  }, []);

  const passedCount = steps.filter(s => s.status === 'passed').length;
  const activeIndex = steps.findIndex(s => s.status === 'running');
  const progressPct = done ? 100 : activeIndex >= 0 ? ((activeIndex) / steps.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Batch Pipeline</h1>

      {/* Hero control */}
      <div className="zen-card p-8 border border-primary/20 bg-gradient-to-br from-navy-800 to-navy-700 text-center">
        <h2 className="font-display text-2xl font-bold mb-2">Daily Batch Cycle</h2>
        <p className="text-sm text-slate-300 mb-6 max-w-lg mx-auto">
          Orchestrates FEE-ENGINE → TXN-VALIDATOR → TXN-PROCESSOR → INTEREST-CALC → EOD-REPORT
        </p>
        <button
          onClick={runBatch}
          disabled={running}
          className="inline-flex items-center gap-2 px-8 py-3 bg-gold-500 text-primary-foreground font-bold rounded-lg text-base hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {running ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
          {running ? 'Running...' : 'Run Full Batch'}
        </button>

        {done && (
          <div className="flex items-center justify-center gap-8 mt-6">
            <div><span className="badge-green">✓ All Passed</span></div>
            <div className="text-sm"><span className="text-slate-500">Steps:</span> <span className="font-mono text-foreground">{passedCount}/5</span></div>
            <div className="text-sm"><span className="text-slate-500">Duration:</span> <span className="font-mono text-gold">{duration}</span></div>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="relative pl-10">
        {/* Progress line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border">
          <div className="w-full bg-gold-500 transition-all duration-500" style={{ height: `${progressPct}%` }} />
        </div>

        <div className="space-y-5">
          {steps.map((step, i) => (
            <div key={i} className={`zen-card p-5 relative transition-all duration-300 ${step.status === 'passed' ? 'border-l-2' : ''}`} style={{ borderLeftColor: step.status === 'passed' ? '#4ade80' : step.status === 'failed' ? '#f87171' : undefined }}>
              {/* Circle */}
              <div className={`absolute -left-[30px] top-5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step.status === 'passed' ? 'bg-zen-green text-primary-foreground' :
                step.status === 'running' ? 'bg-gold-500 text-primary-foreground' :
                step.status === 'failed' ? 'bg-zen-red text-primary-foreground' :
                'bg-navy-800 border-2 border-border text-slate-500'
              }`}>
                {step.status === 'passed' ? <Check size={14} /> : step.status === 'failed' ? <X size={14} /> : step.status === 'running' ? <Loader2 size={14} className="animate-spin" /> : i + 1}
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">Step {i + 1} — {step.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gold">{step.program}</span>
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                    step.status === 'pending' ? 'bg-navy-700/50 text-slate-500' :
                    step.status === 'running' ? 'badge-gold' :
                    step.status === 'passed' ? 'badge-green' : 'badge-red'
                  }`}>
                    {step.status}
                  </span>
                </div>
              </div>

              {step.status === 'passed' && (
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
