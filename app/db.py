from pathlib import Path
import sqlite3

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data'
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = DATA_DIR / 'ai_job_search.db'

BASE_SCHEMA = '''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    credits INTEGER NOT NULL DEFAULT 0
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
    target_role TEXT NOT NULL,
    resume_text TEXT NOT NULL,
    job_description TEXT NOT NULL,
    report_json TEXT NOT NULL,
    resume_draft TEXT NOT NULL
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
'''


def _ensure_column(conn: sqlite3.Connection, table: str, column: str, ddl: str) -> None:
    columns = {row['name'] for row in conn.execute(f'PRAGMA table_info({table})').fetchall()}
    if column not in columns:
        conn.execute(f'ALTER TABLE {table} ADD COLUMN {ddl}')


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.executescript(BASE_SCHEMA)
    _ensure_column(conn, 'analysis_sessions', 'user_id', 'user_id INTEGER')
    _ensure_column(conn, 'analysis_sessions', 'credits_used', 'credits_used INTEGER NOT NULL DEFAULT 1')
    _ensure_column(conn, 'payment_orders', 'checkout_url', 'checkout_url TEXT')
    _ensure_column(conn, 'payment_orders', 'session_id', 'session_id TEXT')
    conn.commit()
    return conn


def init_db() -> None:
    conn = get_connection()
    conn.close()