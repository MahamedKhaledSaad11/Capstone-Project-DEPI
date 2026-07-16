"""
EVGuard — Prediction Request Schema
====================================
Pydantic v2 model for the POST /api/v1/predict request body.
Supports both a single dictionary (backward compatibility) 
or a list of dictionaries (Time-Series Sequence) up to 3 elements.
"""

from typing import List, Union
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Input schema for a single EV sensor reading."""

    speed_kmh: float = Field(
        ..., ge=0, le=200,
        description="Vehicle speed in km/h",
        json_schema_extra={"example": 65.0},
    )
    distance_m: float = Field(
        ..., ge=0,
        description="Total distance traveled in meters",
        json_schema_extra={"example": 150000.0},
    )
    soc_pct: float = Field(
        ..., ge=0, le=100,
        description="State of charge percentage",
        json_schema_extra={"example": 78.0},
    )
    battery_voltage_v: float = Field(
        ..., ge=250, le=500,
        description="Battery voltage in volts",
        json_schema_extra={"example": 390.0},
    )
    battery_temp_c: float = Field(
        ..., ge=-40, le=80,
        description="Battery temperature in Celsius",
        json_schema_extra={"example": 28.0},
    )
    motor_rpm: float = Field(
        ..., ge=0, le=12000,
        description="Motor rotational speed in RPM",
        json_schema_extra={"example": 3500.0},
    )
    motor_temp_c: float = Field(
        ..., ge=-20, le=120,
        description="Motor temperature in Celsius",
        json_schema_extra={"example": 42.0},
    )
    power_kw: float = Field(
        ..., ge=0, le=50,
        description="Power consumption in kW",
        json_schema_extra={"example": 9.0},
    )
    ambient_temp_c: float = Field(
        ..., ge=-50, le=60,
        description="Ambient temperature in Celsius",
        json_schema_extra={"example": 22.0},
    )
    load_kg: float = Field(
        ..., ge=0, le=1000,
        description="Vehicle load in kg",
        json_schema_extra={"example": 220.0},
    )
    hour_of_day: int = Field(
        ..., ge=0, le=23,
        description="Hour of day (0-23)",
        json_schema_extra={"example": 10},
    )
    day_of_week: int = Field(
        ..., ge=0, le=6,
        description="Day of week (0=Monday, 6=Sunday)",
        json_schema_extra={"example": 1},
    )

# A request can be either a single reading or a sequence of up to 3 readings.
TimeSeriesRequest = Union[List[PredictionRequest], PredictionRequest]
