import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture(scope="module")
def staff_token():
    """Obtain a JWT token for the staff user."""
    response = client.post("/auth/login", json={"username": "admin", "password": "adminpass"})
    assert response.status_code == 200
    return response.json()["access_token"]

@pytest.fixture(scope="module")
def customer_token():
    """Obtain a JWT token for the customer user."""
    response = client.post("/auth/login", json={"username": "customer1", "password": "customerpass"})
    assert response.status_code == 200
    return response.json()["access_token"]

@pytest.fixture(scope="module")
def staff_headers(staff_token):
    return {"Authorization": f"Bearer {staff_token}"}

@pytest.fixture(scope="module")
def customer_headers(customer_token):
    return {"Authorization": f"Bearer {customer_token}"}

@pytest.fixture(scope="module", autouse=True)
def setup_test_data(staff_headers):
    """Create a ticket that can be searched.
    The fixture runs once per test session using staff credentials.
    """
    payload = {
        "customer_name": "TestUser",
        "contact_number": "1234567890",
        "type_id": 1,
    }
    client.post("/tickets/", json=payload, headers=staff_headers)
    yield

# ==================== AUTHENTICATION TESTS ====================

def test_login_success():
    """Valid credentials should return an access token."""
    response = client.post("/auth/login", json={"username": "admin", "password": "adminpass"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_password():
    """Invalid credentials should return 401 Unauthorized."""
    response = client.post("/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

def test_unauthenticated_request_rejected():
    """Calling protected endpoints without token should return 401 Unauthorized."""
    response = client.get("/tickets/search")
    assert response.status_code == 401

# ==================== RBAC TESTS ====================

def test_customer_can_create_ticket(customer_headers):
    """Customers should be allowed to create tickets."""
    payload = {
        "customer_name": "CustomerOrder",
        "contact_number": "9876543210",
        "type_id": 1,
    }
    response = client.post("/tickets/", json=payload, headers=customer_headers)
    assert response.status_code == 201
    assert response.json()["customer_name"] == "CustomerOrder"

def test_customer_forbidden_from_staff_endpoints(customer_headers):
    """Customers should receive 403 Forbidden when calling staff-only endpoints."""
    # Attempt search
    response_search = client.get("/tickets/search", headers=customer_headers)
    assert response_search.status_code == 403

    # Attempt list tickets
    response_list = client.get("/tickets/", headers=customer_headers)
    assert response_list.status_code == 403

    # Attempt list ticket types
    response_types = client.get("/ticket-types/", headers=customer_headers)
    assert response_types.status_code == 403

def test_staff_can_search_tickets(staff_headers):
    """Staff members should be allowed to search tickets."""
    response = client.get("/tickets/search?name=testuser", headers=staff_headers)
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, list)
    assert any(ticket["customer_name"].lower() == "testuser" for ticket in results)

def test_staff_can_list_ticket_types(staff_headers):
    """Staff members should be allowed to list ticket types."""
    response = client.get("/ticket-types/", headers=staff_headers)
    assert response.status_code == 200
    assert len(response.json()) > 0
