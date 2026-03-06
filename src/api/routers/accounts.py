"""Zentra Bank — Accounts API endpoints."""

from fastapi import APIRouter, HTTPException, Query

from ..models import Account
from ..parsers import (
    INPUT_DIR, OUTPUT_DIR, read_dat_file, parse_account_record,
)

router = APIRouter(prefix="/accounts", tags=["Accounts"])


def _load_accounts() -> list[Account]:
    """Load accounts from updated file first, fall back to master."""
    updated = OUTPUT_DIR / "ACCOUNTS-UPDATED.dat"
    master = INPUT_DIR / "ACCOUNTS-MASTER.dat"
    filepath = updated if updated.exists() and updated.stat().st_size > 0 else master
    records = read_dat_file(filepath, parse_account_record)
    return [Account(**r) for r in records]


@router.get("", response_model=list[Account])
def list_accounts(
    type: str | None = Query(None, description="Filter by account type"),
    status: str | None = Query(None, description="Filter by status (A/F/C)"),
):
    """List all accounts with optional filters."""
    accounts = _load_accounts()
    if type:
        accounts = [a for a in accounts if a.account_type.upper() == type.upper()]
    if status:
        accounts = [a for a in accounts if a.status.upper() == status.upper()]
    return accounts


@router.get("/{account_id}", response_model=Account)
def get_account(account_id: str):
    """Get a single account by ID."""
    accounts = _load_accounts()
    for acct in accounts:
        if acct.account_id == account_id.upper():
            return acct
    raise HTTPException(status_code=404, detail=f"Account {account_id} not found")
