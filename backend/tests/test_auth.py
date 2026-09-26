import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_auth_full_flow(client):
    # Use unique email per test run
    unique_suffix = uuid.uuid4().hex[:8]
    email = f"manager_{unique_suffix}@business.com"
    password = "SecurePassword123!"
    full_name = "Jordan Miller"

    # 1. Registration
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "role": "manager",
        },
    )
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == email
    assert user_data["full_name"] == full_name
    assert user_data["role"] == "manager"
    assert "id" in user_data
    assert "hashed_password" not in user_data
    assert "password" not in user_data

    # 2. Duplicate Registration Rejection (409 Conflict)
    dup_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Another Name",
        },
    )
    assert dup_response.status_code == 409

    # 3. Input Validation Rejection (password too short)
    short_pwd_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": f"invalid_{unique_suffix}@business.com",
            "password": "short",
            "full_name": "Short Pass User",
        },
    )
    assert short_pwd_response.status_code == 422

    # 4. Login with Invalid Credentials
    bad_login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "WrongPassword123"},
    )
    assert bad_login.status_code == 401

    # 5. Login with Correct Credentials
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["user"]["email"] == email
    token = token_data["access_token"]

    # 6. Current User Endpoint (/auth/me) with Valid Token
    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == email
    assert me_data["id"] == user_data["id"]
    assert "hashed_password" not in me_data

    # 7. Current User Endpoint with Missing / Invalid Token
    unauth_response = client.get("/api/v1/auth/me")
    assert unauth_response.status_code == 401

    bad_token_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid_gibberish_token"},
    )
    assert bad_token_response.status_code == 401

    # 8. Logout Endpoint
    logout_response = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert logout_response.status_code == 200
    assert "message" in logout_response.json()
