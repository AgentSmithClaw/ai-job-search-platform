import os
import sys
import tempfile
from pathlib import Path

import pytest

TEST_DB = Path(tempfile.gettempdir()) / "test_ai_job_search.db"
os.environ["TESTING"] = "1"

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


@pytest.fixture(autouse=True)
def setup_test_db(monkeypatch):
    import app.db
    monkeypatch.setattr(app.db, "DB_PATH", TEST_DB)
    conn = app.db.get_connection()
    conn.executescript('''
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS purchases;
        DROP TABLE IF EXISTS analysis_sessions;
        DROP TABLE IF EXISTS payment_orders;
        DROP TABLE IF EXISTS job_applications;
        DROP TABLE IF EXISTS learning_tasks;
        DROP TABLE IF EXISTS interview_prep;
    ''')
    conn.executescript(app.db.BASE_SCHEMA)
    conn.close()
    yield
    try:
        os.unlink(TEST_DB)
    except OSError:
        pass


@pytest.fixture
def test_user():
    from app.services.auth import register_user
    from app.schemas import RegisterRequest
    import app.db
    # Ensure columns are added after table recreation
    app.db.get_connection().close()
    req = RegisterRequest(email="test@example.com", name="Test User")
    return register_user(req)
