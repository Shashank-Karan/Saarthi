#!/usr/bin/env python3
"""
Main entry point for Saarthi Python FastAPI backend
"""
import sys
import os
from pathlib import Path

# Add backend directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

# Import and run the FastAPI app
from backend.main import app
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)