def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_scenarios(client):
    response = client.get("/api/scenarios")
    assert response.status_code == 200

    data = response.json()
    assert len(data) >= 1
    assert data[0]["id"] == "scenario-01"
    assert "nodes" not in data[0]


def test_get_scenario(client):
    response = client.get("/api/scenarios/scenario-01")
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == "scenario-01"
    assert data["startNode"] == "node_01"
    assert "node_01" in data["nodes"]
    assert "endings" in data


def test_choice_rank_is_returned(client):
    response = client.get("/api/scenarios/scenario-01")
    assert response.status_code == 200

    choices = response.json()["nodes"]["node_01"]["choices"]
    ranks = {choice["effect"]["rank"] for choice in choices}
    assert ranks == {"recommended", "bad", "neutral"}


def test_unknown_scenario(client):
    response = client.get("/api/scenarios/not-found")
    assert response.status_code == 404
