"""
Zentra Bank — Pydantic response models for the REST API.
"""

from pydantic import BaseModel, computed_field


STATUS_LABELS = {"A": "Active", "F": "Frozen", "C": "Closed"}
TXN_TYPE_LABELS = {
    "DEP": "Deposit",
    "WDR": "Withdrawal",
    "XFR": "Transfer",
    "FEE": "Fee",
    "INT": "Interest",
}
TXN_STATUS_LABELS = {"PND": "Pending", "APR": "Approved", "REJ": "Rejected"}


class Account(BaseModel):
    account_id: str
    name: str
    account_type: str
    balance: float
    overdraft_limit: float
    status: str
    open_date: str
    last_txn_date: str

    @computed_field
    @property
    def status_label(self) -> str:
        return STATUS_LABELS.get(self.status, "Unknown")


class Transaction(BaseModel):
    date: str
    account_id: str
    txn_type: str
    amount: float
    target_account: str
    description: str
    status: str
    error_code: str

    @computed_field
    @property
    def txn_type_label(self) -> str:
        return TXN_TYPE_LABELS.get(self.txn_type, self.txn_type)

    @computed_field
    @property
    def status_label(self) -> str:
        return TXN_STATUS_LABELS.get(self.status, self.status)


class InterestRate(BaseModel):
    account_type: str
    annual_rate: float
    daily_rate: float


class BatchResult(BaseModel):
    success: bool
    output: str
    timestamp: str
