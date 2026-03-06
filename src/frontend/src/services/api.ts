const BASE = 'http://localhost:8000';
const USE_MOCK = true;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockAccounts = [
  { id: 'ZNT-001', name: 'Alice Johnson', type: 'CHECKING', balance: 14250.75, status: 'Active' },
  { id: 'ZNT-002', name: 'Bob Martinez', type: 'SAVINGS', balance: 87500.00, status: 'Active' },
  { id: 'ZNT-003', name: 'Carol Whitfield', type: 'BUSINESS', balance: 312000.50, status: 'Active' },
  { id: 'ZNT-004', name: 'David Chen', type: 'CHECKING', balance: -450.25, status: 'Active' },
  { id: 'ZNT-005', name: 'Elena Kowalski', type: 'SAVINGS', balance: 5200.00, status: 'Active' },
  { id: 'ZNT-INT', name: 'Internal Reserve', type: 'INTERNAL', balance: 1002500.00, status: 'Active' },
];

const mockLedgerData = [
  { date: '2026-03-06', account: 'ZNT-002', type: 'DEP', amount: 5000.00, balance: 87500.00 },
  { date: '2026-03-06', account: 'ZNT-001', type: 'WDR', amount: -250.00, balance: 14250.75 },
  { date: '2026-03-06', account: 'ZNT-003', type: 'DEP', amount: 10000.00, balance: 312000.50 },
  { date: '2026-03-06', account: 'ZNT-001', type: 'DEP', amount: 1500.00, balance: 14500.75 },
  { date: '2026-03-06', account: 'ZNT-005', type: 'DEP', amount: 200.00, balance: 5200.00 },
  { date: '2026-03-06', account: 'ZNT-004', type: 'WDR', amount: -800.00, balance: -450.25 },
  { date: '2026-03-06', account: 'ZNT-002', type: 'DEP', amount: 3150.00, balance: 90650.00 },
  { date: '2026-03-06', account: 'ZNT-003', type: 'WDR', amount: -1260.00, balance: 310740.50 },
  { date: '2026-03-06', account: 'ZNT-001', type: 'DEP', amount: 750.00, balance: 15250.75 },
];

const mockRejectedData = [
  { date: '2026-03-06', account: 'ZNT-999', type: 'DEP', errorCode: 'E01', reason: 'Account not found' },
  { date: '2026-03-06', account: 'ZNT-004', type: 'WDR', errorCode: 'E04', reason: 'Insufficient funds' },
  { date: '2026-03-06', account: 'ZNT-001', type: 'WDR', errorCode: 'E05', reason: 'Exceeds limit ($100k)' },
];

function calculateLoan(principal: number, annualRate: number, years: number) {
  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  const totalCost = payment * n;
  const totalInterest = totalCost - principal;
  return { monthlyPayment: payment, totalInterest, totalCost, n };
}

function amortize(principal: number, annualRate: number, years: number) {
  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  const schedule = [];
  let balance = principal;
  for (let i = 1; i <= n; i++) {
    const interest = balance * monthlyRate;
    const principalPortion = payment - interest;
    balance -= principalPortion;
    schedule.push({
      number: i,
      payment,
      principal: principalPortion,
      interest,
      balance: Math.max(0, balance),
    });
  }
  return schedule;
}

export const api = {
  health: async () => {
    if (USE_MOCK) { await delay(300); return { status: 'online', engine: 'GnuCOBOL 3.2' }; }
    return fetch(`${BASE}/health`).then(r => r.json());
  },

  accounts: async () => {
    if (USE_MOCK) { await delay(500); return { accounts: mockAccounts }; }
    return fetch(`${BASE}/accounts`).then(r => r.json());
  },

  calculateLoan: async (body: { principal: number; annual_rate: number; years: number }) => {
    if (USE_MOCK) {
      await delay(400);
      return calculateLoan(body.principal, body.annual_rate, body.years);
    }
    return fetch(`${BASE}/loans/calculate`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }).then(r => r.json());
  },

  amortizeLoan: async (body: { principal: number; annual_rate: number; years: number }) => {
    if (USE_MOCK) {
      await delay(400);
      return { schedule: amortize(body.principal, body.annual_rate, body.years) };
    }
    return fetch(`${BASE}/loans/amortize`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }).then(r => r.json());
  },

  validateTxns: async () => {
    if (USE_MOCK) { await delay(700); return { total_read: 12, approved: 9, rejected: 3 }; }
    return fetch(`${BASE}/transactions/validate`, { method: 'POST' }).then(r => r.json());
  },

  processTxns: async () => {
    if (USE_MOCK) { await delay(600); return { applied: 9, deposited: 14850.00, withdrawn: 2310.00 }; }
    return fetch(`${BASE}/transactions/process`, { method: 'POST' }).then(r => r.json());
  },

  getLedger: async () => {
    if (USE_MOCK) { await delay(400); return { entries: mockLedgerData }; }
    return fetch(`${BASE}/transactions/ledger`).then(r => r.json());
  },

  getRejected: async () => {
    if (USE_MOCK) { await delay(400); return { rejected: mockRejectedData }; }
    return fetch(`${BASE}/transactions/rejected`).then(r => r.json());
  },

  runFees: async () => {
    if (USE_MOCK) { await delay(600); return { maintenance: 2, low_balance: 1, overdraft: 1, total: 75.00 }; }
    return fetch(`${BASE}/reports/fees`, { method: 'POST' }).then(r => r.json());
  },

  runInterest: async () => {
    if (USE_MOCK) { await delay(500); return { accounts_credited: 5, total_interest: 127.43 }; }
    return fetch(`${BASE}/reports/interest`, { method: 'POST' }).then(r => r.json());
  },

  getEOD: async () => {
    if (USE_MOCK) {
      await delay(700);
      return {
        report: `================================================
  ZENTRA BANK — END OF DAY REPORT
  Date: 2026-03-06
================================================

  Opening Balance:      $1,384,000.00
  Total Deposits:          $15,000.00
  Total Withdrawals:       $2,310.00
  Fee Revenue:                $75.00
  Interest Credited:        $127.43
  Closing Balance:      $1,396,892.43

------------------------------------------------
  Accounts Processed:              6
  Transactions Applied:            9
  Transactions Rejected:           3
  Approval Rate:               75.0%
================================================`,
        lines: 47,
        file: 'EOD-REPORT.dat',
      };
    }
    return fetch(`${BASE}/reports/eod`).then(r => r.json());
  },

  getFiles: async () => {
    if (USE_MOCK) {
      await delay(400);
      return {
        files: [
          { name: 'ACCOUNTS-MASTER.dat', size: '0.60 KB' },
          { name: 'DAILY-TRANSACTIONS.dat', size: '1.20 KB' },
          { name: 'APPROVED-TRANSACTIONS.dat', size: '0.90 KB' },
          { name: 'REJECTED-TRANSACTIONS.dat', size: '0.30 KB' },
          { name: 'TXN-LEDGER.dat', size: '0.85 KB' },
          { name: 'INTEREST-TRANSACTIONS.dat', size: '0.48 KB' },
          { name: 'EOD-REPORT.dat', size: '1.10 KB' },
        ],
      };
    }
    return fetch(`${BASE}/reports/files`).then(r => r.json());
  },

  runBatch: async () => {
    if (USE_MOCK) {
      // This is handled step-by-step in the Batch page component
      return { success: true };
    }
    return fetch(`${BASE}/batch/run`, { method: 'POST' }).then(r => r.json());
  },
};

export const formatCurrency = (val: number) =>
  val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
