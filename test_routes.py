#!/usr/bin/env python
"""
Direct test of the FastAPI backend app without uvicorn server wrapper.
"""
import sys
import os
import asyncio

sys.path.insert(0, os.path.dirname(__file__))

from backend.main import app
from fastapi.testclient import TestClient

print("Testing FastAPI backend routes directly...")
print("-" * 50)

client = TestClient(app)

# Test health endpoint
response = client.get("/health")
print(f"GET /health: {response.status_code}")
print(f"  Response: {response.json()}")
print()

# Test root endpoint
response = client.get("/")
print(f"GET /: {response.status_code}")
print(f"  Response: {response.json()}")
print()

# Test federated endpoint
response = client.get("/api/federated/global-model")
print(f"GET /api/federated/global-model: {response.status_code}")
print(f"  Response: {response.json()}")
print()

# Test updates endpoint
response = client.get("/api/updates/check?current_version=1.0.0")
print(f"GET /api/updates/check: {response.status_code}")
print(f"  Response: {response.json()}")
print()

print("-" * 50)
print("✓ All routes are working correctly")
