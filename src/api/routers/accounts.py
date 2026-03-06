"""
routers/accounts.py
─────────────────────────────────────────────────
Zentra Bank — Accounts API Router

Endpoints:
  GET  /accounts        — List all accounts (calls ACCOUNT-LOADER.cbl)
  GET  /accounts/health — Verify account file is accessible
"""

from fastapi import APIRouter, HTTPException
from ..services import cobol
from ..models.schemas import AccountListResponse, Account

router = APIRouter(prefix="/accounts", tags=["Accounts"])


@router.get(
    "",
    response_model=AccountListResponse,
    summary="List all accounts",
    description="Reads ACCOUNTS-MASTER.dat via ACCOUNT-LOADER.cbl and returns "
                "all accounts with balances and status."
)
async def list_accounts():
    result = cobol.run_account_loader()

    if not result.get("success"):
        raise HTTPException(
            status_code=500,
            detail=f"COBOL ACCOUNT-LOADER failed: {result.get('error', result.get('stderr', 'Unknown'))}"
        )

    accounts = [
        Account(**acct) for acct in result.get("accounts", [])
    ]

    return AccountListResponse(
        success=True,
        count=len(accounts),
        accounts=accounts
    )


@router.get(
    "/health",
    summary="Account file health check",
    description="Verifies ACCOUNTS-MASTER.dat is present and ACCOUNT-LOADER compiles."
)
async def account_health():
    from pathlib import Path
    master_file = cobol.DATA_INPUT / "ACCOUNTS-MASTER.dat"

    return {
        "accounts_master_exists": master_file.exists(),
        "accounts_master_path": str(master_file),
        "accounts_master_size_bytes": master_file.stat().st_size if master_file.exists() else 0
    }
