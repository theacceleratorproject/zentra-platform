import { useState, useEffect, useCallback } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:   #0a0f1e;
    --navy2:  #111827;
    --navy3:  #1c2535;
    --navy4:  #243044;
    --gold:   #c9a84c;
    --gold2:  #e8c97a;
    --gold3:  #f5e6b8;
    --white:  #f8f6f1;
    --muted:  #8a95a8;
    --red:    #e05252;
    --green:  #4caf82;
    --border: rgba(201,168,76,0.15);
    --glass:  rgba(255,255,255,0.04);
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--navy);
    color: var(--white);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .app {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    background: var(--navy);
    position: relative;
    overflow: hidden;
  }

  /* ── AUTH ── */
  .auth-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 0;
    background: var(--navy);
  }
  .auth-hero {
    background: linear-gradient(160deg, #0d1529 0%, #1a2540 60%, #0a0f1e 100%);
    padding: 72px 32px 48px;
    position: relative;
    overflow: hidden;
  }
  .auth-hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 240px; height: 240px;
    border-radius: 50%;
    border: 1px solid rgba(201,168,76,0.12);
  }
  .auth-hero::after {
    content: '';
    position: absolute;
    bottom: -40px; left: -40px;
    width: 180px; height: 180px;
    border-radius: 50%;
    border: 1px solid rgba(201,168,76,0.08);
  }
  .auth-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px;
    font-weight: 300;
    letter-spacing: 6px;
    color: var(--white);
    margin-bottom: 8px;
  }
  .auth-logo span { color: var(--gold); }
  .auth-tagline {
    font-size: 12px;
    letter-spacing: 3px;
    color: var(--muted);
    text-transform: uppercase;
  }
  .auth-body {
    padding: 40px 28px;
    flex: 1;
  }
  .auth-tabs {
    display: flex;
    background: var(--navy3);
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 32px;
  }
  .auth-tab {
    flex: 1;
    padding: 10px;
    border: none;
    background: none;
    color: var(--muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    border-radius: 9px;
    cursor: pointer;
    transition: all .2s;
  }
  .auth-tab.active {
    background: var(--gold);
    color: var(--navy);
  }

  /* ── INPUTS ── */
  .field {
    margin-bottom: 18px;
  }
  .field label {
    display: block;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .field input, .field select {
    width: 100%;
    background: var(--navy3);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    outline: none;
    transition: border-color .2s;
    -webkit-appearance: none;
  }
  .field input:focus, .field select:focus {
    border-color: var(--gold);
  }
  .field select option { background: var(--navy2); }

  /* ── BUTTONS ── */
  .btn-primary {
    width: 100%;
    background: var(--gold);
    color: var(--navy);
    border: none;
    border-radius: 12px;
    padding: 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all .2s;
    margin-top: 8px;
  }
  .btn-primary:hover { background: var(--gold2); transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }

  .btn-ghost {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--white);
    border-radius: 12px;
    padding: 14px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: all .2s;
  }
  .btn-ghost:hover { border-color: var(--gold); color: var(--gold); }

  .btn-danger {
    background: rgba(224,82,82,0.12);
    border: 1px solid rgba(224,82,82,0.3);
    color: var(--red);
    border-radius: 10px;
    padding: 12px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: all .2s;
    width: 100%;
    margin-top: 8px;
  }

  /* ── TOP BAR ── */
  .topbar {
    padding: 52px 24px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    background: var(--navy);
    z-index: 10;
  }
  .topbar-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 400;
    letter-spacing: 4px;
    color: var(--white);
  }
  .topbar-logo span { color: var(--gold); }
  .topbar-actions { display: flex; gap: 12px; align-items: center; }
  .icon-btn {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: var(--navy3);
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: all .2s;
    position: relative;
  }
  .icon-btn:hover { border-color: var(--gold); }
  .notif-dot {
    position: absolute;
    top: 6px; right: 6px;
    width: 8px; height: 8px;
    background: var(--gold);
    border-radius: 50%;
    border: 2px solid var(--navy);
  }

  /* ── PAGE SCROLL ── */
  .page {
    padding: 0 20px 100px;
    overflow-y: auto;
    min-height: calc(100vh - 80px);
  }

  /* ── GREETING ── */
  .greeting {
    margin-bottom: 24px;
  }
  .greeting-sub {
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 4px;
  }
  .greeting-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px;
    font-weight: 400;
    color: var(--white);
  }

  /* ── BALANCE HERO ── */
  .balance-hero {
    background: linear-gradient(135deg, #1a2a4a 0%, #0d1a30 100%);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px 24px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  .balance-hero::before {
    content: 'Z';
    font-family: 'Cormorant Garamond', serif;
    font-size: 180px;
    font-weight: 300;
    color: rgba(201,168,76,0.04);
    position: absolute;
    right: -20px; bottom: -40px;
    line-height: 1;
  }
  .balance-label {
    font-size: 11px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .balance-amount {
    font-family: 'Cormorant Garamond', serif;
    font-size: 44px;
    font-weight: 300;
    color: var(--white);
    line-height: 1;
    margin-bottom: 4px;
  }
  .balance-cents {
    font-size: 24px;
    color: var(--gold);
  }
  .balance-change {
    font-size: 13px;
    color: var(--green);
    margin-top: 8px;
  }
  .balance-change.negative { color: var(--red); }

  /* ── ACCOUNT PILLS ── */
  .account-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    margin-bottom: 28px;
    padding-bottom: 4px;
    scrollbar-width: none;
  }
  .account-scroll::-webkit-scrollbar { display: none; }
  .account-pill {
    min-width: 160px;
    background: var(--navy3);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    cursor: pointer;
    transition: all .2s;
    flex-shrink: 0;
  }
  .account-pill.active {
    border-color: var(--gold);
    background: rgba(201,168,76,0.06);
  }
  .account-pill:hover { border-color: var(--gold); }
  .pill-type {
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .pill-id {
    font-size: 12px;
    color: var(--gold);
    margin-bottom: 8px;
    font-family: monospace;
  }
  .pill-balance {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 500;
    color: var(--white);
  }
  .pill-status {
    display: inline-block;
    margin-top: 6px;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .pill-status.active { background: rgba(76,175,130,0.15); color: var(--green); }
  .pill-status.suspended { background: rgba(224,82,82,0.15); color: var(--red); }

  /* ── QUICK ACTIONS ── */
  .section-title {
    font-size: 11px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 14px;
  }
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 28px;
  }
  .qa-btn {
    background: var(--navy3);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all .2s;
    text-align: center;
  }
  .qa-btn:hover { border-color: var(--gold); background: rgba(201,168,76,0.05); }
  .qa-icon { font-size: 22px; }
  .qa-label {
    font-size: 10px;
    letter-spacing: .5px;
    color: var(--muted);
    line-height: 1.3;
  }

  /* ── TRANSACTIONS ── */
  .txn-list { display: flex; flex-direction: column; gap: 2px; }
  .txn-item {
    background: var(--navy3);
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: background .15s;
  }
  .txn-item:hover { background: var(--navy4); }
  .txn-icon {
    width: 38px; height: 38px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .txn-icon.dep { background: rgba(76,175,130,0.15); }
  .txn-icon.wth { background: rgba(224,82,82,0.15); }
  .txn-icon.xfr { background: rgba(201,168,76,0.15); }
  .txn-icon.fee { background: rgba(138,149,168,0.15); }
  .txn-details { flex: 1; min-width: 0; }
  .txn-desc {
    font-size: 14px;
    font-weight: 500;
    color: var(--white);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 3px;
  }
  .txn-meta { font-size: 11px; color: var(--muted); }
  .txn-amount {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 500;
    flex-shrink: 0;
  }
  .txn-amount.credit { color: var(--green); }
  .txn-amount.debit { color: var(--red); }

  /* ── ALERTS ── */
  .alert-card {
    background: rgba(201,168,76,0.06);
    border: 1px solid rgba(201,168,76,0.2);
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 10px;
  }
  .alert-card.danger {
    background: rgba(224,82,82,0.06);
    border-color: rgba(224,82,82,0.2);
  }
  .alert-icon { font-size: 18px; flex-shrink: 0; }
  .alert-title { font-size: 13px; font-weight: 500; margin-bottom: 2px; }
  .alert-body { font-size: 12px; color: var(--muted); line-height: 1.5; }

  /* ── FORM PAGES ── */
  .page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px;
    font-weight: 300;
    color: var(--white);
    margin-bottom: 6px;
  }
  .page-subtitle {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 28px;
    line-height: 1.5;
  }
  .amount-display {
    background: var(--navy3);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    margin-bottom: 24px;
  }
  .amount-display .currency {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    color: var(--gold);
    vertical-align: super;
    margin-right: 4px;
  }
  .amount-display input {
    background: none;
    border: none;
    outline: none;
    font-family: 'Cormorant Garamond', serif;
    font-size: 52px;
    font-weight: 300;
    color: var(--white);
    width: 180px;
    text-align: center;
    -moz-appearance: textfield;
  }
  .amount-display input::-webkit-outer-spin-button,
  .amount-display input::-webkit-inner-spin-button { -webkit-appearance: none; }

  .confirm-box {
    background: var(--navy3);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 20px;
  }
  .confirm-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 13px;
  }
  .confirm-row:last-child { border-bottom: none; }
  .confirm-row span:first-child { color: var(--muted); }
  .confirm-row span:last-child { font-weight: 500; }

  /* ── SUCCESS ── */
  .success-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 28px;
    text-align: center;
    min-height: 60vh;
  }
  .success-ring {
    width: 80px; height: 80px;
    border-radius: 50%;
    background: rgba(76,175,130,0.15);
    border: 1px solid rgba(76,175,130,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 36px;
    margin-bottom: 24px;
  }
  .success-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 400;
    margin-bottom: 10px;
  }
  .success-sub { font-size: 14px; color: var(--muted); margin-bottom: 32px; }
  .success-ref {
    font-family: monospace;
    font-size: 12px;
    color: var(--gold);
    background: var(--navy3);
    padding: 8px 16px;
    border-radius: 8px;
    margin-bottom: 32px;
    letter-spacing: 1px;
  }

  /* ── BOTTOM NAV ── */
  .bottom-nav {
    position: fixed;
    bottom: 0; left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    background: rgba(10,15,30,0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex;
    padding: 10px 0 24px;
    z-index: 100;
  }
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 0;
    cursor: pointer;
    transition: color .2s;
    color: var(--muted);
    border: none;
    background: none;
  }
  .nav-item.active { color: var(--gold); }
  .nav-icon { font-size: 20px; }
  .nav-label { font-size: 10px; letter-spacing: .5px; }

  /* ── PROFILE PAGE ── */
  .profile-avatar {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--navy4));
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 400;
    color: var(--navy);
    margin-bottom: 16px;
    border: 2px solid var(--border);
  }
  .profile-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 400;
    margin-bottom: 4px;
  }
  .profile-email { font-size: 13px; color: var(--muted); margin-bottom: 28px; }

  .settings-group { margin-bottom: 24px; }
  .settings-item {
    background: var(--navy3);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 15px 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 2px;
    cursor: pointer;
    transition: background .15s;
  }
  .settings-item:hover { background: var(--navy4); }
  .settings-icon { font-size: 18px; width: 24px; text-align: center; }
  .settings-label { flex: 1; font-size: 14px; }
  .settings-arrow { color: var(--muted); font-size: 12px; }
  .settings-value { font-size: 13px; color: var(--muted); }

  /* ── STATUS TAGS ── */
  .tag {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    letter-spacing: .5px;
    text-transform: uppercase;
  }
  .tag-pending { background: rgba(201,168,76,0.15); color: var(--gold); }
  .tag-approved { background: rgba(76,175,130,0.15); color: var(--green); }
  .tag-rejected { background: rgba(224,82,82,0.15); color: var(--red); }

  /* ── BATCH INDICATOR ── */
  .batch-bar {
    background: rgba(201,168,76,0.06);
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: 10px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    font-size: 12px;
    color: var(--gold);
  }
  .batch-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--gold);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .3; }
  }

  /* ── LOADING ── */
  .spinner {
    width: 20px; height: 20px;
    border: 2px solid rgba(255,255,255,.1);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin .6s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 20px 0;
  }

  .back-btn {
    background: none;
    border: none;
    color: var(--gold);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
    padding: 0;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_ACCOUNTS = [
  { id: "ZNT-001042", name: "MARCK PIERRE",    type: "CHECKING", balance: 18473.30, status: "A", overdraftLimit: 500.00 },
  { id: "ZNT-001043", name: "MARCK PIERRE",    type: "SAVINGS",  balance: 52000.00, status: "A", overdraftLimit: 0 },
  { id: "ZNT-001098", name: "MARCK PIERRE",    type: "CHECKING", balance: -124.50,  status: "A", overdraftLimit: 500.00 },
];

const MOCK_TXNS = [
  { id: "T001", date: "2026-03-07", type: "DEP", desc: "DIRECT DEPOSIT PAYROLL", amount: 3750.00, acct: "ZNT-001042", status: "APR" },
  { id: "T002", date: "2026-03-06", type: "WTH", desc: "ONLINE PURCHASE AMAZON", amount: 124.99,  acct: "ZNT-001042", status: "APR" },
  { id: "T003", date: "2026-03-06", type: "XFR", desc: "TRANSFER TO SAVINGS",    amount: 500.00,  acct: "ZNT-001042", status: "APR" },
  { id: "T004", date: "2026-03-05", type: "DEP", desc: "MOBILE CHECK DEPOSIT",  amount: 250.00,  acct: "ZNT-001043", status: "PND" },
  { id: "T005", date: "2026-03-05", type: "FEE", desc: "MONTHLY MAINTENANCE",   amount: 12.00,   acct: "ZNT-001042", status: "APR" },
  { id: "T006", date: "2026-03-04", type: "WTH", desc: "ATM WITHDRAWAL",        amount: 200.00,  acct: "ZNT-001042", status: "APR" },
  { id: "T007", date: "2026-03-03", type: "DEP", desc: "INTEREST CREDIT",       amount: 18734.90,acct: "ZNT-001043", status: "APR" },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n));
const fmtFull = (n) => `${n < 0 ? "-" : ""}$${fmt(n)}`;
const genId = () => "ZNT-" + Math.floor(100000 + Math.random() * 900000);
const genRef = () => "ZB" + Date.now().toString().slice(-8).toUpperCase();

const txnIcon = (type) => ({ DEP: "↓", WTH: "↑", XFR: "⇄", FEE: "●" }[type] || "●");
const txnClass = (type) => ({ DEP: "dep", WTH: "wth", XFR: "xfr", FEE: "fee" }[type] || "fee");
const isCredit = (type) => type === "DEP";

// ─── API LAYER ─────────────────────────────────────────────────────────────────
// Uses /api prefix — Vite proxy (dev) and nginx (prod) route to FastAPI on :8000
const BASE_URL = "/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

const api = {
  async getAccounts() {
    try {
      const data = await apiFetch("/accounts");
      return data.accounts;
    } catch {
      return MOCK_ACCOUNTS;
    }
  },

  async getTransactions(accountId) {
    try {
      const query = accountId ? `?account_id=${accountId}&limit=50` : "?limit=50";
      const data = await apiFetch(`/transactions/ledger${query}`);
      return data.transactions.map(t => ({
        id:     `${t.account_id}-${t.date}-${Math.random().toString(36).slice(2,6)}`,
        date:   t.date,
        type:   t.type === "WDR" ? "WTH" : t.type,
        desc:   t.description,
        amount: t.amount,
        acct:   t.account_id,
        status: t.status,
      }));
    } catch {
      return MOCK_TXNS.filter(t => t.acct === accountId || !accountId);
    }
  },

  async deposit(accountId, amount, desc) {
    return apiFetch("/transactions/deposit", {
      method: "POST",
      body: JSON.stringify({
        account_id: accountId,
        amount: parseFloat(amount),
        description: desc || "PORTAL DEPOSIT",
      }),
    });
  },

  async withdraw(accountId, amount, desc) {
    return apiFetch("/transactions/withdraw", {
      method: "POST",
      body: JSON.stringify({
        account_id: accountId,
        amount: parseFloat(amount),
        description: desc || "PORTAL WITHDRAWAL",
      }),
    });
  },

  async transfer(fromId, toId, amount, desc) {
    return apiFetch("/transactions/transfer", {
      method: "POST",
      body: JSON.stringify({
        from_account_id: fromId,
        to_account_id: toId,
        amount: parseFloat(amount),
        description: desc || "PORTAL TRANSFER",
      }),
    });
  },

  async createAccount(data) {
    return apiFetch("/accounts", {
      method: "POST",
      body: JSON.stringify({
        name: data.ownerName || "ZENTRA CLIENT",
        type: data.type,
      }),
    });
  },

  async closeAccount(accountId) {
    return apiFetch(`/accounts/${accountId}`, { method: "DELETE" });
  },
};

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", confirmPassword: "" });

  const handle = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    onLogin({ name: form.name || "Marck Pierre", email: form.email || "marck@zentra.bank" });
    setLoading(false);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <div className="auth-logo">ZENTR<span>A</span></div>
        <div className="auth-tagline">Private Banking Platform</div>
      </div>
      <div className="auth-body">
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Sign In</button>
          <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Open Account</button>
        </div>

        {tab === "login" ? (
          <>
            <div className="field">
              <label>Email Address</label>
              <input type="email" placeholder="you@zentra.bank" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} />
            </div>
            <button className="btn-primary" onClick={handle} disabled={loading}>
              {loading ? <span className="spinner" /> : "Sign In"}
            </button>
          </>
        ) : (
          <>
            <div className="field">
              <label>Full Name</label>
              <input type="text" placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div className="field">
              <label>Email Address</label>
              <input type="email" placeholder="you@zentra.bank" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set("password", e.target.value)} />
            </div>
            <button className="btn-primary" onClick={handle} disabled={loading}>
              {loading ? <span className="spinner" /> : "Create Account"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard({ user, accounts, transactions, onNav, onSelectAccount, selectedAccount }) {
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const activeAccount = selectedAccount || accounts[0];
  const recentTxns = transactions.slice(0, 4);
  const alerts = accounts.filter(a => a.balance < 0 || a.balance < 200);

  return (
    <div className="page">
      <div className="greeting">
        <div className="greeting-sub">Good morning</div>
        <div className="greeting-name">{user.name.split(" ")[0]}</div>
      </div>

      {alerts.length > 0 && (
        <>
          <p className="section-title">Alerts</p>
          {accounts.filter(a => a.balance < 0).map(a => (
            <div key={a.id} className="alert-card danger">
              <div className="alert-icon">⚠️</div>
              <div>
                <div className="alert-title">Overdraft — {a.id}</div>
                <div className="alert-body">Balance is {fmtFull(a.balance)}. Overdraft fee may apply.</div>
              </div>
            </div>
          ))}
          {accounts.filter(a => a.balance >= 0 && a.balance < 200).map(a => (
            <div key={a.id} className="alert-card">
              <div className="alert-icon">💛</div>
              <div>
                <div className="alert-title">Low Balance — {a.id}</div>
                <div className="alert-body">Balance is {fmtFull(a.balance)}. Consider a deposit.</div>
              </div>
            </div>
          ))}
        </>
      )}

      <div className="balance-hero">
        <div className="balance-label">Total Portfolio</div>
        <div className="balance-amount">
          <span style={{ fontSize: 22, color: "var(--gold)", verticalAlign: "super", marginRight: 4 }}>$</span>
          {fmt(totalBalance).split(".")[0]}
          <span className="balance-cents">.{fmt(totalBalance).split(".")[1]}</span>
        </div>
        <div className={`balance-change ${totalBalance < 0 ? "negative" : ""}`}>
          ↑ $18,734.90 interest credited last cycle
        </div>
      </div>

      <div className="batch-bar">
        <div className="batch-dot" />
        <span>Nightly batch reconciliation runs at 22:00 EST</span>
      </div>

      <p className="section-title">Accounts</p>
      <div className="account-scroll">
        {accounts.map(a => (
          <div key={a.id} className={`account-pill ${activeAccount?.id === a.id ? "active" : ""}`}
               onClick={() => onSelectAccount(a)}>
            <div className="pill-type">{a.type}</div>
            <div className="pill-id">{a.id}</div>
            <div className="pill-balance" style={{ color: a.balance < 0 ? "var(--red)" : "var(--white)" }}>
              {fmtFull(a.balance)}
            </div>
            <span className={`pill-status ${a.status === "A" ? "active" : "suspended"}`}>
              {a.status === "A" ? "Active" : "Suspended"}
            </span>
          </div>
        ))}
        <div className="account-pill" style={{ borderStyle: "dashed", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
             onClick={() => onNav("new-account")}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>+</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>New Account</div>
          </div>
        </div>
      </div>

      <p className="section-title">Quick Actions</p>
      <div className="quick-actions">
        {[
          { icon: "↓", label: "Deposit",  nav: "deposit" },
          { icon: "↑", label: "Withdraw", nav: "withdraw" },
          { icon: "⇄", label: "Transfer", nav: "transfer" },
          { icon: "📄", label: "History", nav: "history" },
        ].map(q => (
          <div key={q.nav} className="qa-btn" onClick={() => onNav(q.nav)}>
            <div className="qa-icon">{q.icon}</div>
            <div className="qa-label">{q.label}</div>
          </div>
        ))}
      </div>

      <p className="section-title">Recent Transactions</p>
      <div className="txn-list">
        {recentTxns.map(t => (
          <div key={t.id} className="txn-item">
            <div className={`txn-icon ${txnClass(t.type)}`}>{txnIcon(t.type)}</div>
            <div className="txn-details">
              <div className="txn-desc">{t.desc}</div>
              <div className="txn-meta">{t.date} · <span className={`tag tag-${t.status === "APR" ? "approved" : t.status === "PND" ? "pending" : "rejected"}`}>{t.status}</span></div>
            </div>
            <div className={`txn-amount ${isCredit(t.type) ? "credit" : "debit"}`}>
              {isCredit(t.type) ? "+" : "-"}${fmt(t.amount)}
            </div>
          </div>
        ))}
      </div>
      <button className="btn-ghost" style={{ width: "100%", marginTop: 12 }} onClick={() => onNav("history")}>View All Transactions</button>
    </div>
  );
}

function DepositPage({ accounts, onBack, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [acctId, setAcctId] = useState(accounts[0]?.id || "");
  const [desc, setDesc] = useState("MOBILE DEPOSIT");
  const [step, setStep] = useState("form"); // form | confirm | success
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState("");

  const submit = async () => {
    if (step === "form") { setStep("confirm"); return; }
    setLoading(true);
    const res = await api.deposit(acctId, parseFloat(amount), desc);
    setRef(res.reference);
    setStep("success");
    setLoading(false);
    onSuccess && onSuccess();
  };

  if (step === "success") return (
    <div className="page">
      <div className="success-screen">
        <div className="success-ring">✓</div>
        <div className="success-title">Deposit Successful</div>
        <div className="success-sub">${fmt(parseFloat(amount))} deposited to {acctId}</div>
        <div className="success-ref">REF: {ref}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 24 }}>
          Funds available immediately. Reflected in nightly batch at 22:00 EST.
        </div>
        <button className="btn-primary" onClick={onBack}>Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <button className="back-btn" onClick={step === "confirm" ? () => setStep("form") : onBack}>← {step === "confirm" ? "Edit" : "Back"}</button>
      <div className="page-title">{step === "form" ? "Deposit Funds" : "Confirm Deposit"}</div>
      <div className="page-subtitle">
        {step === "form" ? "Add funds to your account in real-time." : "Review and confirm your deposit."}
      </div>

      <div className="amount-display">
        <span className="currency">$</span>
        {step === "form"
          ? <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="0" />
          : <span style={{ fontFamily: "Cormorant Garamond", fontSize: 52, fontWeight: 300 }}>{fmt(parseFloat(amount) || 0)}</span>
        }
      </div>

      {step === "form" ? (
        <>
          <div className="field">
            <label>Destination Account</label>
            <select value={acctId} onChange={e => setAcctId(e.target.value)}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.id} — {a.type} ({fmtFull(a.balance)})</option>)}
            </select>
          </div>
          <div className="field">
            <label>Description</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Deposit description" />
          </div>
        </>
      ) : (
        <div className="confirm-box">
          <div className="confirm-row"><span>Amount</span><span style={{ color: "var(--green)" }}>${fmt(parseFloat(amount))}</span></div>
          <div className="confirm-row"><span>Account</span><span>{acctId}</span></div>
          <div className="confirm-row"><span>Description</span><span>{desc}</span></div>
          <div className="confirm-row"><span>Processing</span><span>Real-time via COBOL</span></div>
          <div className="confirm-row"><span>Batch Reconcile</span><span>22:00 EST nightly</span></div>
        </div>
      )}

      <button className="btn-primary" onClick={submit} disabled={!amount || parseFloat(amount) <= 0 || loading}>
        {loading ? <span className="spinner" /> : step === "form" ? "Continue" : "Confirm Deposit"}
      </button>
    </div>
  );
}

function WithdrawPage({ accounts, onBack, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [acctId, setAcctId] = useState(accounts[0]?.id || "");
  const [desc, setDesc] = useState("ATM WITHDRAWAL");
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState("");

  const acct = accounts.find(a => a.id === acctId);
  const isOverdraft = acct && parseFloat(amount) > acct.balance + (acct.overdraftLimit || 0);

  const submit = async () => {
    if (step === "form") { setStep("confirm"); return; }
    setLoading(true);
    const res = await api.withdraw(acctId, parseFloat(amount), desc);
    setRef(res.reference);
    setStep("success");
    setLoading(false);
    onSuccess && onSuccess();
  };

  if (step === "success") return (
    <div className="page">
      <div className="success-screen">
        <div className="success-ring">✓</div>
        <div className="success-title">Withdrawal Complete</div>
        <div className="success-sub">${fmt(parseFloat(amount))} withdrawn from {acctId}</div>
        <div className="success-ref">REF: {ref}</div>
        <button className="btn-primary" onClick={onBack}>Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <button className="back-btn" onClick={step === "confirm" ? () => setStep("form") : onBack}>← {step === "confirm" ? "Edit" : "Back"}</button>
      <div className="page-title">{step === "form" ? "Withdraw Funds" : "Confirm Withdrawal"}</div>
      <div className="page-subtitle">
        {step === "form" ? "Withdraw from your account instantly." : "Review and confirm your withdrawal."}
      </div>

      <div className="amount-display">
        <span className="currency">$</span>
        {step === "form"
          ? <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          : <span style={{ fontFamily: "Cormorant Garamond", fontSize: 52, fontWeight: 300 }}>{fmt(parseFloat(amount) || 0)}</span>
        }
      </div>

      {isOverdraft && step === "form" && (
        <div className="alert-card danger" style={{ marginBottom: 16 }}>
          <div className="alert-icon">⚠️</div>
          <div>
            <div className="alert-title">Overdraft Warning</div>
            <div className="alert-body">This exceeds your available balance + overdraft limit of ${fmt(acct.balance + acct.overdraftLimit)}.</div>
          </div>
        </div>
      )}

      {step === "form" ? (
        <>
          <div className="field">
            <label>Source Account</label>
            <select value={acctId} onChange={e => setAcctId(e.target.value)}>
              {accounts.filter(a => a.status === "A").map(a => (
                <option key={a.id} value={a.id}>{a.id} — {a.type} ({fmtFull(a.balance)})</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Description</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
        </>
      ) : (
        <div className="confirm-box">
          <div className="confirm-row"><span>Amount</span><span style={{ color: "var(--red)" }}>-${fmt(parseFloat(amount))}</span></div>
          <div className="confirm-row"><span>Account</span><span>{acctId}</span></div>
          <div className="confirm-row"><span>Available Balance</span><span>{fmtFull(acct?.balance || 0)}</span></div>
          <div className="confirm-row"><span>Description</span><span>{desc}</span></div>
        </div>
      )}

      <button className="btn-primary" onClick={submit} disabled={!amount || parseFloat(amount) <= 0 || loading || isOverdraft}>
        {loading ? <span className="spinner" /> : step === "form" ? "Continue" : "Confirm Withdrawal"}
      </button>
    </div>
  );
}

function TransferPage({ accounts, onBack, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [fromId, setFromId] = useState(accounts[0]?.id || "");
  const [toId, setToId] = useState(accounts[1]?.id || accounts[0]?.id || "");
  const [desc, setDesc] = useState("INTERNAL TRANSFER");
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState("");

  const submit = async () => {
    if (step === "form") { setStep("confirm"); return; }
    setLoading(true);
    const res = await api.transfer(fromId, toId, parseFloat(amount), desc);
    setRef(res.reference);
    setStep("success");
    setLoading(false);
    onSuccess && onSuccess();
  };

  if (step === "success") return (
    <div className="page">
      <div className="success-screen">
        <div className="success-ring">✓</div>
        <div className="success-title">Transfer Complete</div>
        <div className="success-sub">${fmt(parseFloat(amount))} moved from {fromId} to {toId}</div>
        <div className="success-ref">REF: {ref}</div>
        <button className="btn-primary" onClick={onBack}>Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <button className="back-btn" onClick={step === "confirm" ? () => setStep("form") : onBack}>← {step === "confirm" ? "Edit" : "Back"}</button>
      <div className="page-title">{step === "form" ? "Transfer Funds" : "Confirm Transfer"}</div>
      <div className="page-subtitle">Move money between your Zentra accounts.</div>

      <div className="amount-display">
        <span className="currency">$</span>
        {step === "form"
          ? <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          : <span style={{ fontFamily: "Cormorant Garamond", fontSize: 52, fontWeight: 300 }}>{fmt(parseFloat(amount) || 0)}</span>
        }
      </div>

      {step === "form" ? (
        <>
          <div className="field">
            <label>From Account</label>
            <select value={fromId} onChange={e => setFromId(e.target.value)}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.id} — {a.type} ({fmtFull(a.balance)})</option>)}
            </select>
          </div>
          <div className="field">
            <label>To Account</label>
            <select value={toId} onChange={e => setToId(e.target.value)}>
              {accounts.filter(a => a.id !== fromId).map(a => <option key={a.id} value={a.id}>{a.id} — {a.type} ({fmtFull(a.balance)})</option>)}
            </select>
          </div>
          <div className="field">
            <label>Description</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
        </>
      ) : (
        <div className="confirm-box">
          <div className="confirm-row"><span>Amount</span><span>${fmt(parseFloat(amount))}</span></div>
          <div className="confirm-row"><span>From</span><span>{fromId}</span></div>
          <div className="confirm-row"><span>To</span><span>{toId}</span></div>
          <div className="confirm-row"><span>Description</span><span>{desc}</span></div>
          <div className="confirm-row"><span>Processing</span><span>Real-time + EOD Batch</span></div>
        </div>
      )}

      <button className="btn-primary" onClick={submit} disabled={!amount || parseFloat(amount) <= 0 || fromId === toId || loading}>
        {loading ? <span className="spinner" /> : step === "form" ? "Continue" : "Confirm Transfer"}
      </button>
    </div>
  );
}

function HistoryPage({ accounts, transactions, onBack }) {
  const [filter, setFilter] = useState("ALL");
  const [acctFilter, setAcctFilter] = useState("ALL");
  const types = ["ALL", "DEP", "WTH", "XFR", "FEE"];

  const filtered = transactions.filter(t => {
    const typeOk = filter === "ALL" || t.type === filter;
    const acctOk = acctFilter === "ALL" || t.acct === acctFilter;
    return typeOk && acctOk;
  });

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← Back</button>
      <div className="page-title">Transaction History</div>
      <div className="page-subtitle">{filtered.length} transactions found</div>

      <div className="field">
        <label>Filter by Account</label>
        <select value={acctFilter} onChange={e => setAcctFilter(e.target.value)}>
          <option value="ALL">All Accounts</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.id} — {a.type}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto" }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{
              padding: "6px 14px", borderRadius: 20, border: "1px solid",
              borderColor: filter === t ? "var(--gold)" : "var(--border)",
              background: filter === t ? "rgba(201,168,76,0.1)" : "transparent",
              color: filter === t ? "var(--gold)" : "var(--muted)",
              fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
              fontFamily: "DM Sans, sans-serif"
            }}
          >{t === "ALL" ? "All" : t === "DEP" ? "Deposits" : t === "WTH" ? "Withdrawals" : t === "XFR" ? "Transfers" : "Fees"}</button>
        ))}
      </div>

      <div className="txn-list">
        {filtered.length === 0
          ? <div style={{ textAlign: "center", color: "var(--muted)", padding: 40, fontSize: 14 }}>No transactions found</div>
          : filtered.map(t => (
            <div key={t.id} className="txn-item">
              <div className={`txn-icon ${txnClass(t.type)}`}>{txnIcon(t.type)}</div>
              <div className="txn-details">
                <div className="txn-desc">{t.desc}</div>
                <div className="txn-meta">
                  {t.date} · {t.acct} · <span className={`tag tag-${t.status === "APR" ? "approved" : t.status === "PND" ? "pending" : "rejected"}`}>{t.status}</span>
                </div>
              </div>
              <div className={`txn-amount ${isCredit(t.type) ? "credit" : "debit"}`}>
                {isCredit(t.type) ? "+" : "-"}${fmt(t.amount)}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function NewAccountPage({ onBack, onCreated }) {
  const [type, setType] = useState("CHECKING");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);

  const create = async () => {
    setLoading(true);
    const res = await api.createAccount({ type });
    setCreated(res);
    setLoading(false);
    onCreated && onCreated(res);
  };

  if (created) return (
    <div className="page">
      <div className="success-screen">
        <div className="success-ring">✓</div>
        <div className="success-title">Account Opened</div>
        <div className="success-sub">Your new {created.type} account is ready</div>
        <div className="success-ref">{created.id}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 24 }}>
          COBOL engine initialized. Make your first deposit to activate batch processing.
        </div>
        <button className="btn-primary" onClick={onBack}>Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← Back</button>
      <div className="page-title">Open New Account</div>
      <div className="page-subtitle">Choose your account type. Zentra accounts are COBOL-powered for maximum reliability.</div>

      {[
        { type: "CHECKING", icon: "💳", desc: "Daily transactions, debit access, overdraft protection up to $500" },
        { type: "SAVINGS",  icon: "🏦", desc: "High-yield savings with nightly interest crediting via batch cycle" },
        { type: "MONEY_MARKET", icon: "📈", desc: "Premium rates for balances over $10,000" },
      ].map(a => (
        <div key={a.type}
          onClick={() => setType(a.type)}
          style={{
            background: type === a.type ? "rgba(201,168,76,0.06)" : "var(--navy3)",
            border: `1px solid ${type === a.type ? "var(--gold)" : "var(--border)"}`,
            borderRadius: 14, padding: "18px 16px", marginBottom: 10,
            cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start", transition: "all .2s"
          }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>{a.icon}</div>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 15 }}>{a.type.replace("_", " ")}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{a.desc}</div>
          </div>
          {type === a.type && <div style={{ marginLeft: "auto", color: "var(--gold)", fontSize: 18 }}>✓</div>}
        </div>
      ))}

      <div className="divider" />

      <div style={{ background: "var(--navy3)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>Account Terms</div>
        {[["Monthly Fee", type === "CHECKING" ? "$12.00 (waived with $1,500 min)" : type === "SAVINGS" ? "$5.00" : "$15.00"],
          ["Overdraft Limit", type === "CHECKING" ? "$500.00" : "None"],
          ["Interest Rate", type === "CHECKING" ? "0.05% APY" : type === "SAVINGS" ? "2.15% APY" : "3.80% APY"],
          ["Processing", "Real-time + nightly COBOL batch"]
        ].map(([k, v]) => (
          <div key={k} className="confirm-row"><span>{k}</span><span>{v}</span></div>
        ))}
      </div>

      <button className="btn-primary" onClick={create} disabled={loading}>
        {loading ? <span className="spinner" /> : `Open ${type.replace("_", " ")} Account`}
      </button>
    </div>
  );
}

function ProfilePage({ user, accounts, onLogout }) {
  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="page">
      <div style={{ textAlign: "center", paddingTop: 20 }}>
        <div className="profile-avatar" style={{ margin: "0 auto 16px" }}>{initials}</div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-email">{user.email}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Accounts", value: accounts.length },
          { label: "Total Balance", value: fmtFull(accounts.reduce((s, a) => s + a.balance, 0)) },
          { label: "Batch Status", value: "22:00 EST" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--navy3)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, textAlign: "center" }}>
            <div style={{ fontFamily: "Cormorant Garamond", fontSize: 22, fontWeight: 400, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 10, letterSpacing: 1, color: "var(--muted)", textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="settings-group">
        <div className="section-title">Account</div>
        {[
          { icon: "👤", label: "Personal Information" },
          { icon: "🔐", label: "Security & Password" },
          { icon: "🔔", label: "Notification Preferences" },
          { icon: "📄", label: "Download Statements" },
        ].map(s => (
          <div key={s.label} className="settings-item">
            <div className="settings-icon">{s.icon}</div>
            <div className="settings-label">{s.label}</div>
            <div className="settings-arrow">›</div>
          </div>
        ))}
      </div>

      <div className="settings-group">
        <div className="section-title">Platform</div>
        {[
          { icon: "⚙️",  label: "COBOL Batch Schedule", value: "22:00 EST" },
          { icon: "🔗",  label: "API Documentation" },
          { icon: "📊",  label: "Operations Dashboard" },
        ].map(s => (
          <div key={s.label} className="settings-item">
            <div className="settings-icon">{s.icon}</div>
            <div className="settings-label">{s.label}</div>
            {s.value && <div className="settings-value">{s.value}</div>}
            <div className="settings-arrow">›</div>
          </div>
        ))}
      </div>

      <button className="btn-danger" onClick={onLogout}>Sign Out</button>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function ZentraPortal() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("dashboard");
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
  const [transactions, setTransactions] = useState(MOCK_TXNS);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  const navTo = useCallback((s) => setScreen(s), []);

  if (!user) return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <AuthScreen onLogin={(u) => { setUser(u); setScreen("dashboard"); }} />
      </div>
    </>
  );

  const navItems = [
    { icon: "⌂",  label: "Home",     screen: "dashboard" },
    { icon: "⇄",  label: "Transfer", screen: "transfer" },
    { icon: "↓",  label: "Deposit",  screen: "deposit" },
    { icon: "📋", label: "History",  screen: "history" },
    { icon: "☰",  label: "Profile",  screen: "profile" },
  ];

  const mainScreens = ["dashboard", "transfer", "deposit", "history", "profile"];

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":  return <Dashboard user={user} accounts={accounts} transactions={transactions} onNav={navTo} onSelectAccount={setSelectedAccount} selectedAccount={selectedAccount} />;
      case "deposit":    return <DepositPage accounts={accounts} onBack={() => navTo("dashboard")} onSuccess={() => {}} />;
      case "withdraw":   return <WithdrawPage accounts={accounts} onBack={() => navTo("dashboard")} onSuccess={() => {}} />;
      case "transfer":   return <TransferPage accounts={accounts} onBack={() => navTo("dashboard")} onSuccess={() => {}} />;
      case "history":    return <HistoryPage accounts={accounts} transactions={transactions} onBack={() => navTo("dashboard")} />;
      case "new-account": return <NewAccountPage onBack={() => navTo("dashboard")} onCreated={(a) => setAccounts(prev => [...prev, a])} />;
      case "profile":    return <ProfilePage user={user} accounts={accounts} onLogout={() => { setUser(null); setScreen("dashboard"); }} />;
      default:           return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="topbar">
          <div className="topbar-logo">ZENTR<span>A</span></div>
          <div className="topbar-actions">
            <div className="icon-btn" onClick={() => navTo("dashboard")}>
              <div className="notif-dot" />
              🔔
            </div>
            <div className="icon-btn" onClick={() => navTo("profile")}>👤</div>
          </div>
        </div>

        {renderScreen()}

        {mainScreens.includes(screen) && (
          <nav className="bottom-nav">
            {navItems.map(n => (
              <button key={n.screen} className={`nav-item ${screen === n.screen ? "active" : ""}`} onClick={() => navTo(n.screen)}>
                <div className="nav-icon">{n.icon}</div>
                <div className="nav-label">{n.label}</div>
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
