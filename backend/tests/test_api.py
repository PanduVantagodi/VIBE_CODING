import pytest
import io
import os
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ocr_engine" in data

def test_unsupported_file_extension():
    response = client.post(
        "/api/reports/analyze",
        files={"file": ("notes.txt", b"dummy content", "text/plain")}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]

def test_empty_file_upload():
    response = client.post(
        "/api/reports/analyze",
        files={"file": ("empty.png", b"", "image/png")}
    )
    assert response.status_code == 400
    assert "completely empty" in response.json()["detail"]

def test_chat_grounding_out_of_scope():
    response = client.post(
        "/api/reports/chat",
        json={
            "question": "What is my Vitamin B12 or Ferritin level?",
            "report_context": "REPORT TITLE: CBC\nHemoglobin: 13.5 g/dL (12-16)\nGlucose: 90 mg/dL",
            "chat_history": []
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "supported_by_report" in data
    assert "disclaimer" in data

def test_telegram_status_endpoint():
    response = client.get("/api/telegram/status")
    assert response.status_code == 200
    assert "configured" in response.json()
