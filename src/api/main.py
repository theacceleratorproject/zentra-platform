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
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz

from .routers import accounts, loans, transactions, reports, batch, auth
from .routers.auth import startup as auth_startup, current_user
from .services import cobol
from .models.schemas import HealthResponse

# ── Nightly Batch Scheduler ────────────────────────────────
EST = pytz.timezone("America/New_York")
scheduler = AsyncIOScheduler(timezone=EST)
LAST_BATCH_FILE = Path(os.getenv("ZENTRA_BATCH_LOG", "data/output/last_batch.txt"))


async def run_nightly_batch():
    print(f"[BATCH] Starting nightly batch at {datetime.now()}")
    try:
        result = cobol.run_full_batch()
        LAST_BATCH_FILE.parent.mkdir(parents=True, exist_ok=True)
        LAST_BATCH_FILE.write_text(datetime.now().isoformat())
        passed = result.get("steps_passed", 0)
        total = result.get("steps_run", 0)
        print(f"[BATCH] Completed: {passed}/{total} steps passed")
    except Exception as e:
        print(f"[BATCH] Failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    auth_startup()
    scheduler.add_job(
        run_nightly_batch,
        CronTrigger(hour=22, minute=0, timezone=EST),
        id="nightly_batch",
        replace_existing=True,
    )
    scheduler.start()
    print("[SCHEDULER] Nightly batch scheduled for 22:00 EST")
    yield
    # shutdown
    scheduler.shutdown(wait=False)


# ── App Setup ───────────────────────────────────────────
app = FastAPI(
    lifespan=lifespan,
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


# ── Manual Batch Trigger ──────────────────────────────────
@app.post("/batch/run-now", tags=["Batch Pipeline"], summary="Manually trigger nightly batch")
async def run_batch_now(user: dict = Depends(current_user)):
    await run_nightly_batch()
    return {"success": True, "message": "Batch triggered manually"}


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
