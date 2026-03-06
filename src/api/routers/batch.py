"""
routers/batch.py
─────────────────────────────────────────────────
Zentra Bank — Batch Pipeline API Router

Endpoints:
  POST /batch/run     — Run full daily batch cycle
  GET  /batch/status  — Check status of last batch run
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException
from ..services import cobol
from ..models.schemas import BatchResponse

router = APIRouter(prefix="/batch", tags=["Batch Pipeline"])

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

    return BatchResponse(
        success=result["success"],
        steps_run=result["steps_run"],
        steps_passed=result["steps_passed"],
        steps=result["steps"]
    )


@router.get(
    "/status",
    summary="Last batch status",
    description="Returns the result of the most recent batch run."
)
async def batch_status():
    if not _last_batch:
        return {
            "success": False,
            "message": "No batch has been run yet. Call POST /batch/run first."
        }
    return _last_batch
