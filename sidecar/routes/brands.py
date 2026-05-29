"""Read-only brand views for the desktop."""
from __future__ import annotations

import sqlite3
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from routes.health import _db_path  # type: ignore

router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("/search")
def brands_search(
    q: Optional[str] = Query(default=None, description="case-insensitive name LIKE filter"),
    tier_max: Optional[int] = Query(default=None, ge=1, le=4),
    niche: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict:
    conn = sqlite3.connect(_db_path())
    conn.row_factory = sqlite3.Row
    try:
        clauses: list[str] = []
        params: list = []
        if q:
            clauses.append("(lower(name) LIKE ? OR lower(id) LIKE ?)")
            wild = f"%{q.lower()}%"
            params.extend([wild, wild])
        if tier_max is not None:
            clauses.append("tier <= ?")
            params.append(tier_max)
        if niche:
            clauses.append("lower(niche_group) = ?")
            params.append(niche.lower())
        where = (" WHERE " + " AND ".join(clauses)) if clauses else ""
        sql = (
            f"SELECT id, name, niche_group, sub_niche, country, tier, fit_score, status "
            f"FROM brands{where} ORDER BY (fit_score IS NULL), fit_score DESC LIMIT ? OFFSET ?"
        )
        rows = conn.execute(sql, params + [limit, offset]).fetchall()
        return {"rows": [dict(r) for r in rows], "count": len(rows)}
    finally:
        conn.close()


@router.get("/{brand_id}")
def brand_by_id(brand_id: str) -> dict:
    conn = sqlite3.connect(_db_path())
    conn.row_factory = sqlite3.Row
    try:
        row = conn.execute(
            "SELECT * FROM brands WHERE id = ?", (brand_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"brand {brand_id!r} not found")
        return dict(row)
    finally:
        conn.close()
