import sqlite3
from pathlib import Path


def _seed(db_path: Path):
    conn = sqlite3.connect(db_path)
    conn.executemany(
        "INSERT INTO brands (id, name, niche_group, tier, fit_score, country) VALUES (?,?,?,?,?,?)",
        [
            ("kosas", "Kosas", "beauty", 2, 80, "US"),
            ("rare-beauty", "Rare Beauty", "beauty", 3, 60, "US"),
            ("nike", "Nike", "athletic", 4, 20, "US"),
        ],
    )
    conn.commit()
    conn.close()


def test_brands_search_by_name_substring(client, empty_db):
    _seed(empty_db)
    r = client.get("/brands/search", params={"q": "kos"})
    assert r.status_code == 200
    rows = r.json()["rows"]
    assert any(b["id"] == "kosas" for b in rows)


def test_brands_search_limit_and_tier_filter(client, empty_db):
    _seed(empty_db)
    r = client.get("/brands/search", params={"tier_max": 3, "limit": 10})
    rows = r.json()["rows"]
    assert all(b["tier"] is None or b["tier"] <= 3 for b in rows)
    assert len(rows) <= 10


def test_brand_by_id_returns_404_for_missing(client, empty_db):
    r = client.get("/brands/ghost")
    assert r.status_code == 404


def test_brand_by_id_returns_row(client, empty_db):
    _seed(empty_db)
    r = client.get("/brands/kosas")
    assert r.status_code == 200
    assert r.json()["id"] == "kosas"
