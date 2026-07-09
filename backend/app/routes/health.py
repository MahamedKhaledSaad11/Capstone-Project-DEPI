"""
EVGuard — Health Route
=======================
GET /api/v1/health — Service health check.
"""

import time
from datetime import datetime, timezone
from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/health")
async def health(request: Request):
    """Return current health status of the EVGuard API service."""
    prediction_service = request.app.state.prediction_service
    start_time = request.app.state.start_time

    uptime = time.time() - start_time

    return {
        "status": "healthy" if prediction_service.is_loaded else "degraded",
        "model_loaded": prediction_service.is_loaded,
        "model_version": prediction_service.metadata.get("version", "unknown") if prediction_service.metadata else "unknown",
        "uptime_seconds": round(uptime, 2),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
