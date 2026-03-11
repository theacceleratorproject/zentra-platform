# Zentra Banking Platform — Technical Architecture

## System Overview

```
                    ┌──────────────────────────────┐
                    │     Zentra Operations Hub     │
                    │  React 18 + TypeScript + Vite │
                    │  Port 3000 (dev) / 80 (prod)  │
                    └──────────────┬───────────────┘
                                   │ /api/*
                    ┌──────────────┴───────────────┐
                    │  nginx reverse proxy (prod)   │
                    │  Vite dev proxy (dev)          │
                    └──────────────┬───────────────┘
                                   │ HTTP → localhost:8000
                    ┌──────────────┴───────────────┐
                    │    FastAPI Bridge Layer        │
                    │  Python 3.11 + Pydantic        │
                    │  15 REST endpoints              │
                    │  Port 8000                      │
                    └──────────┬──────┬────────────┘
                               │      │
                 subprocess    │      │  file I/O
                 (cobc + run)  │      │
                    ┌──────────┴──┐ ┌─┴────────────┐
                    │ GnuCOBOL    │ │ Flat Files    │
                    │ 11 programs  │ │ data/input/   │
                    │ 3 copybooks  │ │ data/output/  │
                    └─────────────┘ └──────────────┘
```

## Data Flow

### Request Lifecycle
```
1. Client sends HTTP request (e.g., POST /transactions/validate)
2. nginx (prod) or Vite (dev) proxies /api/* → FastAPI on port 8000
3. FastAPI router calls cobol.py bridge service
4. Bridge checks if COBOL binary is stale (source mtime vs binary mtime)
5. If stale: cobc -x -I src/cobol/utils -o data/output/PROGRAM src/cobol/core/PROGRAM.cbl
6. Execute: subprocess.run(data/output/PROGRAM, capture_output=True)
7. Parse stdout and/or output .dat files
8. Return structured JSON response to client
```

### Batch Pipeline Flow
```
FEE-ENGINE.cbl
  ├── Reads:  data/input/ACCOUNTS-MASTER.dat
  ├── Writes: data/output/FEE-TRANSACTIONS.dat
  └── Output: fee counts + total assessed
        ↓
TXN-VALIDATOR.cbl
  ├── Reads:  data/input/DAILY-TRANSACTIONS.dat
  │           data/input/ACCOUNTS-MASTER.dat
  ├── Writes: data/output/APPROVED-TRANSACTIONS.dat
  │           data/output/REJECTED-TRANSACTIONS.dat
  └── Output: read/approved/rejected counts
        ↓
TXN-PROCESSOR.cbl
  ├── Reads:  data/output/APPROVED-TRANSACTIONS.dat
  │           data/input/ACCOUNTS-MASTER.dat
  ├── Writes: data/output/ACCOUNTS-UPDATED.dat
  │           data/output/TXN-LEDGER.dat
  └── Output: applied count, deposit/withdrawal totals
        ↓
INTEREST-CALC.cbl
  ├── Reads:  data/output/ACCOUNTS-UPDATED.dat
  │           data/input/INTEREST-RATES.dat
  ├── Writes: data/output/INTEREST-TRANSACTIONS.dat
  └── Output: accounts credited, total interest
        ↓
EOD-REPORT.cbl
  ├── Reads:  data/output/TXN-LEDGER.dat
  │           data/output/ACCOUNTS-UPDATED.dat
  ├── Writes: data/output/EOD-REPORT.dat
  └── Output: formatted management report
```

---

## Component Details

### COBOL Layer

| Program | File | Function |
|---------|------|----------|
| HELLO | `src/cobol/core/HELLO.cbl` | Hello World — program structure |
| SIMPLE-INTEREST | `src/cobol/core/SIMPLE-INTEREST.cbl` | PIC clauses, COMPUTE |
| COMPOUND-INTEREST | `src/cobol/core/COMPOUND-INTEREST.cbl` | PERFORM loops, iterative math |
| ACCOUNT-STATUS | `src/cobol/core/ACCOUNT-STATUS.cbl` | 88-levels, EVALUATE/WHEN |
| LEDGER-WRITER | `src/cobol/core/LEDGER-WRITER.cbl` | FILE SECTION, OPEN/WRITE/CLOSE |
| ACCOUNT-LOADER | `src/cobol/core/ACCOUNT-LOADER.cbl` | Read master accounts file |
| TXN-VALIDATOR | `src/cobol/core/TXN-VALIDATOR.cbl` | 6 business rules (E01–E06) |
| TXN-PROCESSOR | `src/cobol/core/TXN-PROCESSOR.cbl` | Apply transactions, update balances |
| FEE-ENGINE | `src/cobol/core/FEE-ENGINE.cbl` | Maintenance, low-balance, overdraft fees |
| INTEREST-CALC | `src/cobol/core/INTEREST-CALC.cbl` | Daily interest calculation |
| BATCH-RUNNER | `src/cobol/core/BATCH-RUNNER.cbl` | Orchestrate full daily cycle |
| EOD-REPORT | `src/cobol/reports/EOD-REPORT.cbl` | End-of-day management report |

**Compilation:**
```bash
cobc -x -I src/cobol/utils -o data/output/PROGRAM src/cobol/core/PROGRAM.cbl
```

**Copybooks:**
- `ACCOUNT-RECORD.cpy` — 94-byte account record layout
- `TRANSACTION-RECORD.cpy` — 100-byte transaction record layout
- `REPORT-FIELDS.cpy` — Shared display formats

### Data File Formats

**ACCOUNTS-MASTER.dat** (94 bytes/record):
```
Position  Length  Field              COBOL PIC
01-10     10      Account ID         X(10)
11-35     25      Account Name       X(25)
36-45     10      Account Type       X(10)
46-57     12      Balance            S9(9)V99 SIGN LEADING SEPARATE
58-66      9      Overdraft Limit    9(7)V99
67         1      Status             X(01)
68-77     10      Open Date          X(10)
78-87     10      Last Txn Date      X(10)
88-94      7      Filler             X(07)
```

**DAILY-TRANSACTIONS.dat** (100 bytes/record):
```
Position  Length  Field              COBOL PIC
01-10     10      Date               X(10)
11-20     10      Account ID         X(10)
21-23      3      Txn Type           X(03)
24-34     11      Amount             9(9)V99
35-44     10      Target Account     X(10)
45-74     30      Description        X(30)
75-77      3      Status             X(03)
78-80      3      Error Code         X(03)
81-100    20      Filler             X(20)
```

### API Layer

**Entry point:** `src/api/main.py`
- FastAPI app with CORS (configurable via `ALLOWED_ORIGINS` env var)
- Health check with GnuCOBOL version detection
- Global exception handler

**COBOL Bridge:** `src/api/services/cobol.py`
- `_compile(program)` — compile if source newer than binary
- `_run(program)` — execute compiled binary
- `_compile_and_run(program)` — compile + execute
- Per-program wrappers parse stdout into structured data

**Routers:**
| Router | File | Endpoints |
|--------|------|-----------|
| Accounts | `routers/accounts.py` | GET /accounts, GET /accounts/health |
| Loans | `routers/loans.py` | POST /loans/calculate, POST /loans/amortize |
| Transactions | `routers/transactions.py` | POST /validate, /process, /upload; GET /ledger, /rejected |
| Reports | `routers/reports.py` | POST /fees, /interest; GET /eod, /eod/text, /files |
| Batch | `routers/batch.py` | POST /batch/run; GET /batch/status |

**Models:** `src/api/models/schemas.py`
- Pydantic schemas with enums (AccountType, TxnType, AccountStatus)
- Request/response models with field validators

### Frontend Layer

**Entry:** `src/frontend/src/main.tsx` → `App.tsx`

**Routing:**
| Route | Page | Features |
|-------|------|----------|
| `/` | Index | Landing page |
| `/dashboard` | Dashboard | Stats, charts, account snapshot |
| `/accounts` | Accounts | Account table, balances |
| `/loans` | Loans | Calculator, amortization |
| `/transactions` | Transactions | Pipeline, ledger, rejected |
| `/reports` | Reports | Fees, interest, EOD |
| `/batch-pipeline` | BatchPipeline | Visual step runner |

**API Client:** `src/frontend/src/services/api.ts`
- All endpoints wrapped in typed functions
- Base URL configurable via `VITE_API_BASE` env var (defaults to `/api`)

---

## Infrastructure

### Docker Architecture

```
┌─────────────────────────────────────────────────┐
│                  Docker Compose                   │
│                                                   │
│  ┌─────────────────┐    ┌──────────────────────┐ │
│  │  zentra-frontend │    │     zentra-api        │ │
│  │  (nginx:alpine)  │───▶│ (python:3.11-slim +  │ │
│  │  Port 80         │    │  GnuCOBOL)           │ │
│  │                  │    │  Port 8000            │ │
│  └─────────────────┘    └──────────┬───────────┘ │
│                                     │             │
│                          ┌──────────┴───────────┐│
│                          │   zentra-output vol    ││
│                          │   (compiled binaries   ││
│                          │    + output .dat files) ││
│                          └──────────────────────┘│
│                                                   │
│  Bind mount: ./data/input → /app/data/input       │
└─────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
Push to main
     │
     ├── CI Workflow
     │   ├── Install GnuCOBOL + Python 3.11
     │   ├── Run COBOL test suite
     │   ├── Run API tests (pytest)
     │   ├── Install Node 20
     │   ├── Lint frontend
     │   └── Build frontend
     │
     ├── Docker Build Workflow
     │   ├── Build API image (multi-stage)
     │   ├── Smoke test API container
     │   └── Build Frontend image (multi-stage)
     │
     └── Deploy Workflow
         ├── SSH into EC2
         ├── git pull origin main
         ├── docker compose build
         ├── docker compose up -d
         └── Health check verification
```

---

## Security Considerations

- **CORS** — Configurable via `ALLOWED_ORIGINS` environment variable (defaults to `*` for development)
- **No authentication** — Portfolio scope; noted as a future enhancement for production use
- **Data isolation** — Docker volumes prevent data leakage between containers
- **No secrets in code** — `.env` files excluded via `.gitignore`
- **Health checks** — Both containers report health status for monitoring
- **Input validation** — Pydantic schemas validate all API inputs before reaching COBOL layer
