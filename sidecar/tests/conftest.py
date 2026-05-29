"""Shared fixtures. Reuses Phase 1 schema for in-memory laerio.db."""
import sys
from pathlib import Path

import pytest

_P1 = Path(r"U:\Laerio\_scripts").resolve()
if str(_P1) not in sys.path:
    sys.path.insert(0, str(_P1))

from p1_db import schema  # noqa: E402


@pytest.fixture
def empty_db(tmp_path: Path) -> Path:
    db_path = tmp_path / "laerio.db"
    schema.init_db(db_path)
    return db_path


@pytest.fixture
def client(empty_db: Path, monkeypatch):
    """FastAPI TestClient with the sidecar wired to an in-memory db."""
    monkeypatch.setenv("LAERIO_DB_PATH", str(empty_db))
    from fastapi.testclient import TestClient
    from main import build_app
    app = build_app()
    return TestClient(app)
