from unittest.mock import patch


def test_research_find_returns_payload(client):
    fake_hits = [{"brand_id": "kosas", "name": "Kosas", "tier": 2, "fit_score": 80,
                  "niche_group": "beauty", "country": "US", "distance": 0.3}]
    with patch("p5_rag.tools.find_brands", return_value=fake_hits):
        r = client.post("/research/find", json={"intent": "clean beauty creator program", "top_k": 10})
    assert r.status_code == 200
    payload = r.json()
    assert payload["hits"][0]["brand_id"] == "kosas"


def test_research_pitch_returns_angles(client):
    with patch("p5_rag.tools.propose_pitch_angles", return_value=["angle 1", "angle 2"]):
        r = client.post("/research/pitch", json={"brand_id": "kosas", "k": 2})
    assert r.status_code == 200
    assert r.json()["angles"] == ["angle 1", "angle 2"]
