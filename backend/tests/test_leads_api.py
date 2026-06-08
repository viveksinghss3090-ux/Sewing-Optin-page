"""Backend API tests for the Sewing Roadmap Lead Capture service."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://dress-roadmap-optin.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# Health endpoint
class TestHealth:
    def test_health_ok_and_resend_configured(self, client):
        r = client.get(f"{API}/health", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"
        assert data.get("resend_configured") is True


# Lead capture endpoint
class TestLeads:
    def test_create_lead_success(self, client):
        payload = {
            "name": "QA Tester",
            "email": "qa@example.com",
            "phone": "+15551234567",
        }
        r = client.post(f"{API}/leads", json=payload, timeout=30)
        assert r.status_code == 200, f"Got {r.status_code}: {r.text}"
        data = r.json()
        assert data.get("status") == "success"
        assert data.get("redirect_url") == "https://www.digistore24.com/redir/561361/kazi200/"
        assert isinstance(data.get("email_id"), str) and len(data["email_id"]) > 0

    def test_create_lead_invalid_email(self, client):
        payload = {"name": "Bad Email", "email": "not-an-email", "phone": "+15551234567"}
        r = client.post(f"{API}/leads", json=payload, timeout=15)
        assert r.status_code == 422

    def test_create_lead_missing_name(self, client):
        payload = {"email": "qa2@example.com", "phone": "+15551234567"}
        r = client.post(f"{API}/leads", json=payload, timeout=15)
        assert r.status_code == 422

    def test_create_lead_missing_email(self, client):
        payload = {"name": "Missing Email", "phone": "+15551234567"}
        r = client.post(f"{API}/leads", json=payload, timeout=15)
        assert r.status_code == 422

    def test_create_lead_missing_phone(self, client):
        payload = {"name": "Missing Phone", "email": "qa3@example.com"}
        r = client.post(f"{API}/leads", json=payload, timeout=15)
        assert r.status_code == 422

    def test_create_lead_empty_name(self, client):
        payload = {"name": "", "email": "qa4@example.com", "phone": "+15551234567"}
        r = client.post(f"{API}/leads", json=payload, timeout=15)
        assert r.status_code == 422
