"""
EVGuard — Predict Route
========================
POST /api/v1/predict — Run EV failure prediction.
"""

import logging
from fastapi import APIRouter, HTTPException, Request
from app.schemas.prediction_request import TimeSeriesRequest
from app.schemas.prediction_response import PredictionResponse

logger = logging.getLogger("evguard")
router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict(request: Request, body: TimeSeriesRequest):
    """Run a prediction using the loaded LightGBM model.

    Accepts 12 raw sensor + temporal inputs (single or sequence) and returns:
    - Predicted failure class with probabilities
    - Risk level assessment
    - Feature contribution analysis
    - Actionable maintenance recommendations
    """
    prediction_service = request.app.state.prediction_service

    if not prediction_service.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded. Service unavailable.")

    try:
        if isinstance(body, list):
            inputs = [item.model_dump() for item in body]
        else:
            inputs = body.model_dump()
            
        result = prediction_service.predict(inputs)
        logger.info(
            f"Prediction: {result['predicted_class']} "
            f"(confidence: {result['confidence']:.2%}, "
            f"risk: {result['risk_level']})"
        )
        return result
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
