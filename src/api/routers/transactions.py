"""
routers/transactions.py
─────────────────────────────────────────────────
Zentra Bank — Transactions API Router

Endpoints:
  POST /transactions/validate   — Run TXN-VALIDATOR.cbl
  POST /transactions/process    — Run TXN-PROCESSOR.cbl
  POST /transactions/upload     — Upload a CSV, write to dat, validate
  GET  /transactions/ledger     — Return ledger (supports ?account_id= filter)
  GET  /transactions/rejected   — Return REJECTED-TRANSACTIONS.dat
  POST /transactions/deposit    — Portal: single deposit
  POST /transactions/withdraw   — Portal: single withdrawal
  POST /transactions/transfer   — Portal: account-to-account transfer
"""

import csv
import io
import uuid
import logging
from datetime import date
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from ..services import cobol
from ..models.schemas import (
    ValidatorResponse, ProcessorResponse,
    RejectedRecord
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])
logger = logging.getLogger(__name__)

# ── Record format constants ────────────────────────────────────────────────
TXN_RECORD_LEN  = 100
ACCT_RECORD_LEN = 94


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _fmt_amount(amount: float) -> str:
    """Convert float to 11-digit fixed-width string with implied 2 decimal places.
    e.g. 2500.00 → '00000250000'  |  0.50 → '00000000050'
    """
    cents = round(amount * 100)
    return str(cents).zfill(11)


def _fmt_field(value: str, width: int) -> str:
    """Left-justify and pad/truncate to exact width."""
    return value.ljust(width)[:width]


def _build_txn_record(
    txn_date: str,
    account_id: str,
    txn_type: str,
    amount: float,
    target_acct: str = "",
    description: str = "",
    status: str = "PND",
    error_code: str = "   ",
) -> str:
    """Build a 100-byte fixed-width DAILY-TRANSACTIONS record."""
    record = (
        _fmt_field(txn_date, 10) +
        _fmt_field(account_id, 10) +
        _fmt_field(txn_type, 3) +
        _fmt_amount(amount) +
        _fmt_field(target_acct, 10) +
        _fmt_field(description, 30) +
        _fmt_field(status, 3) +
        _fmt_field(error_code, 3) +
        " " * 20
    )
    assert len(record) == TXN_RECORD_LEN, f"Record is {len(record)} bytes, expected {TXN_RECORD_LEN}"
    return record


def _read_accounts() -> list[dict]:
    """Parse ACCOUNTS-MASTER.dat into list of account dicts."""
    accounts = []
    master_file = cobol.DATA_INPUT / "ACCOUNTS-MASTER.dat"
    if not master_file.exists():
        return accounts
    for line in master_file.read_text().splitlines():
        if len(line) < ACCT_RECORD_LEN:
            continue
        raw_bal = line[45:57]
        sign = raw_bal[0]
        digits = raw_bal[1:]
        try:
            balance = int(digits) / 100.0
        except ValueError:
            balance = 0.0
        if sign == "-":
            balance = -balance
        od_raw = line[57:66]
        try:
            od_limit = int(od_raw) / 100.0
        except ValueError:
            od_limit = 0.0
        raw_status = line[66:67].strip().upper()
        accounts.append({
            "id": line[0:10].strip(),
            "name": line[10:35].strip(),
            "type": line[35:45].strip(),
            "balance": balance,
            "overdraftLimit": od_limit,
            "status": raw_status if raw_status else "A",
        })
    return accounts


def _get_account(account_id: str) -> dict | None:
    for a in _read_accounts():
        if a["id"] == account_id:
            return a
    return None


def _append_txn_record(record: str) -> None:
    """Append a 100-byte record to DAILY-TRANSACTIONS.dat."""
    txn_file = cobol.DATA_INPUT / "DAILY-TRANSACTIONS.dat"
    with txn_file.open("a") as f:
        f.write(record + "\n")


def _update_last_txn_date(account_id: str, txn_date: str) -> None:
    """Rewrite ACCOUNTS-MASTER.dat updating Last Txn Date for one account."""
    master_file = cobol.DATA_INPUT / "ACCOUNTS-MASTER.dat"
    lines = master_file.read_text().splitlines()
    new_lines = []
    for line in lines:
        if line[0:10].strip() == account_id and len(line) >= ACCT_RECORD_LEN:
            line = line[:77] + _fmt_field(txn_date, 10) + line[87:]
        new_lines.append(line)
    master_file.write_text("\n".join(new_lines) + "\n")


def _gen_ref() -> str:
    return "ZB" + uuid.uuid4().hex[:8].upper()


# ── Portal Schemas ─────────────────────────────────────────────────────────

class DepositRequest(BaseModel):
    account_id: str = Field(..., examples=["ZNT-001042"])
    amount: float = Field(..., gt=0, examples=[500.00])
    description: str = Field("PORTAL DEPOSIT", max_length=30)


class WithdrawRequest(BaseModel):
    account_id: str = Field(..., examples=["ZNT-001042"])
    amount: float = Field(..., gt=0, examples=[200.00])
    description: str = Field("PORTAL WITHDRAWAL", max_length=30)


class TransferRequest(BaseModel):
    from_account_id: str = Field(..., examples=["ZNT-001042"])
    to_account_id: str = Field(..., examples=["ZNT-001043"])
    amount: float = Field(..., gt=0, examples=[100.00])
    description: str = Field("PORTAL TRANSFER", max_length=30)


# ─────────────────────────────────────────────────────────────────────────────
# EXISTING ENDPOINTS (Operations Hub)
# ─────────────────────────────────────────────────────────────────────────────

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
            date_str = row["date"][:10]

            line = f"{date_str}{account_id}{txn_type}{amount_str}{target}{desc}PND   "
            dat_lines.append(line)
            row_count += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")

    if errors:
        raise HTTPException(status_code=400, detail={"parse_errors": errors})

    txn_file = cobol.DATA_INPUT / "DAILY-TRANSACTIONS.dat"
    txn_file.write_text("\n".join(dat_lines) + "\n")

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


# ─────────────────────────────────────────────────────────────────────────────
# ENHANCED LEDGER (supports ?account_id= filter for portal)
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/ledger",
    summary="Get transaction ledger",
    description="Returns parsed transaction records. "
                "Optional: filter by account_id query parameter."
)
async def get_ledger(account_id: str | None = None, account_ids: str | None = None, limit: int = 50):
    records = []
    # Build filter set: single account_id or comma-separated account_ids
    filter_ids = None
    if account_id:
        filter_ids = {account_id}
    elif account_ids:
        filter_ids = {aid.strip() for aid in account_ids.split(",") if aid.strip()}

    # Read DAILY-TRANSACTIONS.dat (real-time + pending)
    txn_file = cobol.DATA_INPUT / "DAILY-TRANSACTIONS.dat"
    if txn_file.exists():
        for line in txn_file.read_text().splitlines():
            if len(line) < 80:
                continue
            acct = line[10:20].strip()
            if filter_ids and acct not in filter_ids:
                continue
            try:
                amount = int(line[23:34]) / 100.0
            except ValueError:
                amount = 0.0
            records.append({
                "source":      "realtime",
                "date":        line[0:10].strip(),
                "account_id":  acct,
                "type":        line[20:23].strip(),
                "amount":      amount,
                "target_acct": line[34:44].strip(),
                "description": line[44:74].strip(),
                "status":      line[74:77].strip(),
                "error_code":  line[77:80].strip(),
            })

    # Read TXN-LEDGER.dat (EOD batch output)
    ledger_file = cobol.DATA_OUTPUT / "TXN-LEDGER.dat"
    if ledger_file.exists():
        for line in ledger_file.read_text().splitlines():
            if len(line) < 80:
                continue
            acct = line[10:20].strip()
            if filter_ids and acct not in filter_ids:
                continue
            try:
                amount = int(line[23:34]) / 100.0
            except ValueError:
                amount = 0.0
            records.append({
                "source":      "batch",
                "date":        line[0:10].strip(),
                "account_id":  acct,
                "type":        line[20:23].strip(),
                "amount":      amount,
                "target_acct": line[34:44].strip(),
                "description": line[44:74].strip(),
                "status":      line[74:77].strip(),
                "error_code":  line[77:80].strip(),
            })

    records.sort(key=lambda r: r["date"], reverse=True)
    return {
        "success": True,
        "account_id": account_id,
        "count": len(records[:limit]),
        "transactions": records[:limit]
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


# ─────────────────────────────────────────────────────────────────────────────
# PORTAL ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/deposit",
    summary="Portal: deposit funds",
    description="Writes a DEP record to DAILY-TRANSACTIONS.dat and triggers "
                "TXN-VALIDATOR. Nightly batch reconciles into EOD report."
)
async def deposit(req: DepositRequest):
    acct = _get_account(req.account_id)
    if not acct:
        raise HTTPException(status_code=404, detail=f"Account {req.account_id} not found")
    if acct["status"].strip().upper() not in ("A", "ACTIVE"):
        logger.warning(f"Deposit rejected: account {req.account_id} status='{acct['status']}'")
        raise HTTPException(status_code=400, detail="Account is not active")

    today = date.today().isoformat()
    ref = _gen_ref()

    record = _build_txn_record(
        txn_date=today,
        account_id=req.account_id,
        txn_type="DEP",
        amount=req.amount,
        target_acct="",
        description=req.description,
    )

    _append_txn_record(record)
    _update_last_txn_date(req.account_id, today)
    validator_result = cobol.run_txn_validator()

    return {
        "success": True,
        "reference": ref,
        "account_id": req.account_id,
        "amount": req.amount,
        "description": req.description,
        "date": today,
        "status": "PND",
        "batch_cycle": "22:00 EST",
        "validator_summary": {
            "total_read": validator_result.get("total_read", 0),
            "approved": validator_result.get("approved_count", 0),
            "rejected": validator_result.get("rejected_count", 0),
        },
    }


@router.post(
    "/withdraw",
    summary="Portal: withdraw funds",
    description="Validates against balance + overdraft limit, writes a WDR record "
                "to DAILY-TRANSACTIONS.dat, and triggers TXN-VALIDATOR."
)
async def withdraw(req: WithdrawRequest):
    acct = _get_account(req.account_id)
    if not acct:
        raise HTTPException(status_code=404, detail=f"Account {req.account_id} not found")
    if acct["status"].strip().upper() not in ("A", "ACTIVE"):
        logger.warning(f"Withdraw rejected: account {req.account_id} status='{acct['status']}'")
        raise HTTPException(status_code=400, detail="Account is not active")

    available = acct["balance"] + acct["overdraftLimit"]
    if req.amount > available:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient funds. Available: ${available:,.2f} (balance + overdraft limit)"
        )

    today = date.today().isoformat()
    ref = _gen_ref()

    record = _build_txn_record(
        txn_date=today,
        account_id=req.account_id,
        txn_type="WDR",
        amount=req.amount,
        target_acct="",
        description=req.description,
    )

    _append_txn_record(record)
    _update_last_txn_date(req.account_id, today)
    validator_result = cobol.run_txn_validator()

    return {
        "success": True,
        "reference": ref,
        "account_id": req.account_id,
        "amount": req.amount,
        "description": req.description,
        "date": today,
        "status": "PND",
        "batch_cycle": "22:00 EST",
        "validator_summary": {
            "total_read": validator_result.get("total_read", 0),
            "approved": validator_result.get("approved_count", 0),
            "rejected": validator_result.get("rejected_count", 0),
        },
    }


@router.post(
    "/transfer",
    summary="Portal: transfer between accounts",
    description="Validates both accounts, writes an XFR record to "
                "DAILY-TRANSACTIONS.dat. COBOL TXN-PROCESSOR handles "
                "both the debit and credit sides from the single XFR record."
)
async def transfer(req: TransferRequest):
    if req.from_account_id == req.to_account_id:
        raise HTTPException(status_code=400, detail="Source and destination accounts must differ")

    from_acct = _get_account(req.from_account_id)
    to_acct = _get_account(req.to_account_id)

    if not from_acct:
        raise HTTPException(status_code=404, detail=f"Source account {req.from_account_id} not found")
    if not to_acct:
        raise HTTPException(status_code=404, detail=f"Destination account {req.to_account_id} not found")

    logger.info(f"Transfer: from={req.from_account_id} status='{from_acct['status']}', to={req.to_account_id} status='{to_acct['status']}'")

    if from_acct["status"].strip().upper() not in ("A", "ACTIVE"):
        logger.warning(f"Transfer rejected: source account {req.from_account_id} status='{from_acct['status']}'")
        raise HTTPException(status_code=400, detail="Source account is not active")
    if to_acct["status"].strip().upper() not in ("A", "ACTIVE"):
        logger.warning(f"Transfer rejected: dest account {req.to_account_id} status='{to_acct['status']}'")
        raise HTTPException(status_code=400, detail="Destination account is not active")

    available = from_acct["balance"] + from_acct["overdraftLimit"]
    if req.amount > available:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient funds. Available: ${available:,.2f}"
        )

    today = date.today().isoformat()
    ref = _gen_ref()
    desc = req.description or f"TRANSFER REF {ref}"

    # Single XFR record — COBOL TXN-PROCESSOR debits source and credits target
    record = _build_txn_record(
        txn_date=today,
        account_id=req.from_account_id,
        txn_type="XFR",
        amount=req.amount,
        target_acct=req.to_account_id,
        description=desc,
    )

    _append_txn_record(record)
    _update_last_txn_date(req.from_account_id, today)
    _update_last_txn_date(req.to_account_id, today)
    validator_result = cobol.run_txn_validator()

    return {
        "success": True,
        "reference": ref,
        "from_account_id": req.from_account_id,
        "to_account_id": req.to_account_id,
        "amount": req.amount,
        "description": desc,
        "date": today,
        "records_written": 1,
        "status": "PND",
        "batch_cycle": "22:00 EST",
        "validator_summary": {
            "total_read": validator_result.get("total_read", 0),
            "approved": validator_result.get("approved_count", 0),
            "rejected": validator_result.get("rejected_count", 0),
        },
    }
