"""
routers/accounts.py
─────────────────────────────────────────────────
Zentra Bank — Accounts API Router

Endpoints:
  GET    /accounts          — List all accounts (parsed from .dat)
  GET    /accounts/health   — Verify account file is accessible
  GET    /accounts/{id}     — Get single account by ID
  POST   /accounts          — Create new account
  DELETE /accounts/{id}     — Close account (flip status to 'C')
"""

import uuid
from datetime import date
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from ..services import cobol

router = APIRouter(prefix="/accounts", tags=["Accounts"])

# ── Record format constants ────────────────────────────────────────────────
ACCT_RECORD_LEN = 94


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _fmt_field(value: str, width: int) -> str:
    return value.ljust(width)[:width]


def _parse_balance(raw: str) -> float:
    """Parse '+00184733000' → 18473.30"""
    sign = raw[0]
    digits = raw[1:]
    val = int(digits) / 100.0
    return -val if sign == "-" else val


def _read_accounts() -> list[dict]:
    """Parse ACCOUNTS-MASTER.dat into list of account dicts."""
    accounts = []
    master_file = cobol.DATA_INPUT / "ACCOUNTS-MASTER.dat"
    if not master_file.exists():
        return accounts
    for line in master_file.read_text().splitlines():
        if len(line) < ACCT_RECORD_LEN:
            continue
        accounts.append({
            "id":             line[0:10].strip(),
            "name":           line[10:35].strip(),
            "type":           line[35:45].strip(),
            "balance":        _parse_balance(line[45:57]),
            "overdraftLimit": int(line[57:66]) / 100.0,
            "status":         line[66:67].strip(),
            "openDate":       line[67:77].strip(),
            "lastTxnDate":    line[77:87].strip(),
        })
    return accounts


def _gen_account_id() -> str:
    """Generate unique ZNT-XXXXXX account ID not already in file."""
    existing = {a["id"] for a in _read_accounts()}
    while True:
        candidate = "ZNT-" + str(uuid.uuid4().int)[:6]
        if candidate not in existing:
            return candidate


# ── Schemas ────────────────────────────────────────────────────────────────

class CreateAccountRequest(BaseModel):
    name: str = Field(..., max_length=25, examples=["MARCK PIERRE"])
    type: str = Field(..., examples=["CHECKING"])
    od_limit: float = Field(0.0, ge=0, examples=[500.0])


OD_DEFAULTS = {
    "CHECKING":    500.00,
    "SAVINGS":       0.00,
    "MONEY_MARKET":  0.00,
    "BUSINESS":    500.00,
}

VALID_TYPES = list(OD_DEFAULTS.keys())


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "",
    summary="List all accounts",
    description="Reads ACCOUNTS-MASTER.dat and returns all accounts "
                "with balances, status, and overdraft limits."
)
async def list_accounts():
    accounts = _read_accounts()
    return {
        "success": True,
        "count": len(accounts),
        "accounts": accounts
    }


@router.get(
    "/health",
    summary="Account file health check",
    description="Verifies ACCOUNTS-MASTER.dat is present and accessible."
)
async def account_health():
    master_file = cobol.DATA_INPUT / "ACCOUNTS-MASTER.dat"
    return {
        "accounts_master_exists": master_file.exists(),
        "accounts_master_path": str(master_file),
        "accounts_master_size_bytes": master_file.stat().st_size if master_file.exists() else 0
    }


@router.get(
    "/{account_id}",
    summary="Get single account",
    description="Returns a single account by ID from ACCOUNTS-MASTER.dat."
)
async def get_account_by_id(account_id: str):
    for a in _read_accounts():
        if a["id"] == account_id:
            return a
    raise HTTPException(status_code=404, detail=f"Account {account_id} not found")


@router.post(
    "",
    summary="Create new account",
    description="Opens a new account: generates ID, writes a 94-byte fixed-width "
                "record to ACCOUNTS-MASTER.dat with $0.00 balance and Active status."
)
async def create_account(req: CreateAccountRequest):
    acct_type = req.type.upper().replace(" ", "_")
    if acct_type not in VALID_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid account type. Must be one of: {', '.join(VALID_TYPES)}"
        )

    today = date.today().isoformat()
    account_id = _gen_account_id()
    od_limit = req.od_limit if req.od_limit > 0 else OD_DEFAULTS[acct_type]

    # Format balance: $0.00 → "+00000000000" (PIC S9(9)V99 SIGN LEADING SEPARATE = 12 chars)
    balance_str = "+00000000000"

    # Format OD limit: e.g. $500.00 → "005000000" (PIC 9(7)V99 = 9 chars)
    od_cents = round(od_limit * 100)
    od_str = str(od_cents).zfill(9)

    # Build 94-byte record matching ACCOUNT-RECORD.cpy
    record = (
        _fmt_field(account_id, 10) +
        _fmt_field(req.name.upper(), 25) +
        _fmt_field(acct_type, 10) +
        balance_str +
        od_str +
        "A" +
        _fmt_field(today, 10) +
        _fmt_field(today, 10) +
        " " * 7
    )

    assert len(record) == ACCT_RECORD_LEN, \
        f"Account record malformed: {len(record)} bytes (expected {ACCT_RECORD_LEN})"

    master_file = cobol.DATA_INPUT / "ACCOUNTS-MASTER.dat"
    with master_file.open("a") as f:
        f.write(record + "\n")

    return {
        "success": True,
        "id": account_id,
        "name": req.name.upper(),
        "type": acct_type,
        "balance": 0.00,
        "overdraftLimit": od_limit,
        "status": "A",
        "openDate": today,
        "lastTxnDate": today,
        "message": "Account created. COBOL batch engine will process on next nightly cycle.",
    }


@router.delete(
    "/{account_id}",
    summary="Close account",
    description="Flips status byte from 'A' to 'C' in ACCOUNTS-MASTER.dat. "
                "Account must have $0.00 balance before closing."
)
async def close_account(account_id: str):
    master_file = cobol.DATA_INPUT / "ACCOUNTS-MASTER.dat"
    lines = master_file.read_text().splitlines()
    found = False
    new_lines = []

    for line in lines:
        if line[0:10].strip() == account_id and len(line) >= ACCT_RECORD_LEN:
            found = True

            balance = _parse_balance(line[45:57])
            if balance != 0.00:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot close account with non-zero balance (${balance:,.2f}). "
                           f"Please withdraw or transfer remaining funds first."
                )

            if line[66:67] == "C":
                raise HTTPException(status_code=400, detail="Account is already closed")

            # Flip status byte [66:67] from "A" to "C"
            line = line[:66] + "C" + line[67:]

        new_lines.append(line)

    if not found:
        raise HTTPException(status_code=404, detail=f"Account {account_id} not found")

    master_file.write_text("\n".join(new_lines) + "\n")

    return {
        "success": True,
        "account_id": account_id,
        "status": "C",
        "message": "Account closed. Status updated in ACCOUNTS-MASTER.dat. "
                   "Excluded from next nightly COBOL batch cycle.",
    }
