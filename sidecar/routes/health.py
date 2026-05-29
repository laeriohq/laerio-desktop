"""Health endpoints. Always available even when laerio.db is empty."""
from __future__ import annotations

import os
import sqlite3
from pathlib import Path

from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])

COUNT_TABLES = [
    "brands", "creators", "contacts", "outreach", "threads", "replies",
    "forms", "prompts", "prompt_versions", "assets", "interactions",
    "skills", "sources", "chats",
]


def _db_path() -> Path:
    return Path(os.environ.get("LAERIO_DB_PATH", r"U:\Laerio\01-DB\laerio.db"))


@router.get("")
def health_root() -> dict:
    return {"ok": True}


@router.get("/stats")
def health_stats() -> dict:
    db = _db_path()
    if not db.exists():
        return {"counts": {}, "db_exists": False}
    counts: dict[str, int] = {}
    conn = sqlite3.connect(db)
    try:
        for t in COUNT_TABLES:
            try:
                counts[t] = conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
            except sqlite3.OperationalError:
                counts[t] = -1
    finally:
        conn.close()
    return {"counts": counts, "db_exists": True, "db_path": str(db)}
