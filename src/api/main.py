"""
Zentra Bank — FastAPI REST Bridge Layer.

Exposes COBOL-processed banking data as JSON APIs.
Run: uvicorn src.api.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import accounts, transactions, batch

app = FastAPI(
    title="Zentra Banking API",
    description="REST bridge to COBOL banking engine — accounts, transactions, batch processing",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(batch.router)


@app.get("/", tags=["Root"])
def root():
    """API info and available endpoints."""
    return {
        "name": "Zentra Banking API",
        "version": "1.0.0",
        "endpoints": {
            "GET /accounts": "List all accounts",
            "GET /accounts/{id}": "Get account by ID",
            "GET /transactions": "List input transactions",
            "GET /transactions/approved": "Approved transactions",
            "GET /transactions/rejected": "Rejected transactions",
            "GET /transactions/fees": "Fee transactions",
            "GET /transactions/interest": "Interest transactions",
            "GET /rates": "Interest rates",
            "GET /reports/eod": "End-of-day report",
            "POST /batch/run": "Run daily batch cycle",
        },
    }
