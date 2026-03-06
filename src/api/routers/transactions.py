"""
routers/transactions.py
─────────────────────────────────────────────────
Zentra Bank — Transactions API Router

Endpoints:
  POST /transactions/validate  — Run TXN-VALIDATOR.cbl
  POST /transactions/process   — Run TXN-PROCESSOR.cbl
  POST /transactions/upload    — Upload a CSV, write to dat, validate
  GET  /transactions/ledger    — Return current TXN-LEDGER.dat contents
  GET  /transactions/rejected  — Return REJECTED-TRANSACTIONS.dat
"""

import csv
import io
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File
from ..services import cobol
from ..models.schemas import (
    ValidatorResponse, ProcessorResponse,
    RejectedRecord
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post(
    "/validate",
    response_model=ValidatorResponse,
    summary="Validate transactions",
    description="Runs TXN-VALIDATOR.cbl against DAILY-TRANSACTIONS.dat. "
                "Applies 6 business rules (E01–E06) and splits into "
                "APPROVED and REJECTED output files."
)
async def validate_transactions():
    result = cobol.run_txn_validator()

    if not result.get("success"):
        raise HTTPException(
            status_code=500,
            detail=f"TXN-VALIDATOR failed: {result.get('error', result.get('stderr'))}"
        )

    rejected = [
        RejectedRecord(**r)
        for r in result.get("rejected_records", [])
    ]

    return ValidatorResponse(
        success=True,
        total_read=result.get("total_read", 0),
        approved_count=result.get("approved_count", 0),
        rejected_count=result.get("rejected_count", 0),
        rejected_records=rejected
    )


@router.post(
    "/process",
    response_model=ProcessorResponse,
    summary="Process approved transactions",
    description="Runs TXN-PROCESSOR.cbl to apply all approved transactions. "
                "Updates account balances and writes audit ledger. "
                "Requires /validate to have been run first."
)
async def process_transactions():
    # Guard: check approved file exists
    approved_file = cobol.DATA_OUTPUT / "APPROVED-TRANSACTIONS.dat"
    if not approved_file.exists():
        raise HTTPException(
            status_code=400,
            detail="No APPROVED-TRANSACTIONS.dat found. Run /validate first."
        )

    result = cobol.run_txn_processor()

    if not result.get("success"):
        raise HTTPException(
            status_code=500,
            detail=f"TXN-PROCESSOR failed: {result.get('error', result.get('stderr'))}"
        )

    return ProcessorResponse(
        success=True,
        transactions_applied=result.get("transactions_applied", 0),
        total_deposited=result.get("total_deposited", "$0.00"),
        total_withdrawn=result.get("total_withdrawn", "$0.00"),
        ledger_entries=result.get("ledger_entries", [])
    )


@router.post(
    "/upload",
    summary="Upload transaction CSV",
    description="Upload a CSV file of transactions. The API converts it to "
                "the COBOL flat-file format and writes to DAILY-TRANSACTIONS.dat, "
                "then runs validation automatically.\n\n"
                "CSV columns: date, account_id, txn_type (DEP/WDR/XFR/FEE), "
                "amount, target_account, description"
)
async def upload_transactions(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted.")

    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    required_cols = {"date", "account_id", "txn_type", "amount", "description"}
    if not required_cols.issubset(set(reader.fieldnames or [])):
        raise HTTPException(
            status_code=400,
            detail=f"CSV must contain columns: {required_cols}"
        )

    # Convert CSV rows to COBOL fixed-width format
    dat_lines = []
    row_count = 0
    errors = []

    for i, row in enumerate(reader, 1):
        try:
            amount_cents = int(float(row["amount"]) * 100)
            amount_str = str(amount_cents).zfill(9)
            target = (row.get("target_account") or "").ljust(10)[:10]
            desc = row.get("description", "").ljust(30)[:30]
            account_id = row["account_id"].ljust(10)[:10]
            txn_type = row["txn_type"].ljust(10)[:10]
            date = row["date"][:10]

            # Match DAILY-TRANSACTIONS.dat fixed layout
            line = f"{date}{account_id}{txn_type}{amount_str}{target}{desc}PND   "
            dat_lines.append(line)
            row_count += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")

    if errors:
        raise HTTPException(status_code=400, detail={"parse_errors": errors})

    # Write to input file
    txn_file = cobol.DATA_INPUT / "DAILY-TRANSACTIONS.dat"
    txn_file.write_text("\n".join(dat_lines) + "\n")

    # Auto-run validation
    validation_result = cobol.run_txn_validator()

    return {
        "success": True,
        "rows_uploaded": row_count,
        "file_written": str(txn_file),
        "validation": {
            "total_read":     validation_result.get("total_read", 0),
            "approved_count": validation_result.get("approved_count", 0),
            "rejected_count": validation_result.get("rejected_count", 0),
        }
    }


@router.get(
    "/ledger",
    summary="Get transaction ledger",
    description="Returns the contents of TXN-LEDGER.dat — the audit trail "
                "of all applied transactions."
)
async def get_ledger():
    ledger_file = cobol.DATA_OUTPUT / "TXN-LEDGER.dat"
    if not ledger_file.exists():
        raise HTTPException(
            status_code=404,
            detail="TXN-LEDGER.dat not found. Run /process first."
        )

    lines = [l for l in ledger_file.read_text().splitlines() if l.strip()]
    return {
        "success": True,
        "entry_count": len(lines) - 2,  # subtract header rows
        "entries": lines
    }


@router.get(
    "/rejected",
    summary="Get rejected transactions",
    description="Returns all records that failed validation with their error codes."
)
async def get_rejected():
    rejected_file = cobol.DATA_OUTPUT / "REJECTED-TRANSACTIONS.dat"
    if not rejected_file.exists():
        raise HTTPException(
            status_code=404,
            detail="No rejected transactions file. Run /validate first."
        )

    records = []
    for line in rejected_file.read_text().splitlines():
        if line.strip() and len(line) > 20:
            records.append({
                "date":       line[0:10].strip(),
                "account_id": line[10:20].strip(),
                "txn_type":   line[20:23].strip(),
                "error_code": line[-3:].strip(),
                "raw":        line.strip()
            })

    return {
        "success": True,
        "rejected_count": len(records),
        "records": records
    }
