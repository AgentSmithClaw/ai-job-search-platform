from __future__ import annotations

import os
from pathlib import Path
import sqlite3
from typing import Any

from app.config import settings

BASE_DIR = Path(__file__).resolve().parent.parent

if os.environ.get("TESTING"):
    DATA_DIR = Path("/tmp")
    DB_PATH = DATA_DIR / "test_ai_job_search.db"
elif os.environ.get("VERCEL"):
    DATA_DIR = Path("/tmp/data")
    DB_PATH = DATA_DIR / "ai_job_search.db"
else:
    DATA_DIR = BASE_DIR / "data"
    DB_PATH = DATA_DIR / "ai_job_search.db"

DATA_DIR.mkdir(exist_ok=True, parents=True)

BASE_SCHEMA_SQLITE = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    credits INTEGER NOT NULL DEFAULT 0,
    last_used_at TEXT,
    password_hash TEXT
);

CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    package_code TEXT NOT NULL,
    package_name TEXT NOT NULL,
    credits_added INTEGER NOT NULL,
    price_cny INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS analysis_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    user_id INTEGER,
    target_role TEXT NOT NULL,
    resume_text TEXT NOT NULL,
    job_description TEXT NOT NULL,
    report_json TEXT NOT NULL,
    resume_draft TEXT NOT NULL,
    credits_used INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payment_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    refunded_at TEXT,
    user_id INTEGER NOT NULL,
    package_code TEXT NOT NULL,
    package_name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price_cny INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL DEFAULT 'mock',
    checkout_url TEXT,
    session_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS job_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    user_id INTEGER NOT NULL,
    company_name TEXT NOT NULL,
    target_role TEXT NOT NULL,
    job_description TEXT,
    status TEXT NOT NULL DEFAULT 'interested',
    application_url TEXT,
    salary_range TEXT,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS learning_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    user_id INTEGER NOT NULL,
    session_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    target_date TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS interview_prep (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    user_id INTEGER NOT NULL,
    session_id INTEGER,
    application_id INTEGER,
    question TEXT NOT NULL,
    ideal_answer TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_created ON analysis_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON payment_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON job_applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON learning_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_interview_prep_user_created ON interview_prep(user_id, created_at DESC);
"""

BASE_SCHEMA_POSTGRES = """
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    created_at TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    credits INTEGER NOT NULL DEFAULT 0,
    last_used_at TEXT,
    password_hash TEXT
);

CREATE TABLE IF NOT EXISTS purchases (
    id BIGSERIAL PRIMARY KEY,
    created_at TEXT NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    package_code TEXT NOT NULL,
    package_name TEXT NOT NULL,
    credits_added INTEGER NOT NULL,
    price_cny INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS analysis_sessions (
    id BIGSERIAL PRIMARY KEY,
    created_at TEXT NOT NULL,
    user_id BIGINT REFERENCES users(id),
    target_role TEXT NOT NULL,
    resume_text TEXT NOT NULL,
    job_description TEXT NOT NULL,
    report_json TEXT NOT NULL,
    resume_draft TEXT NOT NULL,
    credits_used INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS payment_orders (
    id BIGSERIAL PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    refunded_at TEXT,
    user_id BIGINT NOT NULL REFERENCES users(id),
    package_code TEXT NOT NULL,
    package_name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price_cny INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL DEFAULT 'mock',
    checkout_url TEXT,
    session_id TEXT
);

CREATE TABLE IF NOT EXISTS job_applications (
    id BIGSERIAL PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    user_id BIGINT NOT NULL REFERENCES users(id),
    company_name TEXT NOT NULL,
    target_role TEXT NOT NULL,
    job_description TEXT,
    status TEXT NOT NULL DEFAULT 'interested',
    application_url TEXT,
    salary_range TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS learning_tasks (
    id BIGSERIAL PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    user_id BIGINT NOT NULL REFERENCES users(id),
    session_id BIGINT,
    title TEXT NOT NULL,
    description TEXT,
    target_date TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS interview_prep (
    id BIGSERIAL PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    user_id BIGINT NOT NULL REFERENCES users(id),
    session_id BIGINT,
    application_id BIGINT,
    question TEXT NOT NULL,
    ideal_answer TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_created ON analysis_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON payment_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON job_applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON learning_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_interview_prep_user_created ON interview_prep(user_id, created_at DESC);
"""

BASE_SCHEMA = BASE_SCHEMA_SQLITE


def _database_url() -> str:
    if os.environ.get("TESTING"):
        return ""
    return settings.DATABASE_URL.strip()


def _use_postgres() -> bool:
    database_url = _database_url().lower()
    return database_url.startswith("postgres://") or database_url.startswith("postgresql://")


class PostgresCursorProxy:
    def __init__(self, cursor, lastrowid: int | None = None):
        self._cursor = cursor
        self.lastrowid = lastrowid

    def fetchone(self):
        row = self._cursor.fetchone()
        if row is None:
            return None
        return dict(row)

    def fetchall(self):
        return [dict(row) for row in self._cursor.fetchall()]


class PostgresConnectionProxy:
    def __init__(self, connection):
        self._connection = connection

    def execute(self, sql: str, params: tuple | list | None = None):
        from psycopg.rows import dict_row

        translated_sql = sql.replace("?", "%s")
        cursor = self._connection.cursor(row_factory=dict_row)
        query = translated_sql.strip().lower()
        lastrowid = None

        if query.startswith("insert into") and " returning " not in query:
            cursor.execute(f"{translated_sql} RETURNING id", params or ())
            row = cursor.fetchone()
            lastrowid = row["id"] if row else None
        else:
            cursor.execute(translated_sql, params or ())

        return PostgresCursorProxy(cursor, lastrowid=lastrowid)

    def commit(self) -> None:
        self._connection.commit()

    def close(self) -> None:
        self._connection.close()

    def executescript(self, script: str) -> None:
        for statement in script.split(";"):
            normalized = statement.strip()
            if normalized:
                self.execute(normalized)


def _ensure_column_sqlite(conn: sqlite3.Connection, table: str, column: str, ddl: str) -> None:
    columns = {row["name"] for row in conn.execute(f"PRAGMA table_info({table})").fetchall()}
    if column not in columns:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")


def _ensure_column_postgres(conn: PostgresConnectionProxy, table: str, column: str, ddl: str) -> None:
    conn.execute(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {ddl}")


def _get_sqlite_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(BASE_SCHEMA_SQLITE)
    _ensure_column_sqlite(conn, "analysis_sessions", "user_id", "user_id INTEGER")
    _ensure_column_sqlite(conn, "analysis_sessions", "credits_used", "credits_used INTEGER NOT NULL DEFAULT 1")
    _ensure_column_sqlite(conn, "payment_orders", "checkout_url", "checkout_url TEXT")
    _ensure_column_sqlite(conn, "payment_orders", "session_id", "session_id TEXT")
    _ensure_column_sqlite(conn, "users", "last_used_at", "last_used_at TEXT")
    conn.commit()
    return conn


def _get_postgres_connection() -> PostgresConnectionProxy:
    try:
        import psycopg
    except ImportError as exc:
        raise RuntimeError("PostgreSQL support requires psycopg. Install dependencies again.") from exc

    connection = psycopg.connect(_database_url(), autocommit=False)
    conn = PostgresConnectionProxy(connection)
    conn.executescript(BASE_SCHEMA_POSTGRES)
    _ensure_column_postgres(conn, "analysis_sessions", "user_id", "user_id BIGINT")
    _ensure_column_postgres(conn, "analysis_sessions", "credits_used", "credits_used INTEGER NOT NULL DEFAULT 1")
    _ensure_column_postgres(conn, "payment_orders", "checkout_url", "checkout_url TEXT")
    _ensure_column_postgres(conn, "payment_orders", "session_id", "session_id TEXT")
    _ensure_column_postgres(conn, "users", "last_used_at", "last_used_at TEXT")
    _ensure_column_postgres(conn, "users", "password_hash", "password_hash TEXT")
    conn.commit()
    return conn


def get_connection() -> Any:
    if _use_postgres():
        return _get_postgres_connection()
    return _get_sqlite_connection()


def init_db() -> None:
    conn = get_connection()
    conn.close()
