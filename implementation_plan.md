# Decision Support Dashboard — Implementation Plan

## Goal

Transform EVGuard's prediction output from a raw ML result into a **human-centered decision support system**. This adds a `Decision Support Dashboard` section beneath existing prediction results, generated entirely via deterministic rule-based backend logic. No external AI/LLM services are used.

## Architecture Flow (New)

```
User Input → PredictionService → Decision Support Generator → PredictionResponse → React UI
```

The backend handles all business logic. The frontend stays purely presentational.

---

## Proposed Changes

### Backend

---

#### [NEW] [decision_support.py](file:///d:/Depi-Project/Capstone-Project-DEPI/backend/app/services/decision_support.py)

A standalone module with a single entry-point function `generate_decision_support(predicted_class, confidence, risk_level, feature_contributions)` that returns the `decision_support` dict.

Logic includes:
- **Class profiles**: Static per-class lookup tables for all 5 classes (`Normal`, `Mechanical_Stress`, `Thermal_Overload`, `Voltage_Sag`, `Critical_Overheating`) containing all required fields.
- **Confidence-based messaging**: Adjusts wording depending on confidence thresholds (>95%, 80–95%, <80%).
- **Feature-aware observations**: Inspects `feature_contributions` for `critical` status on key features (`motor_temp_c`, `battery_temp_c`, `battery_voltage_v`, `power_kw`, `load_kg`) and appends plain-English observations.

---

#### [MODIFY] [prediction_response.py](file:///d:/Depi-Project/Capstone-Project-DEPI/backend/app/schemas/prediction_response.py)

Extend `PredictionResponse` with two new Pydantic models:
- `DecisionSupport` — holds all decision support fields
- Updated `PredictionResponse` to include `decision_support: DecisionSupport`

All existing fields remain unchanged.

---

#### [MODIFY] [prediction_service.py](file:///d:/Depi-Project/Capstone-Project-DEPI/backend/app/services/prediction_service.py)

In the `predict()` method, after step 7 (recommendations), add step 8:

```python
# 8. Decision support
from app.services.decision_support import generate_decision_support
decision_support = generate_decision_support(
    predicted_class, confidence, risk_level, feature_contributions
)
```

Then include `decision_support` in the returned dict.

---

### Frontend

---

#### [NEW] [DecisionSupportPanel.jsx](file:///d:/Depi-Project/Capstone-Project-DEPI/frontend/src/pages/Predict/DecisionSupportPanel.jsx)

A self-contained React component that accepts `decisionSupport` as a prop and renders the full dashboard. Sub-sections:

1. **Dashboard header** — title + urgency badge
2. **Plain-English summary** — full-width summary card with confidence note
3. **Safe to Drive card** — large colored card (green/yellow/red) with icon + label
4. **Maintenance Priority card** — icon + priority label
5. **Recommended Timeline card** — clock icon + timeline
6. **Operational Impact card** — impact level with one-sentence explanation
7. **Cost Impact card** — classification + advisory sentence
8. **Estimated Downtime card** — qualitative estimate
9. **Business Impact** — full-width text card
10. **Benefits of Acting** — checklist with green checkmarks
11. **Consequences of Ignoring** — checklist with red X marks
12. **Action Plan** — numbered steps in a styled list

Uses existing `Card`, `Badge` components. Uses Framer Motion `motion.div` with stagger animations matching existing patterns.

---

#### [MODIFY] [Predict/index.jsx](file:///d:/Depi-Project/Capstone-Project-DEPI/frontend/src/pages/Predict/index.jsx)

After the existing results section (closing `</motion.div>` of `result &&`), add `DecisionSupportPanel` import and render it below:

```jsx
{result?.decision_support && (
  <DecisionSupportPanel decisionSupport={result.decision_support} />
)}
```

The panel is placed **below** the two-column grid (outside the `grid grid-cols-1 lg:grid-cols-2` div) so it spans full width for the professional report look.

---

## Decision Support Data Structure

```typescript
interface DecisionSupport {
  title: string;
  summary: string;
  confidence_note: string;          // derived from confidence level
  urgency: string;                  // Low | Medium | High | Critical
  safe_to_drive: string;            // Yes | Yes, with caution | Limited Driving Only | Short Trips Only | No
  maintenance_priority: string;     // Routine Monitoring | Schedule Inspection | High Priority | Immediate
  recommended_timeline: string;     // Next Scheduled Service | Within 7 Days | Within 24 Hours | Immediately
  business_impact: string;
  operational_impact: string;       // None | Minor | Moderate | High | Critical
  operational_impact_note: string;  // One-sentence plain explanation
  estimated_cost_impact: string;    // Low | Medium | High | Very High
  estimated_downtime: string;       // None | Half Day | 1 Day | 1-2 Days | Several Days
  feature_observations: string[];   // Feature-aware plain-language notes
  benefits_of_action: string[];
  consequences_of_ignoring: string[];
  action_plan: string[];
}
```

---

## Verification Plan

### Automated
- Restart backend `uvicorn` and call `POST /api/v1/predict` with sample inputs → check `decision_support` in JSON response.
- Verify all 5 prediction classes return correctly structured data.

### Manual
- Open frontend Predict page, run each sample preset (healthy, warning, critical).
- Confirm `DecisionSupportPanel` appears below existing results for all classes.
- Confirm color coding: green for Normal/Low, yellow/orange for Medium/High, red for Critical.
- Confirm responsiveness on narrow viewport.
- Confirm existing prediction results are completely unaffected.
