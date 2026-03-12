const BASE = import.meta.env.VITE_API_BASE || '/api';

export const api = {
  health: async () => {
    return fetch(`${BASE}/health`).then(r => r.json());
  },

  accounts: async () => {
    return fetch(`${BASE}/accounts`).then(r => r.json());
  },

  calculateLoan: async (body: { principal: number; annual_rate: number; years: number }) => {
    return fetch(`${BASE}/loans/calculate`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }).then(r => r.json());
  },

  amortizeLoan: async (body: { principal: number; annual_rate: number; years: number }) => {
    return fetch(`${BASE}/loans/amortize`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }).then(r => r.json());
  },

  validateTxns: async () => {
    return fetch(`${BASE}/transactions/validate`, { method: 'POST' }).then(r => r.json());
  },

  processTxns: async () => {
    return fetch(`${BASE}/transactions/process`, { method: 'POST' }).then(r => r.json());
  },

  getLedger: async () => {
    return fetch(`${BASE}/transactions/ledger`).then(r => r.json());
  },

  getRejected: async () => {
    return fetch(`${BASE}/transactions/rejected`).then(r => r.json());
  },

  runFees: async () => {
    return fetch(`${BASE}/reports/fees`, { method: 'POST' }).then(r => r.json());
  },

  runInterest: async () => {
    return fetch(`${BASE}/reports/interest`, { method: 'POST' }).then(r => r.json());
  },

  getEOD: async () => {
    return fetch(`${BASE}/reports/eod`).then(r => r.json());
  },

  getFiles: async () => {
    return fetch(`${BASE}/reports/files`).then(r => r.json());
  },

  runBatch: async () => {
    return fetch(`${BASE}/batch/run`, { method: 'POST' }).then(r => r.json());
  },

  closeAccount: async (accountId: string) => {
    const res = await fetch(`${BASE}/accounts/${accountId}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to close account' }));
      throw new Error(err.detail || `Error ${res.status}`);
    }
    return res.json();
  },
};

export const formatCurrency = (val: number) =>
  val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
