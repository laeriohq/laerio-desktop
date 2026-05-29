def test_health_root_returns_200(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"ok": True}


def test_health_stats_returns_row_counts(client, empty_db):
    import sqlite3
    conn = sqlite3.connect(empty_db)
    conn.execute("INSERT INTO brands (id, name) VALUES ('kosas', 'Kosas')")
    conn.execute("INSERT INTO brands (id, name) VALUES ('nike', 'Nike')")
    conn.commit()
    conn.close()

    r = client.get("/health/stats")
    assert r.status_code == 200
    data = r.json()
    assert data["counts"]["brands"] == 2
    assert "contacts" in data["counts"]
    assert "forms" in data["counts"]
