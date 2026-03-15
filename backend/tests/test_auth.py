import pytest
from fastapi.testclient import TestClient
from app.models.usuario import Usuario
from app.core.security import hashear_password
from datetime import date

def test_register_user(client: TestClient):
    response = client.post(
        "/auth/register",
        json={
            "nombre": "Test",
            "apellidos": "User",
            "email": "test@example.com",
            "contrasena": "string123",
            "fecha_nacimiento": "1990-01-01",
            "turnstile_token": "ignore"
        }
    )
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_login_sets_cookies(client: TestClient, db_session):
    # Create user
    user = Usuario(
        nombre="Login",
        apellidos="Test",
        email="login@example.com",
        contrasena=hashear_password("password123"),
        fecha_nacimiento=date(1990, 1, 1),
        email_verificado=True
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/auth/login",
        data={"username": "login@example.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    assert response.status_code == 200
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies

def test_protected_route_access(client: TestClient, db_session):
    # Create user
    user = Usuario(
        id_usuario=999,
        nombre="Auth",
        apellidos="Check",
        email="auth@example.com",
        contrasena=hashear_password("password123"),
        fecha_nacimiento=date(1990, 1, 1),
        email_verificado=True
    )
    db_session.add(user)
    db_session.commit()

    # Login to get cookies
    login_res = client.post(
        "/auth/login",
        data={"username": "auth@example.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    # Access protected route
    response = client.get("/auth/me", cookies=login_res.cookies)
    assert response.status_code == 200
    assert response.json()["email"] == "auth@example.com"
