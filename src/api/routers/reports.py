"""
routers/reports.py
─────────────────────────────────────────────────
Zentra Bank — Reports API Router

Endpoints:
  GET  /reports/eod       — Generate and return EOD report
  POST /reports/fees      — Run FEE-ENGINE.cbl
  POST /reports/interest  — Run INTEREST-CALC.cbl
  GET  /reports/files     — List all generated output files
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
from ..services import cobol
from ..models.schemas import (
    EODReportResponse, FeeEngineResponse,
    FeeBreakdown, InterestResponse
)

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get(
    "/eod",
    summary="End-of-day report",
    description="Runs EOD-REPORT.cbl and returns the formatted management "
                "report. Requires /transactions/process to have run first."
)
async def get_eod_report():
    result = cobol.run_eod_report()

    if not result.get("success"):
        raise HTTPException(
            status_code=500,
            detail=f"EOD-REPORT failed: {result.get('error', result.get('stderr'))}"
        )

    return EODReportResponse(
        success=True,
        report_lines=result.get("report_lines", 0),
        report_text=result.get("report_text", "")
    )


@router.get(
    "/eod/text",
    response_class=PlainTextResponse,
    summary="EOD report as plain text",
    description="Returns the raw EOD report text — suitable for download or display."
)
async def get_eod_report_text():
    result = cobol.run_eod_report()
    if not result.get("success"):
        raise HTTPException(status_code=500, detail="EOD-REPORT failed")
    return result.get("report_text", "")


@router.post(
    "/fees",
    response_model=FeeEngineResponse,
    summary="Generate fee transactions",
    description="Runs FEE-ENGINE.cbl to scan all accounts and generate "
                "maintenance, low-balance, and overdraft fee transactions."
)
async def run_fees():
    result = cobol.run_fee_engine()

    if not result.get("success"):
        raise HTTPException(
            status_code=500,
            detail=f"FEE-ENGINE failed: {result.get('error', result.get('stderr'))}"
        )

    fees_data = result.get("fees", {})

    return FeeEngineResponse(
        success=True,
        fees=FeeBreakdown(
            maintenance=fees_data.get("maintenance", 0),
            low_balance=fees_data.get("low_balance", 0),
            overdraft=fees_data.get("overdraft", 0),
            total=fees_data.get("total", "$0.00")
        )
    )


@router.post(
    "/interest",
    response_model=InterestResponse,
    summary="Calculate daily interest",
    description="Runs INTEREST-CALC.cbl to calculate daily interest for all "
                "active accounts using the INTEREST-RATES.dat table."
)
async def run_interest():
    result = cobol.run_interest_calc()

    if not result.get("success"):
        raise HTTPException(
            status_code=500,
            detail=f"INTEREST-CALC failed: {result.get('error', result.get('stderr'))}"
        )

    return InterestResponse(
        success=True,
        accounts_credited=result.get("accounts_credited", 0),
        total_interest=result.get("total_interest", "$0.00")
    )


@router.get(
    "/files",
    summary="List output files",
    description="Lists all files currently in data/output/ with sizes."
)
async def list_output_files():
    import os
    output_dir = cobol.DATA_OUTPUT

    if not output_dir.exists():
        return {"success": True, "files": []}

    files = []
    for f in sorted(output_dir.iterdir()):
        if f.is_file() and f.suffix == ".dat":
            stat = f.stat()
            files.append({
                "name":          f.name,
                "size_bytes":    stat.st_size,
                "size_kb":       round(stat.st_size / 1024, 2),
                "last_modified": stat.st_mtime
            })

    return {
        "success": True,
        "file_count": len(files),
        "files": files
    }
