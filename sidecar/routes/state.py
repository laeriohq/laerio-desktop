"""GET /state/snapshot — one-call full L'AERIO operations state.

Mirrors the MCP tool `state_snapshot` so HTTP clients (browser dashboards,
Antigravity, curl) get the same shape.
"""
from __future__ import annotations

import os
import sqlite3
from pathlib import Path

from fastapi import APIRouter

router = APIRouter(prefix="/state", tags=["state"])


def _db_path() -> Path:
    return Path(os.environ.get("LAERIO_DB_PATH", r"U:\Laerio\01-DB\laerio.db"))


def _verify_chain(conn: sqlite3.Connection) -> dict:
    import hashlib
    rows = conn.execute(
        "SELECT id, ts, actor, action, prev_hash, hash, COALESCE(extras_json,'{}') "
        "FROM audit_log ORDER BY id ASC"
    ).fetchall()
    expected_prev = ""
    for r in rows:
        rid, ts, actor, action, prev_hash, hsh, extras_json = r
        if prev_hash != expected_prev:
            return {"ok": False, "rows_seen": rid, "first_break": rid,
                    "reason": "prev_hash mismatch"}
        h = hashlib.sha256()
        h.update((expected_prev or "").encode("utf-8"))
        h.update(ts.encode("utf-8"))
        h.update(actor.encode("utf-8"))
        h.update(action.encode("utf-8"))
        h.update(extras_json.encode("utf-8"))
        if h.hexdigest() != hsh:
            return {"ok": False, "rows_seen": rid, "first_break": rid,
                    "reason": "hash mismatch"}
        expected_prev = hsh
    return {"ok": True, "rows_seen": len(rows), "first_break": None}


@router.get("/snapshot")
def snapshot() -> dict:
    """Full ops snapshot: db counts, beast last-fires, audit chain, plans, SEND_HALT."""
    out: dict = {}
    db = _db_path()
    if not db.exists():
        return {"error": "db_missing", "path": str(db)}

    conn = sqlite3.connect(db)
    try:
        out["db"] = {}
        for t in ("brands", "forms", "contacts", "chats", "skills",
                  "prompts", "creators", "interactions"):
            try:
                out["db"][t] = conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
            except sqlite3.OperationalError:
                out["db"][t] = None

        try:
            beast_rows = conn.execute(
                "SELECT component, MAX(ts) AS last_ts, level FROM health_events "
                "GROUP BY component"
            ).fetchall()
            out["beast"] = {
                r[0]: {"last_ts": r[1], "level": r[2]} for r in beast_rows
            }
        except sqlite3.OperationalError:
            out["beast"] = {}

        try:
            plans_open = conn.execute(
                "SELECT COUNT(*) FROM plans WHERE status = 'open'"
            ).fetchone()[0]
            plans_done = conn.execute(
                "SELECT COUNT(*) FROM plans WHERE status = 'done'"
            ).fetchone()[0]
            out["plans"] = {"open": plans_open, "done": plans_done}
        except sqlite3.OperationalError:
            out["plans"] = {"open": None, "done": None}

        try:
            out["audit"] = _verify_chain(conn)
        except sqlite3.OperationalError:
            out["audit"] = {"ok": None, "reason": "audit_log missing"}
    finally:
        conn.close()

    halt = Path(r"U:\Laerio\SEND_HALT.flag")
    out["send_halt"] = {"active": halt.exists()}
    out["db_path"] = str(db)
    return out
