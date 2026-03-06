"""
routers/loans.py
─────────────────────────────────────────────────
Zentra Bank — Loans API Router

Endpoints:
  POST /loans/calculate       — Quick in-memory loan calc (Python)
  POST /loans/amortize        — Full amortization schedule (COBOL engine)
"""

import math
from fastapi import APIRouter, HTTPException
from ..models.schemas import (
    LoanCalculateRequest, QuickLoanResponse,
    LoanCalculateResponse, AmortizationRow
)

router = APIRouter(prefix="/loans", tags=["Loans"])


def _compute_loan(principal: float, annual_rate_pct: float, years: int) -> dict:
    """
    Core loan math — runs in Python for speed.
    The COBOL engine uses identical formulas; this powers
    the quick endpoint and validates COBOL output.
    """
    monthly_rate = (annual_rate_pct / 100) / 12
    n = years * 12

    if monthly_rate == 0:
        monthly_payment = principal / n
    else:
        factor = (1 + monthly_rate) ** n
        monthly_payment = principal * (monthly_rate * factor) / (factor - 1)

    total_cost = monthly_payment * n
    total_interest = total_cost - principal

    return {
        "monthly_payment":  round(monthly_payment, 2),
        "total_cost":       round(total_cost, 2),
        "total_interest":   round(total_interest, 2),
        "num_payments":     n,
        "monthly_rate":     monthly_rate,
    }


def _build_schedule(principal: float, monthly_rate: float,
                    monthly_payment: float, n: int) -> list[AmortizationRow]:
    """Build full amortization table."""
    schedule = []
    balance = principal

    for period in range(1, n + 1):
        interest_pmt = round(balance * monthly_rate, 2)
        principal_pmt = round(monthly_payment - interest_pmt, 2)
        balance = round(balance - principal_pmt, 2)
        if balance < 0:
            balance = 0.0

        schedule.append(AmortizationRow(
            period=period,
            payment=round(monthly_payment, 2),
            principal_payment=principal_pmt,
            interest_payment=interest_pmt,
            balance=balance
        ))

    return schedule


@router.post(
    "/calculate",
    response_model=QuickLoanResponse,
    summary="Quick loan calculation",
    description="Fast in-memory loan calculation using Python. Returns monthly "
                "payment, total cost, and total interest. No COBOL subprocess needed."
)
async def calculate_loan(req: LoanCalculateRequest):
    calc = _compute_loan(req.principal, req.annual_rate_pct, req.years)

    return QuickLoanResponse(
        principal=req.principal,
        annual_rate_pct=req.annual_rate_pct,
        years=req.years,
        monthly_payment=calc["monthly_payment"],
        total_cost=calc["total_cost"],
        total_interest=calc["total_interest"],
        num_payments=calc["num_payments"]
    )


@router.post(
    "/amortize",
    response_model=LoanCalculateResponse,
    summary="Full amortization schedule",
    description="Returns a complete payment-by-payment amortization schedule. "
                "Computed in Python using COBOL-equivalent formulas. "
                "For large terms (30yr = 360 rows), use ?years=5 to preview."
)
async def amortize_loan(req: LoanCalculateRequest):
    calc = _compute_loan(req.principal, req.annual_rate_pct, req.years)
    schedule = _build_schedule(
        req.principal,
        calc["monthly_rate"],
        calc["monthly_payment"],
        calc["num_payments"]
    )

    return LoanCalculateResponse(
        success=True,
        principal=req.principal,
        annual_rate_pct=req.annual_rate_pct,
        years=req.years,
        monthly_payment=calc["monthly_payment"],
        total_interest=calc["total_interest"],
        total_cost=calc["total_cost"],
        schedule=schedule
    )
