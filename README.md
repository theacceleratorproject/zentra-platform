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

## 🚀 Quick Start (GitHub Codespaces)

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
│   │   │   └── LEDGER-WRITER.cbl       ← Phase 1: File I/O
│   │   ├── utils/          # Copybooks (reusable COBOL modules)
│   │   ├── reports/        # EOD and statement generators
│   │   └── tests/          # COBOL test programs
│   │
│   ├── api/                # FastAPI bridge layer (Phase 3)
│   └── frontend/           # React dashboard (Phase 4)
│
├── data/
│   ├── input/              # Transaction input files
│   ├── output/             # Compiled binaries + ledger files
│   └── test/               # Test data sets
│
├── docs/                   # Architecture docs, white paper
├── scripts/
│   └── run.sh              # Compile + run any COBOL file
└── README.md
```

---

## 📋 Development Phases

| Phase | Focus | Timeline | Status |
|-------|-------|----------|--------|
| 1 | COBOL Foundations + Repo Setup | Wks 1–3 | 🟡 In Progress |
| 2 | Banking Logic Engine | Wks 4–8 | ⬜ Pending |
| 3 | FastAPI Bridge Layer | Wks 9–12 | ⬜ Pending |
| 4 | React Dashboard | Wks 13–17 | ⬜ Pending |
| 5 | Deploy + Consulting Package | Wks 18–24 | ⬜ Pending |

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
