"""
Zentra Banking Platform — Auth & User Router
File: src/api/routers/auth.py

Register in main.py:
    from .routers import auth
    app.include_router(auth.router)

All protected endpoints read the Authorization header:
    Authorization: Bearer <session_token>
"""

from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Optional
import os
import io
import csv
from datetime import date
from pathlib import Path

from ..database import (
    init_db, create_user, authenticate_user, get_user_by_id,
    update_user, update_password, create_session, validate_session,
    delete_session, link_account, get_user_account_ids, unlink_account,
    delete_user_completely
)
from ..services import cobol

# Access codes from environment (never committed to source)
MASTER_CODE = os.getenv("MASTER_ACCESS_CODE", "11A2B")
DEMO_CODE   = os.getenv("DEMO_ACCESS_CODE", "0369AV")

router = APIRouter(prefix="/auth", tags=["Auth"])


# ─────────────────────────────────────────────────────────────────────────────
# AUTH DEPENDENCY
# ─────────────────────────────────────────────────────────────────────────────

def current_user(authorization: str = Header(...)) -> dict:
    """FastAPI dependency — validates Bearer token, returns user dict."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ", 1)[1]
    user = validate_session(token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please sign in again.")
    return user


# ─────────────────────────────────────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email:       str = Field(..., examples=["marck@zentra.bank"])
    name:        str = Field(..., min_length=2, max_length=25)
    password:    str = Field(..., min_length=8)
    language:    str = Field("en", pattern=r"^(en|fr)$")
    access_code: str = Field(..., min_length=4, max_length=10)


class LoginRequest(BaseModel):
    email:    str
    password: str


class UpdateProfileRequest(BaseModel):
    name:     Optional[str] = Field(None, max_length=25)
    phone:    Optional[str] = Field(None, max_length=20)
    language: Optional[str] = Field(None, pattern=r"^(en|fr)$")


class UpdatePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)


class NotificationPrefsRequest(BaseModel):
    notif_low_bal: Optional[bool] = None
    notif_txn:     Optional[bool] = None
    notif_batch:   Optional[bool] = None


class LinkAccountRequest(BaseModel):
    account_id: str = Field(..., examples=["ZNT-001042"])


# ─────────────────────────────────────────────────────────────────────────────
# REGISTER
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/register")
def register(req: RegisterRequest):
    """
    Create a new portal user. Requires a valid access code.
    Does NOT auto-create a bank account — user opens accounts separately.
    """
    # Validate access code → determine tier
    if req.access_code == MASTER_CODE:
        tier = "master"
    elif req.access_code == DEMO_CODE:
        tier = "demo"
    else:
        raise HTTPException(status_code=403, detail="Invalid access code")

    try:
        user = create_user(req.email, req.name, req.password, account_tier=tier)
        token = create_session(user["id"])
        update_user(user["id"], {"language": req.language})
        return {
            "success": True,
            "token": token,
            "user": {
                "id":           user["id"],
                "email":        req.email,
                "name":         req.name,
                "language":     req.language,
                "account_tier": tier,
            },
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# LOGIN / LOGOUT
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/login")
def login(req: LoginRequest):
    user = authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_session(user["id"])
    account_ids = get_user_account_ids(user["id"])
    return {
        "success": True,
        "token": token,
        "user": {
            "id":            user["id"],
            "email":         user["email"],
            "name":          user["name"],
            "language":      user["language"],
            "account_tier":  user.get("account_tier", "demo"),
            "notif_low_bal": bool(user["notif_low_bal"]),
            "notif_txn":     bool(user["notif_txn"]),
            "notif_batch":   bool(user["notif_batch"]),
        },
        "account_ids": account_ids,
    }


@router.post("/logout")
def logout(authorization: str = Header(...)):
    if authorization.startswith("Bearer "):
        delete_session(authorization.split(" ", 1)[1])
    return {"success": True}


# ─────────────────────────────────────────────────────────────────────────────
# PROFILE — GET / UPDATE
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/me")
def get_me(user: dict = Depends(current_user)):
    account_ids = get_user_account_ids(user["id"])
    return {
        "id":            user["id"],
        "email":         user["email"],
        "name":          user["name"],
        "phone":         user.get("phone", ""),
        "language":      user.get("language", "en"),
        "account_tier":  user.get("account_tier", "demo"),
        "notif_low_bal": bool(user.get("notif_low_bal", 1)),
        "notif_txn":     bool(user.get("notif_txn", 1)),
        "notif_batch":   bool(user.get("notif_batch", 1)),
        "created_at":    user.get("created_at"),
        "account_ids":   account_ids,
    }


@router.patch("/me")
def update_me(req: UpdateProfileRequest, user: dict = Depends(current_user)):
    updates = req.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update")
    updated = update_user(user["id"], updates)
    return {
        "success":  True,
        "name":     updated["name"],
        "phone":    updated.get("phone", ""),
        "language": updated.get("language", "en"),
    }


# ─────────────────────────────────────────────────────────────────────────────
# PASSWORD CHANGE
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/change-password")
def change_password(req: UpdatePasswordRequest, user: dict = Depends(current_user)):
    if req.old_password == req.new_password:
        raise HTTPException(status_code=400, detail="New password must differ from current password")
    success = update_password(user["id"], req.old_password, req.new_password)
    if not success:
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    return {"success": True, "message": "Password updated successfully"}


# ─────────────────────────────────────────────────────────────────────────────
# NOTIFICATION PREFERENCES
# ─────────────────────────────────────────────────────────────────────────────

@router.patch("/notifications")
def update_notifications(req: NotificationPrefsRequest, user: dict = Depends(current_user)):
    updates = {}
    if req.notif_low_bal is not None:
        updates["notif_low_bal"] = int(req.notif_low_bal)
    if req.notif_txn is not None:
        updates["notif_txn"] = int(req.notif_txn)
    if req.notif_batch is not None:
        updates["notif_batch"] = int(req.notif_batch)
    if not updates:
        raise HTTPException(status_code=400, detail="No preferences provided")
    update_user(user["id"], updates)
    return {"success": True, "preferences": updates}


# ─────────────────────────────────────────────────────────────────────────────
# ACCOUNT OWNERSHIP
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/accounts/link")
def link_user_account(req: LinkAccountRequest, user: dict = Depends(current_user)):
    """Link an existing bank account to this portal user."""
    master_file = cobol.DATA_INPUT / "ACCOUNTS-MASTER.dat"
    if not master_file.exists():
        raise HTTPException(status_code=503, detail="Accounts data unavailable")
    found = any(
        line[0:10].strip() == req.account_id
        for line in master_file.read_text().splitlines()
        if len(line) >= 10
    )
    if not found:
        raise HTTPException(status_code=404, detail=f"Account {req.account_id} not found")
    link_account(user["id"], req.account_id)
    return {"success": True, "linked_account": req.account_id}


@router.delete("/accounts/{account_id}/unlink")
def unlink_user_account(account_id: str, user: dict = Depends(current_user)):
    unlink_account(user["id"], account_id)
    return {"success": True, "unlinked_account": account_id}


# ─────────────────────────────────────────────────────────────────────────────
# STATEMENT DOWNLOAD — CSV export of user's transactions
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/statement")
def download_statement(
    account_id: str | None = None,
    user: dict = Depends(current_user)
):
    """
    Generate a CSV statement of all transactions for this user's accounts.
    Filters to only accounts owned by the authenticated user.
    """
    owned_ids = get_user_account_ids(user["id"])
    if not owned_ids:
        raise HTTPException(status_code=404, detail="No accounts linked to this user")

    if account_id and account_id not in owned_ids:
        raise HTTPException(status_code=403, detail="Account not linked to your profile")

    target_ids = [account_id] if account_id else owned_ids

    records = []
    txn_file = cobol.DATA_INPUT / "DAILY-TRANSACTIONS.dat"
    if txn_file.exists():
        for line in txn_file.read_text().splitlines():
            if len(line) < 80:
                continue
            acct = line[10:20].strip()
            if acct not in target_ids:
                continue
            try:
                amount = int(line[23:34]) / 100.0
            except ValueError:
                amount = 0.0
            records.append({
                "Date":        line[0:10].strip(),
                "Account":     acct,
                "Type":        line[20:23].strip(),
                "Amount":      f"${amount:,.2f}",
                "Description": line[44:74].strip(),
                "Status":      line[74:77].strip(),
            })

    records.sort(key=lambda r: r["Date"], reverse=True)

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["Date", "Account", "Type", "Amount", "Description", "Status"])
    writer.writeheader()
    writer.writerows(records)

    filename = f"zentra_statement_{date.today().isoformat()}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ─────────────────────────────────────────────────────────────────────────────
# DEMO ACCOUNT CLEANUP
# ─────────────────────────────────────────────────────────────────────────────

@router.delete("/account")
def delete_demo_account(user: dict = Depends(current_user)):
    """Delete a demo account and all its data (accounts, transactions, user)."""
    if user.get("account_tier", "demo") != "demo":
        raise HTTPException(status_code=403, detail="Only demo accounts can be self-deleted")

    # Delete user from SQLite, get list of owned account IDs
    owned_ids = delete_user_completely(user["id"])

    # Remove demo accounts from ACCOUNTS-MASTER.dat
    accounts_file = cobol.DATA_INPUT / "ACCOUNTS-MASTER.dat"
    if accounts_file.exists() and owned_ids:
        lines = accounts_file.read_text().splitlines()
        cleaned = [l for l in lines if len(l) >= 10 and l[0:10].strip() not in owned_ids]
        accounts_file.write_text("\n".join(cleaned) + ("\n" if cleaned else ""))

    # Remove demo transactions from DAILY-TRANSACTIONS.dat
    txn_file = cobol.DATA_INPUT / "DAILY-TRANSACTIONS.dat"
    if txn_file.exists() and owned_ids:
        lines = txn_file.read_text().splitlines()
        cleaned = [l for l in lines if len(l) >= 20 and l[10:20].strip() not in owned_ids]
        txn_file.write_text("\n".join(cleaned) + ("\n" if cleaned else ""))

    return {"success": True, "deleted": True, "accounts_removed": owned_ids}


# ─────────────────────────────────────────────────────────────────────────────
# STARTUP HOOK — call from main.py
# ─────────────────────────────────────────────────────────────────────────────

def startup():
    """Call in main.py: @app.on_event('startup') → startup()"""
    init_db()
