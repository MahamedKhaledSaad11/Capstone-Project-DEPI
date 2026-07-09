"""
EVGuard — Prediction Service
=============================
Core service that handles:
1. Feature engineering (computing 13 derived features from 12 raw inputs)
2. Model inference via the loaded StandardScaler + LightGBM pipeline
3. Risk level assessment
4. Feature status evaluation
5. Recommendation generation

IMPORTANT — Rolling Feature Approximation:
    At inference time, we do NOT have historical time-series data.
    Rolling features are approximated as:
        roll_mean  = current sensor value   (stable-state assumption)
        roll_std   = 0                      (no variance = stable assumption)
"""

import uuid
import json
import logging
import numpy as np
import joblib
from datetime import datetime, timezone
from pathlib import Path
from app.services.decision_support import generate_decision_support

logger = logging.getLogger("evguard")

# ── Feature ordering (must match training) ─────────────────
FEATURE_ORDER = [
    "speed_kmh", "distance_m", "soc_pct", "battery_voltage_v",
    "battery_temp_c", "motor_rpm", "motor_temp_c", "power_kw",
    "ambient_temp_c", "load_kg", "power_to_load_ratio",
    "temp_diff_motor_ambient", "temp_diff_battery_ambient",
    "voltage_per_soc", "speed_x_load", "motor_temp_c_roll_mean",
    "motor_temp_c_roll_std", "battery_temp_c_roll_mean",
    "battery_temp_c_roll_std", "battery_voltage_v_roll_mean",
    "battery_voltage_v_roll_std", "power_kw_roll_mean",
    "power_kw_roll_std", "hour_of_day", "day_of_week",
]

CLASS_NAMES = [
    "Critical_Overheating",
    "Mechanical_Stress",
    "Normal",
    "Thermal_Overload",
    "Voltage_Sag",
]

# ── Normal operating ranges ───────────────────────────────
NORMAL_RANGES = {
    "speed_kmh": [0, 130],
    "soc_pct": [20, 95],
    "battery_voltage_v": [340, 420],
    "battery_temp_c": [15, 45],
    "motor_rpm": [0, 8000],
    "motor_temp_c": [10, 80],
    "power_kw": [0, 40],
    "ambient_temp_c": [-10, 45],
    "load_kg": [0, 600],
}

# ── Display names for features ────────────────────────────
FEATURE_DISPLAY_NAMES = {
    "speed_kmh": "Vehicle Speed",
    "distance_m": "Distance Traveled",
    "soc_pct": "State of Charge",
    "battery_voltage_v": "Battery Voltage",
    "battery_temp_c": "Battery Temperature",
    "motor_rpm": "Motor RPM",
    "motor_temp_c": "Motor Temperature",
    "power_kw": "Power Consumption",
    "ambient_temp_c": "Ambient Temperature",
    "load_kg": "Vehicle Load",
    "power_to_load_ratio": "Power-to-Load Ratio",
    "temp_diff_motor_ambient": "Motor-Ambient Temp Diff",
    "temp_diff_battery_ambient": "Battery-Ambient Temp Diff",
    "voltage_per_soc": "Voltage per SoC",
    "speed_x_load": "Speed x Load",
    "motor_temp_c_roll_mean": "Motor Temp Trend",
    "motor_temp_c_roll_std": "Motor Temp Variability",
    "battery_temp_c_roll_mean": "Battery Temp Trend",
    "battery_temp_c_roll_std": "Battery Temp Variability",
    "battery_voltage_v_roll_mean": "Battery Voltage Trend",
    "battery_voltage_v_roll_std": "Battery Voltage Variability",
    "power_kw_roll_mean": "Power Trend",
    "power_kw_roll_std": "Power Variability",
    "hour_of_day": "Hour of Day",
    "day_of_week": "Day of Week",
}

# ── Feature importance (gain-based from training) ─────────
FEATURE_IMPORTANCE_GAIN = {
    "battery_voltage_v_roll_mean": 0.1677,
    "motor_temp_c_roll_mean": 0.1540,
    "battery_temp_c_roll_mean": 0.1102,
    "power_kw_roll_mean": 0.0832,
    "battery_temp_c": 0.0615,
    "motor_temp_c": 0.0580,
    "battery_voltage_v": 0.0478,
    "temp_diff_motor_ambient": 0.0421,
    "power_kw": 0.0390,
    "temp_diff_battery_ambient": 0.0355,
    "voltage_per_soc": 0.0310,
    "soc_pct": 0.0275,
    "speed_kmh": 0.0198,
    "motor_rpm": 0.0178,
    "ambient_temp_c": 0.0155,
    "power_to_load_ratio": 0.0140,
    "load_kg": 0.0125,
    "speed_x_load": 0.0112,
    "distance_m": 0.0098,
    "battery_voltage_v_roll_std": 0.0085,
    "motor_temp_c_roll_std": 0.0076,
    "battery_temp_c_roll_std": 0.0068,
    "power_kw_roll_std": 0.0060,
    "hour_of_day": 0.0072,
    "day_of_week": 0.0058,
}

# ── Risk level mapping ───────────────────────────────────
RISK_MAPPING = {
    "Normal": "LOW",
    "Voltage_Sag": "MEDIUM",
    "Mechanical_Stress": "HIGH",
    "Thermal_Overload": "HIGH",
    "Critical_Overheating": "CRITICAL",
}

# ── Recommendations per failure type ─────────────────────
FAILURE_RECOMMENDATIONS = {
    "Critical_Overheating": [
        {
            "severity": "CRITICAL",
            "component": "Cooling System",
            "message": "Immediate cooling system inspection required.",
            "action": "Stop vehicle and inspect cooling system before further operation.",
        },
        {
            "severity": "CRITICAL",
            "component": "Battery",
            "message": "Do not operate vehicle until battery temperature normalizes.",
            "action": "Allow battery to cool to below 45°C before driving.",
        },
    ],
    "Thermal_Overload": [
        {
            "severity": "WARNING",
            "component": "Drivetrain",
            "message": "Reduce power consumption and vehicle load.",
            "action": "Lower speed and minimize acceleration intensity.",
        },
        {
            "severity": "WARNING",
            "component": "Cooling System",
            "message": "Allow cooling period before next trip.",
            "action": "Wait at least 30 minutes with vehicle powered off.",
        },
    ],
    "Mechanical_Stress": [
        {
            "severity": "WARNING",
            "component": "Drivetrain",
            "message": "Schedule mechanical inspection within 48 hours.",
            "action": "Contact service center for drivetrain and motor inspection.",
        },
        {
            "severity": "WARNING",
            "component": "Motor",
            "message": "Reduce speed and load until inspection.",
            "action": "Limit speed to 80 km/h and reduce cargo weight.",
        },
    ],
    "Voltage_Sag": [
        {
            "severity": "WARNING",
            "component": "Battery",
            "message": "Battery health check recommended.",
            "action": "Schedule battery diagnostic at next service interval.",
        },
        {
            "severity": "WARNING",
            "component": "Battery",
            "message": "Avoid deep discharge cycles.",
            "action": "Keep state of charge above 20% at all times.",
        },
    ],
    "Normal": [
        {
            "severity": "INFO",
            "component": "System",
            "message": "All systems operating within normal parameters.",
            "action": "Continue regular monitoring schedule.",
        },
        {
            "severity": "INFO",
            "component": "Maintenance",
            "message": "All systems nominal.",
            "action": "Continue regular maintenance schedule.",
        },
    ],
}


class PredictionService:
    """Handles model loading, feature engineering, and prediction logic."""

    def __init__(self, model_path: str, metadata_path: str):
        self.model_path = model_path
        self.metadata_path = metadata_path
        self.pipeline = None
        self.metadata = None
        self.scaler = None
        self.model = None

    def load_model(self):
        """Load the exported pipeline (scaler + model) and metadata."""
        logger.info(f"Loading model from: {self.model_path}")
        self.pipeline = joblib.load(self.model_path)
        self.scaler = self.pipeline["scaler"]
        self.model = self.pipeline["model"]

        with open(self.metadata_path, "r") as f:
            self.metadata = json.load(f)

        logger.info(
            f"Model loaded successfully: {self.metadata['model_name']} "
            f"v{self.metadata['version']} | "
            f"{self.metadata['feature_count']} features | "
            f"Accuracy: {self.metadata['accuracy']}"
        )

    @property
    def is_loaded(self) -> bool:
        return self.model is not None and self.scaler is not None

    def compute_derived_features(self, inputs: dict) -> dict:
        """Compute the 13 derived features from 12 raw inputs.

        Rolling feature approximations:
            roll_mean = current sensor value (stable-state assumption)
            roll_std  = 0 (no historical data at inference time)
        """
        features = dict(inputs)

        # 5 engineered interaction features
        features["power_to_load_ratio"] = inputs["power_kw"] / (inputs["load_kg"] + 1)
        features["temp_diff_motor_ambient"] = inputs["motor_temp_c"] - inputs["ambient_temp_c"]
        features["temp_diff_battery_ambient"] = inputs["battery_temp_c"] - inputs["ambient_temp_c"]
        features["voltage_per_soc"] = inputs["battery_voltage_v"] / (inputs["soc_pct"] + 1)
        features["speed_x_load"] = inputs["speed_kmh"] * inputs["load_kg"]

        # 8 rolling window approximations (no historical data available)
        features["motor_temp_c_roll_mean"] = inputs["motor_temp_c"]
        features["motor_temp_c_roll_std"] = 0.0
        features["battery_temp_c_roll_mean"] = inputs["battery_temp_c"]
        features["battery_temp_c_roll_std"] = 0.0
        features["battery_voltage_v_roll_mean"] = inputs["battery_voltage_v"]
        features["battery_voltage_v_roll_std"] = 0.0
        features["power_kw_roll_mean"] = inputs["power_kw"]
        features["power_kw_roll_std"] = 0.0

        return features

    def predict(self, inputs: dict) -> dict:
        """Run full prediction pipeline: feature engineering -> scaling -> inference."""
        if not self.is_loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        # 1. Compute all 25 features
        all_features = self.compute_derived_features(inputs)

        # 2. Build feature array in correct order
        feature_array = np.array(
            [[all_features[f] for f in FEATURE_ORDER]]
        )

        # 3. Scale features
        feature_scaled = self.scaler.transform(feature_array)

        # 4. Predict
        predicted_label = int(self.model.predict(feature_scaled)[0])
        probabilities_array = self.model.predict_proba(feature_scaled)[0]

        predicted_class = CLASS_NAMES[predicted_label]
        confidence = float(probabilities_array[predicted_label])
        risk_level = RISK_MAPPING[predicted_class]

        # 5. Build probability dict
        probabilities = {
            cls: round(float(prob), 4)
            for cls, prob in zip(CLASS_NAMES, probabilities_array)
        }

        # 6. Feature contributions
        feature_contributions = self._compute_feature_contributions(all_features)

        # 7. Recommendations
        statuses = {fc["feature"]: fc["status"] for fc in feature_contributions}
        recommendations = self._generate_recommendations(predicted_class, statuses)

        # 8. Decision support — human-centered guidance from rule-based engine
        decision_support = generate_decision_support(
            predicted_class=predicted_class,
            confidence=confidence,
            risk_level=risk_level,
            feature_contributions=feature_contributions,
        )

        return {
            "predicted_class": predicted_class,
            "predicted_label": predicted_label,
            "probabilities": probabilities,
            "risk_level": risk_level,
            "confidence": round(confidence, 4),
            "feature_contributions": feature_contributions,
            "recommendations": recommendations,
            "decision_support": decision_support,
            "model_version": self.metadata["version"],
            "prediction_id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def _compute_feature_contributions(self, features: dict) -> list:
        """Compute feature status and importance for each feature."""
        contributions = []

        for feature_name in FEATURE_ORDER:
            value = features[feature_name]
            importance = FEATURE_IMPORTANCE_GAIN.get(feature_name, 0.0)
            display_name = FEATURE_DISPLAY_NAMES.get(feature_name, feature_name)
            normal_range = NORMAL_RANGES.get(feature_name, None)

            if normal_range:
                status = self._evaluate_status(value, normal_range)
            else:
                status = "normal"

            contributions.append({
                "feature": feature_name,
                "display_name": display_name,
                "value": round(float(value), 4),
                "importance": round(importance, 4),
                "status": status,
                "normal_range": normal_range if normal_range else [0, 0],
            })

        # Sort by importance (descending)
        contributions.sort(key=lambda x: x["importance"], reverse=True)
        return contributions

    @staticmethod
    def _evaluate_status(value: float, normal_range: list) -> str:
        """Evaluate feature status based on normal operating range.

        Returns:
            'normal'   — within range
            'warning'  — 10% outside range
            'critical' — 20%+ outside range
        """
        lo, hi = normal_range
        range_span = hi - lo if hi != lo else 1.0
        margin_10 = range_span * 0.10
        margin_20 = range_span * 0.20

        if lo <= value <= hi:
            return "normal"
        elif (lo - margin_10) <= value <= (hi + margin_10):
            return "warning"
        else:
            return "critical"

    @staticmethod
    def _generate_recommendations(predicted_class: str, statuses: dict) -> list:
        """Generate recommendations based on predicted class and feature statuses."""
        recommendations = list(FAILURE_RECOMMENDATIONS.get(predicted_class, []))

        # Add feature-specific warnings
        critical_features = [f for f, s in statuses.items() if s == "critical"]
        warning_features = [f for f, s in statuses.items() if s == "warning"]

        for feature in critical_features:
            display = FEATURE_DISPLAY_NAMES.get(feature, feature)
            recommendations.append({
                "severity": "CRITICAL",
                "component": display,
                "message": f"{display} is critically outside normal operating range.",
                "action": f"Immediately address {display.lower()} issue before continuing operation.",
            })

        for feature in warning_features:
            display = FEATURE_DISPLAY_NAMES.get(feature, feature)
            recommendations.append({
                "severity": "WARNING",
                "component": display,
                "message": f"{display} is approaching abnormal levels.",
                "action": f"Monitor {display.lower()} closely and consider reducing load.",
            })

        return recommendations
