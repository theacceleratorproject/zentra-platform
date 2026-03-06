// services/api.js
// All HTTP calls to the Zentra FastAPI backend

const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Health
  health: () => request('/health'),

  // Accounts
  accounts:       () => request('/accounts'),
  accountHealth:  () => request('/accounts/health'),

  // Loans
  calculateLoan:  (body) => request('/loans/calculate',  { method: 'POST', body: JSON.stringify(body) }),
  amortizeLoan:   (body) => request('/loans/amortize',   { method: 'POST', body: JSON.stringify(body) }),

  // Transactions
  validateTxns:   () => request('/transactions/validate', { method: 'POST' }),
  processTxns:    () => request('/transactions/process',  { method: 'POST' }),
  getLedger:      () => request('/transactions/ledger'),
  getRejected:    () => request('/transactions/rejected'),

  // Reports
  runFees:        () => request('/reports/fees',     { method: 'POST' }),
  runInterest:    () => request('/reports/interest', { method: 'POST' }),
  getEOD:         () => request('/reports/eod'),
  getEODText:     () => fetch(`${BASE}/reports/eod/text`).then(r => r.text()),
  getOutputFiles: () => request('/reports/files'),

  // Batch
  runBatch:       () => request('/batch/run',    { method: 'POST' }),
  batchStatus:    () => request('/batch/status'),
}
