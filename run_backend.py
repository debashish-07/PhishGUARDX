#!/usr/bin/env python
"""
Simple test runner for the FastAPI backend using Uvicorn.
"""
import uvicorn
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    from backend.main import app
    
    print("Starting FastAPI backend server on http://127.0.0.1:8000")
    print("Available endpoints:")
    print("  GET  /health")
    print("  GET  /")
    print("  GET  /api/updates/check?current_version=1.0.0")
    print("  GET  /api/federated/global-model")
    print("  POST /api/federated/update")
    print()
    
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info",
    )
