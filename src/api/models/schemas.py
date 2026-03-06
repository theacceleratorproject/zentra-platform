"""
models/schemas.py
─────────────────────────────────────────────────
Zentra Bank — Pydantic Request & Response Schemas

All API input validation and output shaping runs
through these models. Pydantic enforces types,
ranges, and required fields automatically.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from enum import Enum


# ── Enums ───────────────────────────────────────────────

class AccountType(str, Enum):
    CHECKING = "CHECKING"
    SAVINGS  = "SAVINGS"
    BUSINESS = "BUSINESS"

class TxnType(str, Enum):
    DEPOSIT    = "DEP"
    WITHDRAWAL = "WDR"
    TRANSFER   = "XFR"
    FEE        = "FEE"
    INTEREST   = "INT"

class AccountStatus(str, Enum):
    ACTIVE = "A"
    FROZEN = "F"
    CLOSED = "C"


# ── Account Schemas ─────────────────────────────────────

class Account(BaseModel):
    account_id:   str
    name:         str
    account_type: str
    balance:      str
    status:       str


class AccountListResponse(BaseModel):
    success:  bool
    count:    int
    accounts: List[Account]


# ── Loan / Amortization Schemas ─────────────────────────

class LoanCalculateRequest(BaseModel):
    principal: float = Field(
        ..., gt=0, le=10_000_000,
        description="Loan principal amount in USD",
        examples=[250000.00]
    )
    annual_rate_pct: float = Field(
        ..., gt=0, le=30,
        description="Annual interest rate as a percentage (e.g. 6.875)",
        examples=[6.875]
    )
    years: int = Field(
        ..., ge=1, le=30,
        description="Loan term in years",
        examples=[30]
    )

    @field_validator("annual_rate_pct")
    @classmethod
    def rate_must_be_reasonable(cls, v):
        if v > 30:
            raise ValueError("Rate cannot exceed 30%")
        return v


class AmortizationRow(BaseModel):
    period:            int
    payment:           float
    principal_payment: float
    interest_payment:  float
    balance:           float


class LoanCalculateResponse(BaseModel):
    success:          bool
    principal:        float
    annual_rate_pct:  float
    years:            int
    monthly_payment:  float
    total_interest:   float
    total_cost:       float
    schedule:         List[AmortizationRow]


# ── Transaction Schemas ─────────────────────────────────

class TransactionRequest(BaseModel):
    date:           str = Field(
        ..., pattern=r"^\d{4}-\d{2}-\d{2}$",
        examples=["2026-03-07"]
    )
    account_id:     str = Field(..., min_length=5, max_length=10)
    txn_type:       TxnType
    amount:         float = Field(..., gt=0, le=100_000)
    target_account: Optional[str] = Field(None, max_length=10)
    description:    str = Field(..., max_length=30)


class RejectedRecord(BaseModel):
    date:       str
    account_id: str
    txn_type:   str
    error_code: str


class ValidatorResponse(BaseModel):
    success:          bool
    total_read:       int
    approved_count:   int
    rejected_count:   int
    rejected_records: List[RejectedRecord]


class ProcessorResponse(BaseModel):
    success:              bool
    transactions_applied: int
    total_deposited:      str
    total_withdrawn:      str
    ledger_entries:       List[str]


# ── Fee Engine Schemas ──────────────────────────────────

class FeeBreakdown(BaseModel):
    maintenance: int
    low_balance: int
    overdraft:   int
    total:       str


class FeeEngineResponse(BaseModel):
    success: bool
    fees:    FeeBreakdown


# ── Interest Schemas ────────────────────────────────────

class InterestResponse(BaseModel):
    success:          bool
    accounts_credited: int
    total_interest:   str


# ── EOD Report Schemas ──────────────────────────────────

class EODReportResponse(BaseModel):
    success:      bool
    report_lines: int
    report_text:  str


# ── Batch Pipeline Schemas ──────────────────────────────

class BatchStepResult(BaseModel):
    success: bool
    stdout:  str
    error:   Optional[str] = None


class BatchResponse(BaseModel):
    success:      bool
    steps_run:    int
    steps_passed: int
    steps:        dict


# ── Health Check ────────────────────────────────────────

class HealthResponse(BaseModel):
    status:     str
    service:    str
    version:    str
    cobol_core: str


# ── Inline Loan Calculator (Python, no COBOL needed) ───

class QuickLoanResponse(BaseModel):
    """Fast in-memory loan calc — no COBOL subprocess needed."""
    principal:       float
    annual_rate_pct: float
    years:           int
    monthly_payment: float
    total_cost:      float
    total_interest:  float
    num_payments:    int
