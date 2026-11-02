import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_data():
    """Create a ticket that can be searched.
    The fixture runs once per test session.
    """
    # Ensure a ticket type exists – use the first one (id=1) which should be present from init.sql
    payload = {
        "customer_name": "TestUser",
        "contact_number": "1234567890",
        "type_id": 1,
    }
    # Create the ticket – ignore errors if it already exists
    client.post("/tickets/", json=payload)
    yield
    # No teardown – DB is temporary for the container session

def test_search_no_params():
    """Calling /tickets/search without query params should succeed and return a list."""
    response = client.get("/tickets/search")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_search_by_name():
    """Search by customer_name (case‑insensitive) should return the created ticket."""
    response = client.get("/tickets/search?name=testuser")
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, list)
    # At least one result should have our name
    assert any(ticket["customer_name"].lower() == "testuser" for ticket in results)

