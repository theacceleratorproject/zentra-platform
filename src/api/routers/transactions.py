"""Zentra Bank — Transactions API endpoints."""

from fastapi import APIRouter, Query

from ..models import Transaction
from ..parsers import (
    INPUT_DIR, OUTPUT_DIR, read_dat_file, parse_transaction_record,
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


def _load_transactions(filepath, **filters) -> list[Transaction]:
    records = read_dat_file(filepath, parse_transaction_record)
    txns = [Transaction(**r) for r in records]
    if filters.get("type"):
        txns = [t for t in txns if t.txn_type == filters["type"].upper()]
    if filters.get("status"):
        txns = [t for t in txns if t.status == filters["status"].upper()]
    if filters.get("account_id"):
        txns = [t for t in txns if t.account_id == filters["account_id"].upper()]
    return txns


@router.get("", response_model=list[Transaction])
def list_transactions(
    type: str | None = Query(None, description="Filter by type (DEP/WDR/XFR/FEE/INT)"),
    status: str | None = Query(None, description="Filter by status (PND/APR/REJ)"),
    account_id: str | None = Query(None, description="Filter by account ID"),
):
    """List all input transactions from DAILY-TRANSACTIONS.dat."""
    return _load_transactions(
        INPUT_DIR / "DAILY-TRANSACTIONS.dat",
        type=type, status=status, account_id=account_id,
    )


@router.get("/approved", response_model=list[Transaction])
def list_approved():
    """List approved transactions after validation."""
    return _load_transactions(OUTPUT_DIR / "APPROVED-TRANSACTIONS.dat")


@router.get("/rejected", response_model=list[Transaction])
def list_rejected():
    """List rejected transactions with error codes."""
    return _load_transactions(OUTPUT_DIR / "REJECTED-TRANSACTIONS.dat")


@router.get("/fees", response_model=list[Transaction])
def list_fees():
    """List auto-generated fee transactions."""
    return _load_transactions(OUTPUT_DIR / "FEE-TRANSACTIONS.dat")


@router.get("/interest", response_model=list[Transaction])
def list_interest():
    """List auto-generated interest transactions."""
    return _load_transactions(OUTPUT_DIR / "INTEREST-TRANSACTIONS.dat")
