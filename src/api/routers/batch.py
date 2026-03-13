"""
routers/batch.py
─────────────────────────────────────────────────
Zentra Bank — Batch Pipeline API Router

Endpoints:
  POST /batch/run     — Run full daily batch cycle
  GET  /batch/status  — Check status of last batch run (with scheduler info)
"""

import os
from datetime import datetime, timedelta
from pathlib import Path
from fastapi import APIRouter, HTTPException
from ..services import cobol
from ..models.schemas import BatchResponse

router = APIRouter(prefix="/batch", tags=["Batch Pipeline"])

LAST_BATCH_FILE = Path(os.getenv("ZENTRA_BATCH_LOG", "data/output/last_batch.txt"))

# Simple in-memory state for last batch run
_last_batch: dict = {}


@router.post(
    "/run",
    response_model=BatchResponse,
    summary="Run full daily batch cycle",
    description="Orchestrates the complete Zentra batch pipeline:\n\n"
                "1. **FEE-ENGINE** — Generate fee transactions\n"
                "2. **TXN-VALIDATOR** — Validate all transactions (6 rules)\n"
                "3. **TXN-PROCESSOR** — Apply approved transactions\n"
                "4. **INTEREST-CALC** — Calculate and credit daily interest\n"
                "5. **EOD-REPORT** — Generate management report\n\n"
                "Each step runs sequentially. Returns per-step results."
)
async def run_batch():
    global _last_batch
    result = cobol.run_full_batch()
    _last_batch = result

    # Write last batch timestamp
    LAST_BATCH_FILE.parent.mkdir(parents=True, exist_ok=True)
    LAST_BATCH_FILE.write_text(datetime.now().isoformat())

    return BatchResponse(
        success=result["success"],
        steps_run=result["steps_run"],
        steps_passed=result["steps_passed"],
        steps=result["steps"]
    )


def _next_batch_time() -> str:
    """Calculate next 22:00 EST occurrence."""
    try:
        import pytz
        est = pytz.timezone("America/New_York")
        now = datetime.now(est)
        today_22 = now.replace(hour=22, minute=0, second=0, microsecond=0)
        if now >= today_22:
            today_22 += timedelta(days=1)
        return today_22.isoformat()
    except Exception:
        return "22:00 EST daily"


@router.get(
    "/status",
    summary="Batch status with scheduler info",
    description="Returns last batch run time, next scheduled run, and scheduler state."
)
async def batch_status():
    last_run = None
    if LAST_BATCH_FILE.exists():
        last_run = LAST_BATCH_FILE.read_text().strip()

    return {
        "last_run": last_run,
        "next_run": _next_batch_time(),
        "status": "idle",
        "scheduler": "active",
        "last_result": _last_batch if _last_batch else None,
    }
