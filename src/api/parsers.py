"""
Zentra Bank — Fixed-width .dat file parsers.

Reads COBOL-generated flat files based on copybook field positions
(ACCOUNT-RECORD.cpy, TRANSACTION-RECORD.cpy).
"""

from pathlib import Path
from typing import Callable


DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
INPUT_DIR = DATA_DIR / "input"
OUTPUT_DIR = DATA_DIR / "output"


def parse_cobol_balance(raw: str) -> float:
    """Parse PIC S9(9)V99 SIGN LEADING SEPARATE (12 chars).

    Format: sign char (+/-) followed by 11 digits.
    The last 2 digits are decimal places (implied V).
    Example: '+00001847330' -> 18473.30
    """
    raw = raw.strip()
    if not raw:
        return 0.0
    sign = -1 if raw[0] == "-" else 1
    digits = raw[1:] if raw[0] in "+-" else raw
    digits = digits.lstrip("0") or "0"
    if len(digits) <= 2:
        return sign * int(digits) / 100
    integer_part = digits[:-2]
    decimal_part = digits[-2:]
    return sign * float(f"{integer_part}.{decimal_part}")


def parse_cobol_amount(raw: str) -> float:
    """Parse PIC 9(9)V99 (11 chars, unsigned).

    Last 2 digits are decimal places (implied V).
    Example: '00000250000' -> 2500.00
    """
    raw = raw.strip()
    if not raw or not raw.isdigit():
        return 0.0
    digits = raw.lstrip("0") or "0"
    if len(digits) <= 2:
        return int(digits) / 100
    integer_part = digits[:-2]
    decimal_part = digits[-2:]
    return float(f"{integer_part}.{decimal_part}")


def parse_cobol_od_limit(raw: str) -> float:
    """Parse PIC 9(7)V99 (9 chars, unsigned)."""
    return parse_cobol_amount(raw)


def parse_account_record(line: str) -> dict | None:
    """Parse a 100-byte account record from ACCOUNTS-MASTER.dat."""
    if len(line) < 67:
        return None
    return {
        "account_id": line[0:10].strip(),
        "name": line[10:35].strip(),
        "account_type": line[35:45].strip(),
        "balance": parse_cobol_balance(line[45:57]),
        "overdraft_limit": parse_cobol_od_limit(line[57:66]),
        "status": line[66:67].strip(),
        "open_date": line[67:77].strip(),
        "last_txn_date": line[77:87].strip(),
    }


def parse_transaction_record(line: str) -> dict | None:
    """Parse a 100-byte transaction record."""
    if len(line) < 78:
        return None
    return {
        "date": line[0:10].strip(),
        "account_id": line[10:20].strip(),
        "txn_type": line[20:23].strip(),
        "amount": parse_cobol_amount(line[23:34]),
        "target_account": line[34:44].strip(),
        "description": line[44:74].strip(),
        "status": line[74:77].strip(),
        "error_code": line[77:80].strip(),
    }


def parse_interest_rate(line: str) -> dict | None:
    """Parse an interest rate record (account_type + rate)."""
    if len(line) < 11:
        return None
    account_type = line[0:10].strip()
    try:
        annual_rate = float(line[10:].strip())
    except ValueError:
        return None
    return {
        "account_type": account_type,
        "annual_rate": annual_rate,
        "daily_rate": round(annual_rate / 365, 8),
    }


def read_dat_file(filepath: Path, parser: Callable) -> list[dict]:
    """Read a .dat file and parse each line with the given parser."""
    if not filepath.exists():
        return []
    results = []
    with open(filepath, "r", errors="replace") as f:
        for line in f:
            line = line.rstrip("\n").rstrip("\r")
            if not line.strip():
                continue
            record = parser(line)
            if record:
                results.append(record)
    return results
