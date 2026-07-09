"""
EVGuard Backend — Core Configuration
=====================================
Load settings from environment variables using pydantic-settings.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Paths ─────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = os.getenv("MODEL_PATH", str(BASE_DIR / "models" / "lgbm_pipeline.joblib"))
METADATA_PATH = os.getenv("METADATA_PATH", str(BASE_DIR / "models" / "model_metadata.json"))

# ── Server ────────────────────────────────────────────────────
ENV = os.getenv("ENV", "development")
PORT = int(os.getenv("PORT", 8000))
DEBUG = ENV == "development"

# ── CORS ──────────────────────────────────────────────────────
_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
ALLOWED_ORIGINS = [origin.strip() for origin in _origins_env.split(",") if origin.strip()]

# ── Logging ───────────────────────────────────────────────────
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
