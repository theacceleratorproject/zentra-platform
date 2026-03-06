"""
services/cobol.py
─────────────────────────────────────────────────
Zentra Bank — COBOL Bridge Service

This is the core of Phase 3. Every API endpoint calls
one of these functions, which:
  1. Writes any input data to a temp file
  2. Compiles the COBOL program (if not already built)
  3. Runs the binary via subprocess
  4. Reads and parses output files
  5. Returns structured Python data

This pattern mirrors how real banks expose mainframe
COBOL logic through a service layer.
"""

import subprocess
import os
import tempfile
import shutil
from pathlib import Path
from typing import Optional

# ── Paths ──────────────────────────────────────────────
# These resolve relative to the repo root.
# Adjust REPO_ROOT if running from a different location.
REPO_ROOT   = Path(__file__).resolve().parents[3]
COBOL_SRC   = REPO_ROOT / "src" / "cobol"
COBOL_UTILS = COBOL_SRC / "utils"
DATA_INPUT  = REPO_ROOT / "data" / "input"
DATA_OUTPUT = REPO_ROOT / "data" / "output"
BIN_DIR     = DATA_OUTPUT  # compiled binaries land here


def _ensure_output_dir():
    DATA_OUTPUT.mkdir(parents=True, exist_ok=True)


def _compile(source_path: Path, binary_name: str) -> tuple[bool, str]:
    """
    Compile a COBOL source file to a binary.
    Returns (success, error_message).
    Skips recompile if binary is newer than source.
    """
    binary_path = BIN_DIR / binary_name
    _ensure_output_dir()

    # Skip if already compiled and up to date
    if (binary_path.exists() and
            binary_path.stat().st_mtime >= source_path.stat().st_mtime):
        return True, ""

    result = subprocess.run(
        ["cobc", "-x", f"-I{COBOL_UTILS}", "-o", str(binary_path),
         str(source_path)],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        return False, result.stderr
    return True, ""


def _run(binary_name: str, env: Optional[dict] = None) -> tuple[int, str, str]:
    """
    Run a compiled COBOL binary.
    Returns (returncode, stdout, stderr).
    """
    binary_path = BIN_DIR / binary_name
    if not binary_path.exists():
        return 1, "", f"Binary not found: {binary_path}"

    run_env = os.environ.copy()
    if env:
        run_env.update(env)

    result = subprocess.run(
        [str(binary_path)],
        capture_output=True, text=True,
        cwd=str(REPO_ROOT),
        env=run_env
    )
    return result.returncode, result.stdout, result.stderr


def _compile_and_run(
    source_rel: str,
    binary_name: str,
    env: Optional[dict] = None
) -> dict:
    """
    Compile (if needed) and run a COBOL program.
    Returns a result dict with stdout, stderr, success flag.
    """
    source_path = REPO_ROOT / source_rel
    ok, err = _compile(source_path, binary_name)
    if not ok:
        return {"success": False, "error": f"Compile error: {err}",
                "stdout": "", "stderr": err}

    rc, stdout, stderr = _run(binary_name, env)
    return {
        "success": rc == 0,
        "returncode": rc,
        "stdout": stdout,
        "stderr": stderr
    }


# ── Account Loader ──────────────────────────────────────
def run_account_loader() -> dict:
    """
    Run ACCOUNT-LOADER.cbl and parse the output into
    a list of account dicts.
    """
    result = _compile_and_run(
        "src/cobol/core/ACCOUNT-LOADER.cbl",
        "ACCOUNT-LOADER"
    )
    if not result["success"]:
        return result

    accounts = []
    lines = result["stdout"].splitlines()
    for line in lines:
        # Data lines start with "  ZNT-"
        stripped = line.strip()
        if stripped.startswith("ZNT-") or stripped.startswith("ZNT"):
            parts = stripped.split()
            if len(parts) >= 4:
                accounts.append({
                    "account_id":   parts[0],
                    "name":         " ".join(parts[1:-3]),
                    "account_type": parts[-3],
                    "balance":      parts[-2].replace("$", "").replace(",", ""),
                    "status":       parts[-1]
                })

    result["accounts"] = accounts
    result["count"] = len(accounts)
    return result


# ── Transaction Validator ───────────────────────────────
def run_txn_validator() -> dict:
    """
    Run TXN-VALIDATOR.cbl against DAILY-TRANSACTIONS.dat.
    Returns approved/rejected counts and file paths.
    """
    result = _compile_and_run(
        "src/cobol/core/TXN-VALIDATOR.cbl",
        "TXN-VALIDATOR"
    )
    if not result["success"]:
        return result

    # Parse stdout for counts
    approved = rejected = total = 0
    for line in result["stdout"].splitlines():
        if "Total Read" in line:
            total = int(line.split(":")[-1].strip())
        elif "Approved" in line:
            approved = int(line.split(":")[-1].strip())
        elif "Rejected" in line:
            rejected = int(line.split(":")[-1].strip())

    # Read rejected records for details
    rejected_file = DATA_OUTPUT / "REJECTED-TRANSACTIONS.dat"
    rejected_records = []
    if rejected_file.exists():
        for line in rejected_file.read_text().splitlines():
            line = line.strip()
            if line and len(line) > 30:
                rejected_records.append({
                    "date":        line[0:10].strip(),
                    "account_id":  line[10:20].strip(),
                    "txn_type":    line[20:23].strip(),
                    "error_code":  line[-3:].strip()
                })

    result["total_read"] = total
    result["approved_count"] = approved
    result["rejected_count"] = rejected
    result["rejected_records"] = rejected_records
    return result


# ── Transaction Processor ───────────────────────────────
def run_txn_processor() -> dict:
    """
    Run TXN-PROCESSOR.cbl to apply approved transactions.
    Returns updated balances and ledger entry count.
    """
    result = _compile_and_run(
        "src/cobol/core/TXN-PROCESSOR.cbl",
        "TXN-PROCESSOR"
    )
    if not result["success"]:
        return result

    txn_count = deposited = withdrawn = 0
    for line in result["stdout"].splitlines():
        if "Transactions Applied" in line:
            try:
                txn_count = int(line.split(":")[-1].strip())
            except ValueError:
                pass
        elif "Total Deposited" in line:
            deposited = line.split(":")[-1].strip()
        elif "Total Withdrawn" in line:
            withdrawn = line.split(":")[-1].strip()

    # Read ledger
    ledger_file = DATA_OUTPUT / "TXN-LEDGER.dat"
    ledger_entries = []
    if ledger_file.exists():
        lines = ledger_file.read_text().splitlines()
        for line in lines[2:]:  # skip header rows
            if line.strip():
                ledger_entries.append(line.strip())

    result["transactions_applied"] = txn_count
    result["total_deposited"] = deposited
    result["total_withdrawn"] = withdrawn
    result["ledger_entries"] = ledger_entries
    return result


# ── Fee Engine ──────────────────────────────────────────
def run_fee_engine() -> dict:
    """
    Run FEE-ENGINE.cbl to generate fee transactions.
    Returns fee counts by type and total assessed.
    """
    result = _compile_and_run(
        "src/cobol/core/FEE-ENGINE.cbl",
        "FEE-ENGINE"
    )
    if not result["success"]:
        return result

    fees = {"maintenance": 0, "low_balance": 0, "overdraft": 0, "total": ""}
    for line in result["stdout"].splitlines():
        if "Maintenance" in line:
            try:
                fees["maintenance"] = int(line.split(":")[-1].strip())
            except ValueError:
                pass
        elif "Low Balance" in line:
            try:
                fees["low_balance"] = int(line.split(":")[-1].strip())
            except ValueError:
                pass
        elif "Overdraft Fees" in line:
            try:
                fees["overdraft"] = int(line.split(":")[-1].strip())
            except ValueError:
                pass
        elif "Total Assessed" in line:
            fees["total"] = line.split(":")[-1].strip()

    result["fees"] = fees
    return result


# ── Interest Calculator ─────────────────────────────────
def run_interest_calc() -> dict:
    """
    Run INTEREST-CALC.cbl to calculate daily interest.
    Returns accounts credited and total interest amount.
    """
    result = _compile_and_run(
        "src/cobol/core/INTEREST-CALC.cbl",
        "INTEREST-CALC"
    )
    if not result["success"]:
        return result

    credited = 0
    total_interest = ""
    for line in result["stdout"].splitlines():
        if "Accounts Credited" in line:
            try:
                credited = int(line.split(":")[-1].strip())
            except ValueError:
                pass
        elif "Total Interest" in line:
            total_interest = line.split(":")[-1].strip()

    result["accounts_credited"] = credited
    result["total_interest"] = total_interest
    return result


# ── EOD Report ──────────────────────────────────────────
def run_eod_report() -> dict:
    """
    Run EOD-REPORT.cbl and return the full report text.
    """
    result = _compile_and_run(
        "src/cobol/reports/EOD-REPORT.cbl",
        "EOD-REPORT"
    )
    if not result["success"]:
        return result

    report_file = DATA_OUTPUT / "EOD-REPORT.dat"
    report_text = ""
    if report_file.exists():
        report_text = report_file.read_text()

    result["report_text"] = report_text
    result["report_lines"] = len(report_text.splitlines())
    return result


# ── Full Batch Pipeline ─────────────────────────────────
def run_full_batch() -> dict:
    """
    Run the complete daily batch cycle in order:
    FEE-ENGINE → TXN-VALIDATOR → TXN-PROCESSOR
    → INTEREST-CALC → EOD-REPORT
    Returns step-by-step results.
    """
    steps = [
        ("fee_engine",     run_fee_engine),
        ("txn_validator",  run_txn_validator),
        ("txn_processor",  run_txn_processor),
        ("interest_calc",  run_interest_calc),
        ("eod_report",     run_eod_report),
    ]

    results = {}
    all_passed = True

    for step_name, step_fn in steps:
        step_result = step_fn()
        results[step_name] = {
            "success": step_result.get("success", False),
            "stdout":  step_result.get("stdout", "")[:500],  # truncate
        }
        if not step_result.get("success", False):
            all_passed = False
            results[step_name]["error"] = step_result.get("error", "Unknown error")

    return {
        "success": all_passed,
        "steps": results,
        "steps_run": len(steps),
        "steps_passed": sum(1 for s in results.values() if s["success"])
    }
