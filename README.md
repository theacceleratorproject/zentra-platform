# 🏦 Zentra Banking Platform

> **Where Legacy Meets the Future**  
> A COBOL-core banking platform bridged with modern APIs and analytics.

---

## 🏗️ Architecture

```
[ React Dashboard ]
        ↕
[ FastAPI REST Layer ]
        ↕
[ COBOL Business Logic Engine ]
        ↕
[ PostgreSQL + File Ledger ]
```

---

## 🚀 Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/theacceleratorproject/zentra-platform.git
cd zentra-platform
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Dashboard | http://localhost |
| API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

### GitHub Codespaces

1. Open this repo in GitHub Codespaces
2. Wait for the environment to auto-configure (~2 mins)
3. Run your first COBOL program:

```bash
bash scripts/run.sh src/cobol/core/HELLO.cbl
```

---

## 📁 Project Structure

```
zentra/
├── .devcontainer/          # Codespaces config (GnuCOBOL + Python + Node)
│   ├── devcontainer.json
│   └── setup.sh
│
├── src/
│   ├── cobol/
│   │   ├── core/           # Core financial programs
│   │   │   ├── HELLO.cbl               ← Phase 1: Hello World
│   │   │   ├── SIMPLE-INTEREST.cbl     ← Phase 1: Interest calc
│   │   │   ├── COMPOUND-INTEREST.cbl   ← Phase 1: Savings growth
│   │   │   ├── ACCOUNT-STATUS.cbl      ← Phase 1: Account check
│   │   │   ├── LEDGER-WRITER.cbl       ← Phase 1: File I/O
│   │   │   ├── ACCOUNT-LOADER.cbl      ← Phase 2: Read master file
│   │   │   ├── TXN-VALIDATOR.cbl       ← Phase 2: Validate transactions
│   │   │   ├── TXN-PROCESSOR.cbl       ← Phase 2: Apply transactions
│   │   │   ├── FEE-ENGINE.cbl          ← Phase 2: Generate fees
│   │   │   ├── INTEREST-CALC.cbl       ← Phase 2: Interest calculation
│   │   │   └── BATCH-RUNNER.cbl        ← Phase 2: Orchestrator
│   │   ├── utils/          # Copybooks (reusable COBOL modules)
│   │   │   ├── ACCOUNT-RECORD.cpy
│   │   │   ├── TRANSACTION-RECORD.cpy
│   │   │   └── REPORT-FIELDS.cpy
│   │   ├── reports/        # EOD and statement generators
│   │   │   └── EOD-REPORT.cbl
│   │   └── tests/          # COBOL test programs
│   │       ├── TEST-COPYBOOKS.cbl
│   │       ├── TEST-VALIDATION.cbl
│   │       └── TEST-PROCESSING.cbl
│   │
│   ├── api/                # FastAPI bridge layer (Phase 3)
│   │   ├── main.py                    ← App + health + CORS
│   │   ├── models/schemas.py          ← Pydantic request/response models
│   │   ├── services/cobol.py          ← COBOL subprocess bridge
│   │   ├── requirements.txt
│   │   ├── tests/test_api.py          ← pytest test suite
│   │   └── routers/
│   │       ├── accounts.py            ← /accounts endpoints
│   │       ├── loans.py               ← /loans calculator
│   │       ├── transactions.py        ← /transactions + CSV upload
│   │       ├── reports.py             ← /reports + fees + interest
│   │       └── batch.py               ← /batch pipeline
│   └── frontend/           # React dashboard (Phase 4 — Lovable)
│       ├── package.json              ← Dependencies (React 18, TypeScript, Tailwind)
│       ├── vite.config.ts            ← Dev server (port 3000, API proxy)
│       ├── tailwind.config.ts        ← Tailwind theme config
│       ├── index.html                ← Entry HTML
│       └── src/
│           ├── main.tsx              ← React entry point
│           ├── App.tsx               ← Router + layout
│           ├── services/api.ts       ← API client (all endpoints)
│           ├── components/
│           │   ├── ui/               ← shadcn/ui components
│           │   ├── AppSidebar.tsx     ← Navigation sidebar
│           │   └── AppLayout.tsx      ← Page layout wrapper
│           └── pages/
│               ├── Dashboard.tsx      ← Charts + stats overview
│               ├── Accounts.tsx       ← Account list + balances
│               ├── Loans.tsx          ← Calculator + amortization
│               ├── Transactions.tsx   ← Validation pipeline
│               ├── Reports.tsx        ← Fee/interest/EOD reports
│               └── BatchPipeline.tsx  ← Batch pipeline runner
│
├── data/
│   ├── input/              # Transaction input files
│   └── output/             # Compiled binaries + ledger files
│
├── docker/
│   ├── api/Dockerfile             ← Multi-stage API container
│   └── frontend/
│       ├── Dockerfile             ← Multi-stage frontend container
│       └── nginx.conf             ← Reverse proxy + SPA config
├── .github/workflows/
│   ├── ci.yml                     ← Lint + test on push/PR
│   ├── docker-build.yml           ← Build Docker images
│   └── deploy.yml                 ← Deploy to AWS EC2
├── docker-compose.yml             ← Service orchestration
├── .env.example                   ← Environment template
│
├── docs/                   # Architecture docs, white paper
│   ├── zentra-white-paper.md      ← Consulting white paper
│   ├── architecture.md            ← Technical architecture
│   └── deployment-guide.md        ← AWS deployment guide
├── scripts/
│   ├── run.sh              # Compile + run any COBOL file
│   ├── run-batch.sh        # Run full daily batch cycle
│   └── run-tests.sh        # Run all test programs
└── README.md
```

---

## 📋 Development Phases

| Phase | Focus | Timeline | Status |
|-------|-------|----------|--------|
| 1 | COBOL Foundations + Repo Setup | Wks 1–3 | ✅ Complete |
| 2 | Banking Logic Engine | Wks 4–8 | ✅ Complete |
| 3 | FastAPI Bridge Layer | Wks 9–12 | ✅ Complete |
| 4 | React Dashboard | Wks 13–17 | ✅ Complete |
| 5 | Deploy + Consulting Package | Wks 18–24 | ✅ Complete |

---

## 🧠 Phase 1 Programs

| Program | Concepts Covered | Run Command |
|---------|-----------------|-------------|
| `HELLO.cbl` | Program structure, DISPLAY | `bash scripts/run.sh src/cobol/core/HELLO.cbl` |
| `SIMPLE-INTEREST.cbl` | PIC clauses, COMPUTE, formatted output | `bash scripts/run.sh src/cobol/core/SIMPLE-INTEREST.cbl` |
| `COMPOUND-INTEREST.cbl` | PERFORM loops, iterative math | `bash scripts/run.sh src/cobol/core/COMPOUND-INTEREST.cbl` |
| `ACCOUNT-STATUS.cbl` | 88-levels, EVALUATE/WHEN | `bash scripts/run.sh src/cobol/core/ACCOUNT-STATUS.cbl` |
| `LEDGER-WRITER.cbl` | FILE SECTION, OPEN/WRITE/CLOSE | `bash scripts/run.sh src/cobol/core/LEDGER-WRITER.cbl` |

---

## 🏗️ Phase 2 Programs - Banking Logic Engine

| Program | Function | New Concepts | Run Command |
|---------|----------|-------------|-------------|
| `ACCOUNT-LOADER.cbl` | Read & display master accounts | COPY, READ/AT END, FILE STATUS | `bash scripts/run.sh src/cobol/core/ACCOUNT-LOADER.cbl` |
| `TXN-VALIDATOR.cbl` | Validate transactions (6 rules) | OCCURS/table lookup, multi-file I/O | `bash scripts/run.sh src/cobol/core/TXN-VALIDATOR.cbl` |
| `TXN-PROCESSOR.cbl` | Apply transactions, update balances | Sequential update pattern, audit ledger | `bash scripts/run.sh src/cobol/core/TXN-PROCESSOR.cbl` |
| `FEE-ENGINE.cbl` | Generate fee transactions | ACCEPT DATE, reference modification | `bash scripts/run.sh src/cobol/core/FEE-ENGINE.cbl` |
| `INTEREST-CALC.cbl` | Calculate daily interest | ROUNDED, FUNCTION intrinsics | `bash scripts/run.sh src/cobol/core/INTEREST-CALC.cbl` |
| `EOD-REPORT.cbl` | End-of-day summary report | Report formatting, WRITE ADVANCING | `bash scripts/run.sh src/cobol/reports/EOD-REPORT.cbl` |
| `BATCH-RUNNER.cbl` | Orchestrate full batch cycle | CALL "SYSTEM", RETURN-CODE | `bash scripts/run.sh src/cobol/core/BATCH-RUNNER.cbl` |

### Copybooks (Shared Modules)

| File | Purpose |
|------|---------|
| `ACCOUNT-RECORD.cpy` | Master account record layout (ID, name, type, balance, status) |
| `TRANSACTION-RECORD.cpy` | Transaction record layout (date, type, amount, status, error code) |
| `REPORT-FIELDS.cpy` | Shared display formats for currency and counts |

### Batch Processing

```bash
# Run full daily batch cycle (fee gen → validate → process → interest → EOD report)
bash scripts/run-batch.sh

# Run test suite
bash scripts/run-tests.sh
```

### Validation Rules

| Code | Rule |
|------|------|
| E01 | Account not found |
| E02 | Account inactive (frozen/closed) |
| E03 | Invalid amount (zero) |
| E04 | Insufficient funds |
| E05 | Exceeds single-transaction limit ($100K) |
| E06 | Invalid transfer target |

---

## 🌐 Phase 3 — FastAPI REST Bridge (15 endpoints)

### Start the API

```bash
pip install -r src/api/requirements.txt
uvicorn src.api.main:app --reload --port 8000
```

### Endpoints

| Method | Endpoint | COBOL Program / Description |
|--------|----------|---------------------------|
| GET | `/health` | API + GnuCOBOL availability check |
| GET | `/accounts` | ACCOUNT-LOADER.cbl |
| GET | `/accounts/health` | File check |
| POST | `/loans/calculate` | Monthly payment, total interest (Python) |
| POST | `/loans/amortize` | Full amortization schedule (Python) |
| POST | `/transactions/validate` | TXN-VALIDATOR.cbl (6 business rules) |
| POST | `/transactions/process` | TXN-PROCESSOR.cbl |
| POST | `/transactions/upload` | CSV upload → validate |
| GET | `/transactions/ledger` | Audit trail |
| GET | `/transactions/rejected` | Failed records with error codes |
| POST | `/reports/fees` | FEE-ENGINE.cbl |
| POST | `/reports/interest` | INTEREST-CALC.cbl |
| GET | `/reports/eod` | EOD-REPORT.cbl (JSON) |
| GET | `/reports/eod/text` | EOD-REPORT.cbl (plain text) |
| GET | `/reports/files` | List output files |
| POST | `/batch/run` | Full pipeline: Fee→Validate→Process→Interest→EOD |
| GET | `/batch/status` | Last batch result |

### Interactive Docs

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Run API Tests

```bash
pytest src/api/tests/ -v
```

### Postman

Import `zentra-api.postman_collection.json` and set `base_url = http://localhost:8000`

---

## 🖥️ Phase 4 — Zentra Operations Hub (React Dashboard)

### Start the Frontend

```bash
cd src/frontend
npm install
npm run dev
```

Dashboard runs on **port 3000** with API proxy to `localhost:8000`.

### Pages

| Page | Route | Features |
|------|-------|----------|
| Index | `/` | Landing / overview |
| Dashboard | `/dashboard` | System stats, charts, account snapshot |
| Accounts | `/accounts` | Account table, balances, status |
| Loans | `/loans` | Loan calculator + amortization |
| Transactions | `/transactions` | Validation pipeline, ledger, rejected records |
| Reports | `/reports` | Fee Engine, Interest Calculator, EOD Report |
| Batch Pipeline | `/batch-pipeline` | Visual pipeline runner with step tracking |

### Tech Stack

- React 18 + TypeScript
- Vite 5 (dev server + build)
- Tailwind CSS + shadcn/ui (component library)
- Recharts 2 (data visualization)
- React Query (data fetching)
- React Router 6 (routing)
- Lucide React (icons)
- Zod (validation)

---

## 🐳 Phase 5 — Deploy + Consulting Package

### Docker

```bash
cp .env.example .env
docker compose up --build        # Dashboard: localhost  |  API: localhost:8000
```

- **API container:** Python 3.11 + GnuCOBOL (COBOL programs pre-compiled at build time)
- **Frontend container:** nginx serving Vite production build with API reverse proxy

### CI/CD (GitHub Actions)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push / PR | COBOL tests + API tests + frontend lint & build |
| `docker-build.yml` | Push to main | Build Docker images + API smoke test |
| `deploy.yml` | Push to main | SSH deploy to AWS EC2 |

### AWS Deployment

See [Deployment Guide](docs/deployment-guide.md) for step-by-step EC2 setup.

### Documentation

| Document | Description |
|----------|-------------|
| [White Paper](docs/zentra-white-paper.md) | Consulting deliverable — COBOL modernization, architecture, ROI analysis |
| [Architecture](docs/architecture.md) | Technical deep dive — data flow, components, infrastructure |
| [Deployment Guide](docs/deployment-guide.md) | Docker quickstart + AWS EC2 step-by-step |

---

## 🤖 Claude Code Workflow

```
1. Write feature spec in plain English
2. Ask Claude Code to generate COBOL module
3. Run: bash scripts/run.sh <program>
4. Paste errors back to Claude Code for fixes
5. Commit working code to GitHub
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Business Logic | GnuCOBOL |
| API Bridge | Python FastAPI |
| Frontend | React + Recharts |
| Database | PostgreSQL |
| Deployment | Docker + AWS |
| AI Assistant | Claude Code |

---

## 📞 Consulting Services

Built by a Data Scientist + Finance professional who bridges legacy COBOL systems with modern analytics infrastructure.

**Contact:** [Your info here]
# auto-deploy enabled Fri Mar 13 15:54:56 UTC 2026
