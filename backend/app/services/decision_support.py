"""
EVGuard — Decision Support Engine
===================================
Converts machine-learning prediction outputs into human-centered business
guidance that is understandable by non-technical users (EV owners, fleet
managers, maintenance supervisors, business stakeholders).

NO external AI services, APIs, or LLMs are used.
All logic is deterministic and rule-based.

Public API
----------
generate_decision_support(predicted_class, confidence, risk_level,
                          feature_contributions) -> dict
"""

from __future__ import annotations
from typing import Any

# ── Plain-language class profiles ─────────────────────────────────────────────
# Each key is the raw predicted_class string returned by PredictionService.
# Every profile contains static defaults; feature-aware observations are added
# dynamically at generation time.

_CLASS_PROFILES: dict[str, dict[str, Any]] = {
    "Normal": {
        "title": "Vehicle Operating Normally",
        "summary": (
            "Your vehicle is operating within expected conditions. "
            "No immediate maintenance is required. All key systems — battery, "
            "motor, and temperature — are behaving as expected."
        ),
        "urgency": "Low",
        "safe_to_drive": "Yes",
        "safe_to_drive_state": "green",   # green | yellow | red
        "safe_to_drive_note": "Continue normal driving.",
        "maintenance_priority": "Routine Monitoring",
        "maintenance_priority_level": "routine",  # routine | soon | high | immediate
        "recommended_timeline": "Next Scheduled Service",
        "business_impact": "No operational impact expected. The vehicle is available for normal use.",
        "operational_impact": "None",
        "operational_impact_note": "No change to daily operations is required.",
        "estimated_cost_impact": "Low",
        "estimated_downtime": "None",
        "benefits_of_action": [
            "Avoid unnecessary maintenance expenses",
            "Continue efficient, uninterrupted operation",
            "Maximize component lifespan through regular monitoring",
            "Reduce long-term operating costs",
            "Keep the vehicle available and reliable",
        ],
        "consequences_of_ignoring": [
            "None significant at this time",
        ],
        "action_plan": [
            "Continue normal driving as usual",
            "Monitor the vehicle dashboard periodically",
            "Perform routine maintenance as scheduled",
            "Record current readings for future comparison",
        ],
    },

    "Mechanical_Stress": {
        "title": "Mechanical Stress Detected",
        "summary": (
            "Some vehicle components appear to be operating under higher mechanical "
            "load than normal. This is not an emergency, but scheduling an inspection "
            "soon can help prevent more costly repairs later."
        ),
        "urgency": "Medium",
        "safe_to_drive": "Yes, with caution",
        "safe_to_drive_state": "yellow",
        "safe_to_drive_note": "Drive cautiously and schedule maintenance soon.",
        "maintenance_priority": "Schedule Inspection",
        "maintenance_priority_level": "soon",
        "recommended_timeline": "Within 7 Days",
        "business_impact": (
            "Continued operation under high mechanical stress may accelerate wear on "
            "drivetrain components, increasing the likelihood of unplanned downtime."
        ),
        "operational_impact": "Moderate",
        "operational_impact_note": (
            "Performance may be slightly reduced; heavy hauling or aggressive driving "
            "is not recommended until the vehicle is inspected."
        ),
        "estimated_cost_impact": "Medium",
        "estimated_downtime": "Half Day",
        "benefits_of_action": [
            "Extend drivetrain lifespan and avoid premature wear",
            "Reduce the risk of unexpected, costly repairs",
            "Improve long-term vehicle reliability",
            "Lower overall maintenance costs over time",
            "Keep the vehicle in optimal working condition",
        ],
        "consequences_of_ignoring": [
            "Accelerated wear on drivetrain components",
            "Reduced vehicle performance and efficiency",
            "Increased likelihood of unexpected breakdowns",
            "Higher repair expenses if damage progresses",
            "Potential unplanned operational downtime",
        ],
        "action_plan": [
            "Reduce heavy acceleration and avoid excessive loads",
            "Limit speed to comfortable, steady driving",
            "Schedule a mechanical inspection within 7 days",
            "Inform your maintenance team about this alert",
            "Continue monitoring the vehicle between now and the inspection",
        ],
    },

    "Thermal_Overload": {
        "title": "Elevated Thermal Conditions Detected",
        "summary": (
            "The vehicle is operating at higher-than-normal temperatures. "
            "While driving is still possible, continuing under these conditions "
            "may increase wear on important components. Scheduling maintenance "
            "promptly is strongly advised."
        ),
        "urgency": "High",
        "safe_to_drive": "Limited Driving Only",
        "safe_to_drive_state": "yellow",
        "safe_to_drive_note": "Short or necessary trips only. Avoid heavy loads and long distances.",
        "maintenance_priority": "High Priority",
        "maintenance_priority_level": "high",
        "recommended_timeline": "Within 24 Hours",
        "business_impact": (
            "Ignoring elevated temperatures may lead to component degradation, "
            "reduced vehicle efficiency, and unexpected maintenance downtime — "
            "all of which increase operating costs."
        ),
        "operational_impact": "High",
        "operational_impact_note": (
            "The vehicle should only be used for essential trips until the issue is resolved."
        ),
        "estimated_cost_impact": "High",
        "estimated_downtime": "1 Day",
        "benefits_of_action": [
            "Prevent overheating damage to the motor and battery",
            "Improve cooling system efficiency",
            "Reduce repair costs by addressing the issue early",
            "Increase overall vehicle reliability",
            "Avoid extended downtime from delayed action",
        ],
        "consequences_of_ignoring": [
            "Accelerated wear on heat-sensitive components",
            "Reduced driving efficiency and range",
            "Risk of unexpected vehicle shutdown",
            "Higher maintenance and repair costs",
            "Potential for more serious damage requiring longer downtime",
        ],
        "action_plan": [
            "Reduce vehicle load and avoid long trips immediately",
            "Allow the vehicle to cool down before the next trip",
            "Contact your service team to schedule maintenance within 24 hours",
            "Inspect the cooling system and ventilation",
            "Do not resume normal operation until cleared by a technician",
        ],
    },

    "Voltage_Sag": {
        "title": "Battery Voltage Instability Detected",
        "summary": (
            "The battery appears to be delivering less voltage than expected. "
            "This can affect driving range and overall performance. Addressing "
            "this early helps prevent more serious battery degradation."
        ),
        "urgency": "High",
        "safe_to_drive": "Short Trips Only",
        "safe_to_drive_state": "yellow",
        "safe_to_drive_note": "Limit driving to short, necessary trips. Avoid draining the battery fully.",
        "maintenance_priority": "High Priority",
        "maintenance_priority_level": "high",
        "recommended_timeline": "Within 24 Hours",
        "business_impact": (
            "Battery health issues can reduce the vehicle's operational range and "
            "increase the likelihood of unexpected service interruptions, impacting "
            "fleet availability and operating costs."
        ),
        "operational_impact": "High",
        "operational_impact_note": (
            "Driving range is likely reduced; plan shorter routes and ensure "
            "charging availability until the battery is inspected."
        ),
        "estimated_cost_impact": "High",
        "estimated_downtime": "1–2 Days",
        "benefits_of_action": [
            "Extend battery lifespan and delay costly replacement",
            "Prevent further battery degradation from neglect",
            "Improve driving range and vehicle reliability",
            "Reduce the risk of unexpected vehicle shutdown",
            "Lower long-term battery replacement costs",
        ],
        "consequences_of_ignoring": [
            "Progressive battery degradation and capacity loss",
            "Reduced and unpredictable driving range",
            "Risk of unexpected shutdown during operation",
            "Significantly higher battery replacement costs",
            "Extended vehicle downtime for emergency repairs",
        ],
        "action_plan": [
            "Recharge the battery as soon as possible",
            "Avoid fully draining the battery on any trips",
            "Schedule a battery system inspection within 24 hours",
            "Reduce power-heavy features (heating, fast acceleration) temporarily",
            "Have your technician run a full battery health diagnostic",
        ],
    },

    "Critical_Overheating": {
        "title": "Critical Overheating Detected",
        "summary": (
            "The vehicle is experiencing dangerously high temperatures. "
            "Continued operation poses a serious risk of permanent damage to "
            "critical components. Driving is not recommended until the vehicle "
            "has been inspected and cleared by a qualified technician."
        ),
        "urgency": "Critical",
        "safe_to_drive": "No — Stop Vehicle Safely",
        "safe_to_drive_state": "red",
        "safe_to_drive_note": "Do not drive. Park safely and arrange immediate inspection.",
        "maintenance_priority": "Immediate Action Required",
        "maintenance_priority_level": "immediate",
        "recommended_timeline": "Immediately",
        "business_impact": (
            "Operating the vehicle under these conditions could result in severe "
            "damage to the motor and battery pack, leading to costly emergency repairs "
            "and significant unplanned downtime."
        ),
        "operational_impact": "Critical",
        "operational_impact_note": (
            "The vehicle must be taken out of service immediately until inspected "
            "and repaired by a qualified technician."
        ),
        "estimated_cost_impact": "Very High",
        "estimated_downtime": "Several Days",
        "benefits_of_action": [
            "Prevent catastrophic failure of the motor or battery",
            "Avoid emergency repair costs that far exceed preventive maintenance",
            "Protect the long-term value and lifespan of the vehicle",
            "Reduce total downtime by acting now rather than after a breakdown",
            "Ensure the safety of the driver and passengers",
        ],
        "consequences_of_ignoring": [
            "Permanent motor damage requiring full replacement",
            "Severe battery pack damage or failure",
            "Unexpected vehicle shutdown in unsafe locations",
            "Very high emergency repair costs",
            "Extended downtime of several days or more",
            "Potential safety risk to the driver",
        ],
        "action_plan": [
            "Stop driving safely and park the vehicle immediately",
            "Turn the vehicle off and do not restart it",
            "Contact your maintenance team or roadside assistance right away",
            "Do not attempt to continue driving under any circumstances",
            "Arrange for professional inspection before resuming any operation",
        ],
    },
}

# ── Feature-aware observation map ─────────────────────────────────────────────
# Maps internal feature names to plain-language observations shown when the
# feature status is 'critical'.  Observations intentionally avoid jargon.

_CRITICAL_FEATURE_OBSERVATIONS: dict[str, str] = {
    "motor_temp_c": (
        "Motor temperature is significantly above its normal operating range, "
        "which may reduce motor efficiency and lifespan."
    ),
    "motor_temp_c_roll_mean": (
        "The motor has been running hot for a sustained period, "
        "not just a brief spike."
    ),
    "battery_temp_c": (
        "The battery is operating hotter than expected, "
        "which can accelerate internal degradation."
    ),
    "battery_temp_c_roll_mean": (
        "Battery temperature has remained elevated over time, "
        "increasing the risk of long-term capacity loss."
    ),
    "battery_voltage_v": (
        "Battery voltage appears unstable, "
        "which may affect driving range and performance."
    ),
    "battery_voltage_v_roll_mean": (
        "Average battery voltage has been consistently low, "
        "suggesting an underlying battery health issue."
    ),
    "power_kw": (
        "The vehicle is drawing unusually high power, "
        "which places extra strain on the battery and drivetrain."
    ),
    "power_kw_roll_mean": (
        "Power consumption has been elevated for an extended period, "
        "not just during a single trip."
    ),
    "load_kg": (
        "The vehicle may currently be operating under excessive load, "
        "which increases mechanical stress on all components."
    ),
    "temp_diff_motor_ambient": (
        "There is a large temperature gap between the motor and the outside air, "
        "suggesting the motor is generating more heat than usual."
    ),
    "temp_diff_battery_ambient": (
        "There is a large temperature gap between the battery and the outside air, "
        "suggesting the battery cooling system may not be working optimally."
    ),
    "soc_pct": (
        "Battery charge level is very low, "
        "which can put additional stress on the battery cells."
    ),
}

# Features to check for warnings (less severe, shown only for classes with High+ urgency)
_WARNING_FEATURE_OBSERVATIONS: dict[str, str] = {
    "motor_temp_c": "Motor temperature is approaching the upper end of its safe range.",
    "battery_temp_c": "Battery temperature is slightly elevated above normal.",
    "battery_voltage_v": "Battery voltage is slightly below the expected range.",
    "power_kw": "Power consumption is somewhat higher than typical.",
    "load_kg": "Vehicle load is on the higher end of the recommended range.",
}

# ── Confidence messaging ───────────────────────────────────────────────────────

def _confidence_note(confidence: float) -> str:
    """Return a plain-language note describing model confidence."""
    pct = confidence * 100
    if pct >= 95:
        return "The assessment is based on strong sensor evidence and is highly reliable."
    elif pct >= 80:
        return "The assessment is well-supported by the current sensor readings."
    else:
        return (
            "The prediction indicates a possible issue. "
            "An additional manual inspection is recommended to confirm."
        )


# ── Feature observation builder ────────────────────────────────────────────────

def _build_feature_observations(
    feature_contributions: list[dict],
    urgency: str,
) -> list[str]:
    """
    Build a list of plain-language observations based on critical/warning
    feature statuses.

    Parameters
    ----------
    feature_contributions : list of dicts with keys 'feature' and 'status'
    urgency : str — the urgency level of the predicted class

    Returns
    -------
    list[str] — plain-language observations, deduplicated
    """
    observations: list[str] = []
    seen: set[str] = set()

    # Collect statuses keyed by feature name
    statuses: dict[str, str] = {fc["feature"]: fc["status"] for fc in feature_contributions}

    # Always include critical observations
    for feature, obs in _CRITICAL_FEATURE_OBSERVATIONS.items():
        if statuses.get(feature) == "critical" and obs not in seen:
            observations.append(obs)
            seen.add(obs)

    # Include warning observations only for high-urgency situations
    if urgency in ("High", "Critical"):
        for feature, obs in _WARNING_FEATURE_OBSERVATIONS.items():
            if statuses.get(feature) == "warning" and obs not in seen:
                observations.append(obs)
                seen.add(obs)

    return observations


# ── Public entry point ────────────────────────────────────────────────────────

def generate_decision_support(
    predicted_class: str,
    confidence: float,
    risk_level: str,
    feature_contributions: list[dict],
) -> dict:
    """
    Generate a structured, human-centered decision support object from
    prediction outputs.

    Parameters
    ----------
    predicted_class : str
        The predicted failure class (e.g., 'Normal', 'Critical_Overheating').
    confidence : float
        Model confidence score in [0.0, 1.0].
    risk_level : str
        Risk level string (LOW | MEDIUM | HIGH | CRITICAL).
    feature_contributions : list[dict]
        Feature contribution dicts from PredictionService, each containing
        at least 'feature' (str) and 'status' (str: normal|warning|critical).

    Returns
    -------
    dict
        Structured decision support object matching DecisionSupport schema.
    """
    # Fall back gracefully if an unknown class is predicted
    profile = _CLASS_PROFILES.get(
        predicted_class,
        _CLASS_PROFILES["Normal"],
    )

    urgency = profile["urgency"]
    feature_observations = _build_feature_observations(feature_contributions, urgency)

    return {
        "title": profile["title"],
        "summary": profile["summary"],
        "confidence_note": _confidence_note(confidence),
        "urgency": urgency,
        "safe_to_drive": profile["safe_to_drive"],
        "safe_to_drive_state": profile["safe_to_drive_state"],
        "safe_to_drive_note": profile["safe_to_drive_note"],
        "maintenance_priority": profile["maintenance_priority"],
        "maintenance_priority_level": profile["maintenance_priority_level"],
        "recommended_timeline": profile["recommended_timeline"],
        "business_impact": profile["business_impact"],
        "operational_impact": profile["operational_impact"],
        "operational_impact_note": profile["operational_impact_note"],
        "estimated_cost_impact": profile["estimated_cost_impact"],
        "estimated_downtime": profile["estimated_downtime"],
        "feature_observations": feature_observations,
        "benefits_of_action": profile["benefits_of_action"],
        "consequences_of_ignoring": profile["consequences_of_ignoring"],
        "action_plan": profile["action_plan"],
    }
