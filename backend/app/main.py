"""
EVGuard — FastAPI Application
==============================
Main application entry point with lifespan management.

The model is loaded ONCE at startup and shared across all requests
via app.state. No model reloading on individual requests.
"""

import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import (
    ALLOWED_ORIGINS, ENV, MODEL_PATH, METADATA_PATH, LOG_LEVEL,
)
from app.services.prediction_service import PredictionService
from app.routes import predict, health, model_info

# ── Logging Setup ─────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("evguard")


# ── Lifespan (startup/shutdown) ───────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the ML model once at startup, clean up at shutdown."""
    logger.info("=" * 60)
    logger.info("EVGuard API — Starting up...")
    logger.info(f"Environment: {ENV}")

    # Load model
    service = PredictionService(
        model_path=MODEL_PATH,
        metadata_path=METADATA_PATH,
    )
    service.load_model()

    # Store on app state for request access
    app.state.prediction_service = service
    app.state.start_time = time.time()

    logger.info("=" * 60)
    logger.info("EVGuard API ready to serve predictions!")
    logger.info("=" * 60)

    yield  # App runs here

    # Shutdown
    logger.info("EVGuard API shutting down...")


# ── FastAPI Application ───────────────────────────────────
app = FastAPI(
    title="EVGuard API",
    description="Electric Vehicle Predictive Maintenance API powered by LightGBM",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if ENV == "development" else None,
    redoc_url="/redoc" if ENV == "development" else None,
)


# ── CORS Middleware ───────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request Logging Middleware ────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every incoming request and its response time."""
    start = time.time()
    response = await call_next(request)
    duration = (time.time() - start) * 1000

    logger.info(
        f"{request.method} {request.url.path} "
        f"-> {response.status_code} ({duration:.1f}ms)"
    )
    return response


# ── Global Exception Handler ─────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all for unhandled exceptions — never expose stack traces in production."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error" if ENV == "production" else str(exc)
        },
    )


# ── Register Routers ─────────────────────────────────────
app.include_router(predict.router, prefix="/api/v1", tags=["Prediction"])
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(model_info.router, prefix="/api/v1", tags=["Model Info"])


# ── Root Endpoint ─────────────────────────────────────────
@app.api_route("/", methods=["GET", "OPTIONS"], tags=["Root"])
async def root():
    """API root — basic info."""
    return {
        "name": "EVGuard API",
        "version": "1.0.0",
        "description": "Electric Vehicle Predictive Maintenance API",
        "docs": "/docs" if ENV == "development" else "disabled",
    }
