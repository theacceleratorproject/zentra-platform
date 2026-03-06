"""Zentra Bank — Batch operations, rates, and reports."""

import subprocess
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from ..models import BatchResult, InterestRate
from ..parsers import INPUT_DIR, OUTPUT_DIR, read_dat_file, parse_interest_rate

router = APIRouter(tags=["Operations"])


@router.post("/batch/run", response_model=BatchResult)
def run_batch():
    """Execute the full daily batch cycle (compile + run all COBOL programs)."""
    try:
        result = subprocess.run(
            ["bash", "scripts/run-batch.sh"],
            capture_output=True,
            text=True,
            timeout=120,
        )
        return BatchResult(
            success=result.returncode == 0,
            output=result.stdout + result.stderr,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Batch timed out after 120s")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Batch script not found")


@router.get("/rates", response_model=list[InterestRate])
def list_rates():
    """List interest rates by account type."""
    records = read_dat_file(
        INPUT_DIR / "INTEREST-RATES.dat", parse_interest_rate,
    )
    return [InterestRate(**r) for r in records]


@router.get("/reports/eod")
def get_eod_report():
    """Return the end-of-day report as text lines."""
    filepath = OUTPUT_DIR / "EOD-REPORT.dat"
    if not filepath.exists():
        raise HTTPException(
            status_code=404,
            detail="EOD report not generated yet. Run POST /batch/run first.",
        )
    with open(filepath, "r", errors="replace") as f:
        lines = [line.rstrip() for line in f]
    return {"report": lines, "line_count": len(lines)}
