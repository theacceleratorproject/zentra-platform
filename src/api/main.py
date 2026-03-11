"""
main.py
─────────────────────────────────────────────────
Zentra Bank — FastAPI Application

The API bridge layer between the COBOL banking
logic engine and the outside world.

Start server:
  uvicorn src.api.main:app --reload --port 8000

Swagger docs: http://localhost:8000/docs
ReDoc:        http://localhost:8000/redoc
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routers import accounts, loans, transactions, reports, batch, auth
from .routers.auth import startup as auth_startup
from .models.schemas import HealthResponse

# ── App Setup ───────────────────────────────────────────
app = FastAPI(
    title="Zentra Banking API",
    description="""
## Zentra Bank — COBOL-Core Banking Platform API

This API bridges a **GnuCOBOL financial processing engine** with
modern REST endpoints. Every banking operation — validation,
processing, interest calculation, and reporting — runs through
battle-tested COBOL business logic.

### Architecture
```
Client → FastAPI → subprocess → COBOL Binary → flat files → FastAPI → JSON
```

### Available Modules
| Module | Endpoint Group | COBOL Program |
|--------|---------------|---------------|
| Accounts | `/accounts` | ACCOUNT-LOADER.cbl |
| Loans | `/loans` | Python (COBOL-equivalent math) |
| Transactions | `/transactions` | TXN-VALIDATOR + TXN-PROCESSOR |
| Reports | `/reports` | FEE-ENGINE, INTEREST-CALC, EOD-REPORT |
| Batch | `/batch` | Full pipeline orchestration |

### Quick Start
1. `GET /health` — verify the API is running
2. `GET /accounts` — load all accounts
3. `POST /loans/calculate` — calculate a loan payment
4. `POST /batch/run` — run the full daily batch cycle
    """,
    version="2.0.0",
    contact={
        "name": "Zentra Bank — Built by Marck",
        "url": "https://github.com/theacceleratorproject/zentra-platform"
    },
    license_info={
        "name": "Proprietary — Zentra Banking Platform"
    }
)

# ── CORS ────────────────────────────────────────────────
_allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────
app.include_router(accounts.router)
app.include_router(loans.router)
app.include_router(transactions.router)
app.include_router(reports.router)
app.include_router(batch.router)
app.include_router(auth.router)


# ── DB Init ────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    auth_startup()


# ── Root ────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root():
    return {
        "service": "Zentra Banking API",
        "version": "2.0.0",
        "status":  "online",
        "docs":    "/docs",
        "redoc":   "/redoc"
    }


# ── Health Check ────────────────────────────────────────
@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="API health check"
)
async def health():
    import subprocess
    try:
        result = subprocess.run(
            ["cobc", "--version"],
            capture_output=True, text=True, timeout=5
        )
        cobol_status = "available" if result.returncode == 0 else "unavailable"
        if result.returncode == 0:
            cobol_version = result.stdout.splitlines()[0]
            cobol_status = f"available ({cobol_version})"
    except Exception as e:
        cobol_status = f"error: {str(e)}"

    return HealthResponse(
        status="healthy",
        service="Zentra Banking API",
        version="2.0.0",
        cobol_core=cobol_status
    )


# ── Global Exception Handler ────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "path": str(request.url)
        }
    )
