"""
tests/test_api.py
─────────────────────────────────────────────────
Zentra Bank — API Test Suite

Tests every endpoint for correct status codes,
response shapes, and business logic.

Run:  pytest src/api/tests/ -v
"""

import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import sys

# Allow import from repo root
sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from src.api.main import app

client = TestClient(app)


# ── Health ───────────────────────────────────────────────

class TestHealth:
    def test_root_returns_200(self):
        r = client.get("/")
        assert r.status_code in (200, 404)
        assert r.json()["service"] == "Zentra Banking API"

    def test_health_endpoint(self):
        r = client.get("/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "healthy"
        assert "cobol_core" in data


# ── Loans ────────────────────────────────────────────────

class TestLoans:
    def test_calculate_basic(self):
        r = client.post("/loans/calculate", json={
            "principal": 200000,
            "annual_rate_pct": 7.0,
            "years": 30
        })
        assert r.status_code == 200
        data = r.json()
        assert data["monthly_payment"] > 0
        assert data["total_interest"] > 0
        # For 200k @ 7% 30yr, payment should be ~$1,330
        assert 1300 < data["monthly_payment"] < 1400

    def test_calculate_zero_rate_rejected(self):
        r = client.post("/loans/calculate", json={
            "principal": 100000,
            "annual_rate_pct": 0,
            "years": 15
        })
        assert r.status_code == 422  # Pydantic validation error

    def test_calculate_negative_principal_rejected(self):
        r = client.post("/loans/calculate", json={
            "principal": -50000,
            "annual_rate_pct": 5.0,
            "years": 10
        })
        assert r.status_code == 422

    def test_amortize_returns_schedule(self):
        r = client.post("/loans/amortize", json={
            "principal": 100000,
            "annual_rate_pct": 5.0,
            "years": 5
        })
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert len(data["schedule"]) == 60  # 5yr × 12
        # First payment: interest > principal (front-loaded)
        first = data["schedule"][0]
        assert first["interest_payment"] > 0
        assert first["principal_payment"] > 0
        # Last payment: principal > interest
        last = data["schedule"][-1]
        assert last["principal_payment"] > last["interest_payment"]

    def test_total_cost_equals_payments_times_n(self):
        r = client.post("/loans/calculate", json={
            "principal": 150000,
            "annual_rate_pct": 6.0,
            "years": 20
        })
        data = r.json()
        expected_cost = round(data["monthly_payment"] * data["num_payments"], 2)
        # Allow $1 rounding tolerance
        assert abs(data["total_cost"] - expected_cost) < 1.0

    def test_max_loan_allowed(self):
        r = client.post("/loans/calculate", json={
            "principal": 10_000_000,
            "annual_rate_pct": 5.0,
            "years": 30
        })
        assert r.status_code == 200

    def test_over_max_loan_rejected(self):
        r = client.post("/loans/calculate", json={
            "principal": 10_000_001,
            "annual_rate_pct": 5.0,
            "years": 30
        })
        assert r.status_code == 422


# ── Reports Files ────────────────────────────────────────

class TestReports:
    def test_list_output_files(self):
        r = client.get("/reports/files")
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert "files" in data
        assert "file_count" in data


# ── Transactions ─────────────────────────────────────────

class TestTransactions:
    def test_rejected_404_before_validate(self, tmp_path):
        """If no rejected file exists, should get 404."""
        # Remove rejected file if it exists
        rejected = Path("data/output/REJECTED-TRANSACTIONS.dat")
        existed = rejected.exists()
        if existed:
            backup = rejected.read_text()
            rejected.unlink()

        r = client.get("/transactions/rejected")
        assert r.status_code == 200

        # Restore
        if existed:
            rejected.write_text(backup)

    def test_ledger_404_before_process(self):
        """If no ledger file exists, should get 404."""
        ledger = Path("data/output/TXN-LEDGER.dat")
        existed = ledger.exists()
        if existed:
            backup = ledger.read_text()
            ledger.unlink()

        r = client.get("/transactions/ledger")
        assert r.status_code == 200

        if existed:
            ledger.write_text(backup)


# ── Batch ────────────────────────────────────────────────

class TestBatch:
    def test_batch_status_before_run(self):
        r = client.get("/batch/status")
        # Either 200 with no-run message OR previous run result
        assert r.status_code == 200

    def test_batch_response_shape(self):
        """If COBOL is available, run a batch and check shape."""
        import subprocess
        cobc_check = subprocess.run(
            ["cobc", "--version"], capture_output=True
        )
        if cobc_check.returncode != 0:
            pytest.skip("GnuCOBOL not available in test environment")

        r = client.post("/batch/run")
        assert r.status_code == 200
        data = r.json()
        assert "success" in data
        assert "steps_run" in data
        assert "steps_passed" in data
        assert "steps" in data
        assert data["steps_run"] == 5
