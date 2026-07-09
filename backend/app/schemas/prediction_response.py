"""
EVGuard — Prediction Response Schema
=====================================
Pydantic v2 models for the POST /api/v1/predict response body.
"""

from pydantic import BaseModel, Field
from typing import Optional


class FeatureContribution(BaseModel):
    """One feature's contribution to the prediction."""
    feature: str
    display_name: str
    value: float
    importance: float
    status: str = Field(description="normal | warning | critical")
    normal_range: list[float]


class Recommendation(BaseModel):
    """One actionable recommendation based on the prediction."""
    severity: str = Field(description="INFO | WARNING | CRITICAL")
    component: str
    message: str
    action: str


class DecisionSupport(BaseModel):
    """
    Human-centered decision support object generated from prediction outputs.
    Provides plain-language guidance suitable for non-technical users.
    All fields are generated deterministically — no external AI services used.
    """
    title: str = Field(description="Short human-readable title for the situation")
    summary: str = Field(description="Plain-English summary of what is happening")
    confidence_note: str = Field(description="Plain-language interpretation of model confidence")
    urgency: str = Field(description="Low | Medium | High | Critical")
    safe_to_drive: str = Field(description="Plain-language driving recommendation")
    safe_to_drive_state: str = Field(description="green | yellow | red — controls card color")
    safe_to_drive_note: str = Field(description="One-sentence driving guidance")
    maintenance_priority: str = Field(description="Routine Monitoring | Schedule Inspection | High Priority | Immediate Action Required")
    maintenance_priority_level: str = Field(description="routine | soon | high | immediate")
    recommended_timeline: str = Field(description="When to act — qualitative estimate")
    business_impact: str = Field(description="Plain-language business impact description")
    operational_impact: str = Field(description="None | Minor | Moderate | High | Critical")
    operational_impact_note: str = Field(description="One sentence explaining operational impact")
    estimated_cost_impact: str = Field(description="Low | Medium | High | Very High")
    estimated_downtime: str = Field(description="Qualitative downtime estimate")
    feature_observations: list[str] = Field(description="Dynamic plain-language observations from critical feature statuses")
    benefits_of_action: list[str] = Field(description="Benefits of addressing the issue now")
    consequences_of_ignoring: list[str] = Field(description="Consequences of not acting")
    action_plan: list[str] = Field(description="Ordered list of recommended actions")


class PredictionResponse(BaseModel):
    """Full prediction response including class, probabilities, risk, recommendations, and decision support."""
    predicted_class: str
    predicted_label: int
    probabilities: dict[str, float]
    risk_level: str
    confidence: float
    feature_contributions: list[FeatureContribution]
    recommendations: list[Recommendation]
    decision_support: DecisionSupport
    model_version: str
    prediction_id: str
    timestamp: str
