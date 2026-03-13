"""
Zentra Banking Platform — SQLite Auth Layer
File: src/api/database.py

Zero external infrastructure. Single .db file. Works in Docker.
Upgrade path: swap sqlite3 → asyncpg + PostgreSQL with no router changes.
"""

import sqlite3
import hashlib
import secrets
import os
from datetime import datetime, timedelta
from pathlib import Path
from contextlib import contextmanager

DB_PATH = Path(os.getenv("ZENTRA_DB_PATH", "data/zentra_portal.db"))
SESSION_TTL_HOURS = 24


# ─────────────────────────────────────────────────────────────────────────────
# CONNECTION
# ─────────────────────────────────────────────────────────────────────────────

@contextmanager
def get_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row       # dict-like rows
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ─────────────────────────────────────────────────────────────────────────────
# SCHEMA INIT
# ─────────────────────────────────────────────────────────────────────────────

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT    UNIQUE NOT NULL,
    name          TEXT    NOT NULL,
    password_hash TEXT    NOT NULL,
    phone         TEXT    DEFAULT '',
    language      TEXT    DEFAULT 'en',
    account_tier  TEXT    DEFAULT 'demo',
    notif_low_bal INTEGER DEFAULT 1,
    notif_txn     INTEGER DEFAULT 1,
    notif_batch   INTEGER DEFAULT 1,
    created_at    TEXT    DEFAULT (datetime('now')),
    updated_at    TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS account_ownership (
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id TEXT    NOT NULL,
    PRIMARY KEY (user_id, account_id)
);

CREATE TABLE IF NOT EXISTS portal_sessions (
    token      TEXT    PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT    NOT NULL,
    created_at TEXT    DEFAULT (datetime('now'))
);
"""

def init_db():
    """Create tables if they don't exist. Safe to call on every startup."""
    with get_db() as conn:
        conn.executescript(SCHEMA)
        # Migrate: add account_tier column if missing (existing DBs)
        cols = [r[1] for r in conn.execute("PRAGMA table_info(users)").fetchall()]
        if "account_tier" not in cols:
            conn.execute("ALTER TABLE users ADD COLUMN account_tier TEXT DEFAULT 'demo'")
    print(f"[Zentra DB] Initialized at {DB_PATH}")


# ─────────────────────────────────────────────────────────────────────────────
# PASSWORD HASHING
# ─────────────────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    h    = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return f"{salt}:{h}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, h = stored_hash.split(":", 1)
        return hashlib.sha256(f"{salt}{password}".encode()).hexdigest() == h
    except Exception:
        return False


# ─────────────────────────────────────────────────────────────────────────────
# USER OPERATIONS
# ─────────────────────────────────────────────────────────────────────────────

def create_user(email: str, name: str, password: str, account_tier: str = "demo") -> dict:
    with get_db() as conn:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            raise ValueError("Email already registered")
        pw_hash = hash_password(password)
        cur = conn.execute(
            "INSERT INTO users (email, name, password_hash, account_tier) VALUES (?, ?, ?, ?)",
            (email.lower().strip(), name.strip(), pw_hash, account_tier)
        )
        return {"id": cur.lastrowid, "email": email, "name": name, "account_tier": account_tier}


def authenticate_user(email: str, password: str) -> dict | None:
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ?", (email.lower().strip(),)
        ).fetchone()
        if not row or not verify_password(password, row["password_hash"]):
            return None
        return dict(row)


def get_user_by_id(user_id: int) -> dict | None:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None


def update_user(user_id: int, fields: dict) -> dict:
    allowed = {"name", "phone", "language", "notif_low_bal", "notif_txn", "notif_batch"}
    updates = {k: v for k, v in fields.items() if k in allowed}
    if not updates:
        raise ValueError("No valid fields to update")
    updates["updated_at"] = datetime.utcnow().isoformat()
    set_clause = ", ".join(f"{k} = ?" for k in updates)
    values     = list(updates.values()) + [user_id]
    with get_db() as conn:
        conn.execute(f"UPDATE users SET {set_clause} WHERE id = ?", values)
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row)


def update_password(user_id: int, old_password: str, new_password: str) -> bool:
    user = get_user_by_id(user_id)
    if not user or not verify_password(old_password, user["password_hash"]):
        return False
    new_hash = hash_password(new_password)
    with get_db() as conn:
        conn.execute(
            "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
            (new_hash, datetime.utcnow().isoformat(), user_id)
        )
    return True


# ─────────────────────────────────────────────────────────────────────────────
# SESSION OPERATIONS
# ─────────────────────────────────────────────────────────────────────────────

def create_session(user_id: int) -> str:
    token      = secrets.token_urlsafe(32)
    expires_at = (datetime.utcnow() + timedelta(hours=SESSION_TTL_HOURS)).isoformat()
    with get_db() as conn:
        # Clean expired sessions for this user first
        conn.execute(
            "DELETE FROM portal_sessions WHERE user_id = ? AND expires_at < ?",
            (user_id, datetime.utcnow().isoformat())
        )
        conn.execute(
            "INSERT INTO portal_sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
            (token, user_id, expires_at)
        )
    return token


def validate_session(token: str) -> dict | None:
    """Returns user dict if session is valid, None if expired or not found."""
    with get_db() as conn:
        row = conn.execute(
            """SELECT u.* FROM portal_sessions s
               JOIN users u ON u.id = s.user_id
               WHERE s.token = ? AND s.expires_at > ?""",
            (token, datetime.utcnow().isoformat())
        ).fetchone()
        return dict(row) if row else None


def delete_session(token: str) -> None:
    with get_db() as conn:
        conn.execute("DELETE FROM portal_sessions WHERE token = ?", (token,))


# ─────────────────────────────────────────────────────────────────────────────
# ACCOUNT OWNERSHIP
# ─────────────────────────────────────────────────────────────────────────────

def link_account(user_id: int, account_id: str) -> None:
    with get_db() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO account_ownership (user_id, account_id) VALUES (?, ?)",
            (user_id, account_id)
        )


def get_user_account_ids(user_id: int) -> list[str]:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT account_id FROM account_ownership WHERE user_id = ?", (user_id,)
        ).fetchall()
        return [r["account_id"] for r in rows]


def unlink_account(user_id: int, account_id: str) -> None:
    with get_db() as conn:
        conn.execute(
            "DELETE FROM account_ownership WHERE user_id = ? AND account_id = ?",
            (user_id, account_id)
        )


def delete_user_completely(user_id: int) -> list[str]:
    """Delete a demo user and all their data. Returns list of owned account IDs."""
    with get_db() as conn:
        # Get owned account IDs before deletion
        rows = conn.execute(
            "SELECT account_id FROM account_ownership WHERE user_id = ?", (user_id,)
        ).fetchall()
        owned_ids = [r["account_id"] for r in rows]
        # Delete sessions, ownership, and user (CASCADE handles most, but be explicit)
        conn.execute("DELETE FROM portal_sessions WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM account_ownership WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    return owned_ids
