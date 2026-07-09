# Backend & ML Pipeline Documentation
## EVGuard — Electric Vehicle Predictive Maintenance

> **Project:** Capstone Project DEPI
>
> **System Name:** EVGuard
>
> **Methodology:** CRISP-DM (Cross-Industry Standard Process for Data Mining)
>
> **Problem Type:** Multi-Class Classification
>
> **Last Updated:** 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Dataset](#2-dataset)
3. [Data Quality Issues](#3-data-quality-issues)
4. [Preprocessing Pipeline](#4-preprocessing-pipeline)
5. [Feature Engineering](#5-feature-engineering)
6. [Class Imbalance Handling](#6-class-imbalance-handling)
7. [Models Evaluated](#7-models-evaluated)
8. [Selected Model — LightGBM](#8-selected-model--lightgbm)
9. [Model Evaluation & Results](#9-model-evaluation--results)
10. [Feature Importance](#10-feature-importance)
11. [Model Export & Serialization](#11-model-export--serialization)
12. [Backend API Architecture](#12-backend-api-architecture)
13. [API Endpoints](#13-api-endpoints)
14. [Inference Pipeline](#14-inference-pipeline)
15. [Output Structure](#15-output-structure)
16. [Deployment](#16-deployment)
17. [Technology Stack](#17-technology-stack)

---

## 1. Project Overview

**Business Objective:**
The EVGuard system addresses the Vehicle Operations and Maintenance division's need to move away from fixed-interval maintenance toward data-driven predictive maintenance. Traditional maintenance based on mileage or calendar dates leads to:
- Unexpected roadside failures
- Costly over-maintenance of healthy components

**Goals:**
- Reduce unplanned vehicle breakdowns by 20%
- Achieve >= 85% accuracy in predicting component failure type
- Lower annual maintenance expenditure by 10%

**Data Mining Goal:**
Build a multi-class classification model that takes real-time EV sensor telemetry and classifies the current vehicle state into one of five categories:

| Label | Class Name | Description |
|---|---|---|
| 0 | `Critical_Overheating` | Motor or battery critically overheating |
| 1 | `Mechanical_Stress` | High mechanical load, drivetrain stress |
| 2 | `Normal` | All systems operating nominally |
| 3 | `Thermal_Overload` | Sustained thermal stress across components |
| 4 | `Voltage_Sag` | Battery voltage dropping below safe thresholds |

---

z]## 2. Dataset

### 2.1 Primary Training Dataset — `fleet_augmented.csv`

| Property | Value |
|---|---|
| **File** | `fleet_augmented.csv` (approx. 2 MB) |
| **Source** | Internal Fleet Operations Telemetry Data |
| **Collection Method** | Database export / CSV extraction — 10-minute sensor intervals |
| **Total Records** | 20,300 rows |
| **Unique Vehicles** | 500 (identified as `car_1` to `car_500`) |
| **Original Columns** | 13 columns |

### 2.2 Raw Feature Schema

| Column | Type | Description | Constraints |
|---|---|---|---|
| `timestamp` | datetime | UTC timestamp of the sensor reading (10-min intervals) | — |
| `car_id` | string | Unique vehicle identifier (`car_1` to `car_500`) | Categorical |
| `speed_kmh` | float | Vehicle speed in km/h | >= 0 |
| `distance_m` | float | Total odometer distance in meters | >= 0 |
| `soc_pct` | float | Battery State of Charge (%) | 0–100 |
| `battery_voltage_v` | float | Battery pack voltage in Volts | 250–500 V |
| `battery_temp_c` | float | Battery temperature in Celsius | -40 to 80 |
| `motor_rpm` | float | Motor rotational speed in RPM | 0–12,000 |
| `motor_temp_c` | float | Motor temperature in Celsius | -20 to 120 |
| `power_kw` | float | Power consumption in kW | 0–50 |
| `ambient_temp_c` | float | Ambient (outside) temperature in Celsius | -50 to 60 |
| `load_kg` | float | Vehicle payload / load weight in kg | 0–1,000 |
| `failure_type` | string | **Target variable** — failure category | 5 classes |

### 2.3 Target Class Distribution (Raw Dataset)

| Class | Count | % of Dataset | Imbalance Ratio |
|---|---|---|---|
| `Normal` | 19,554 | 96.33% | 444x majority |
| `Critical_Overheating` | 344 | 1.69% | 7.8x |
| `Thermal_Overload` | 308 | 1.52% | 7.0x |
| `Mechanical_Stress` | 50 | 0.25% | 1.1x |
| `Voltage_Sag` | 44 | 0.22% | 1.0x (minority) |

> **Key Challenge:** Extreme class imbalance of 444:1 (Normal vs. Voltage_Sag). A naive model predicting "Normal" 100% of the time would achieve 96.33% accuracy while being completely useless.

### 2.4 Secondary Reference Dataset — EVIoT Dataset

A second dataset (`EV_Predictive_Maintenance_Dataset_15min.csv`) was explored in Phase 2 for cross-reference:
- **175,393 records** with **30 attributes** at 15-minute intervals
- Additional fields: `SoC`, `SoH` (State of Health), `RUL` (Remaining Useful Life), `Component_Health_Score`, `Failure_Probability`, `Maintenance_Type`
- **No missing values** — used as a benchmark reference for feature correlation insights

---

## 3. Data Quality Issues

Identified during Phase 2 (Data Understanding):

| Issue | Affected Columns | Severity |
|---|---|---|
| **Missing values** | `soc_pct`, `battery_voltage_v`, `battery_temp_c`, `motor_rpm`, `motor_temp_c`, `power_kw`, `speed_kmh`, `distance_m`, `ambient_temp_c`, `load_kg` | 2%–8% per column |
| **Negative speeds** | `speed_kmh` | Physical impossibility — sensor error |
| **Negative distances** | `distance_m` | Physical impossibility — sensor error |
| **SoC > 100%** | `soc_pct` | Telemetry scale anomaly |
| **Temperature spikes** | `motor_temp_c` (up to ~71.78C+) | Sensor noise / genuine stress events |
| **No exact duplicates** | — | Confirmed — no duplicate rows |

---

## 4. Preprocessing Pipeline

All preprocessing steps were implemented in **Phase 3** (`notebooks/Phase_3_Data_Preparation.ipynb`) and codified in `export_model.py`. The pipeline produces a clean output file at `data/preprocessed/fleet_prepared.csv`.

### Step 1 — Chronological Sorting

```python
df = df.sort_values(by=['car_id', 'timestamp']).reset_index(drop=True)
```

Each vehicle's sensor stream is sorted by time to maintain temporal continuity. Critical for correct forward-fill imputation and rolling window calculations without cross-vehicle data contamination.

---

### Step 2 — Duplicate Removal

```python
# 1. Exact-row duplicates
df = df.drop_duplicates()

# 2. (car_id, timestamp) key duplicates — keep first
df = df.drop_duplicates(subset=['car_id', 'timestamp'], keep='first')
```

---

### Step 3 — Physical Constraint Enforcement (Clamping)

Instead of removing outlier rows (which would disproportionately delete rare failure events), **domain-driven clamping** is applied. Values outside physical bounds are clamped to the boundary.

| Column | Min Clamp | Max Clamp | Rationale |
|---|---|---|---|
| `speed_kmh` | 0 | 200 | Negative speed is physically impossible |
| `distance_m` | 0 | — | Negative distance is a sensor error |
| `soc_pct` | 0 | 100 | Battery charge cannot exceed 100% |
| `battery_voltage_v` | 250 | 500 | EV battery nominal range |
| `battery_temp_c` | -40 | 80 | Reasonable operating range |
| `motor_rpm` | 0 | 12,000 | Negative RPM is sensor noise |
| `motor_temp_c` | -20 | 120 | Wide allowance for thermal failures |
| `power_kw` | 0 | 50 | Physical power bounds |
| `ambient_temp_c` | -50 | 60 | Extreme climate range |
| `load_kg` | 0 | 1,000 | Vehicle payload limits |

> **Why clamping over deletion?** Deleting outlier rows would destroy rare failure-class records. Clamping preserves every row while enforcing physical realism.

---

### Step 4 — Missing Value Imputation

A two-stage strategy that respects temporal structure:

```python
# Stage 1: Per-vehicle forward-fill then backward-fill
df[numeric_cols] = (
    df.groupby('car_id')[numeric_cols]
    .transform(lambda g: g.ffill().bfill())
)

# Stage 2: Global column median fallback
# (handles edge cases where an entire vehicle has NaN for a column)
medians = df[numeric_cols].median()
df[numeric_cols] = df[numeric_cols].fillna(medians)
```

**Why per-vehicle ffill/bfill over global mean/median?**
Sensor readings are temporally correlated within each vehicle's driving session. Forward-filling from the same vehicle's previous reading is more physically meaningful than substituting a population average.

---

### Step 5 — Target Label Encoding

```python
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df['failure_type_encoded'] = le.fit_transform(df['failure_type'])
```

**Label Mapping (alphabetical encoding):**

| Class Name | Integer Label |
|---|---|
| `Critical_Overheating` | 0 |
| `Mechanical_Stress` | 1 |
| `Normal` | 2 |
| `Thermal_Overload` | 3 |
| `Voltage_Sag` | 4 |

---

## 5. Feature Engineering

After preprocessing, 13 new features are derived from the 10 raw sensor inputs, expanding the feature set from 13 to 26 columns (before removing `timestamp` and `car_id`). The final model uses **25 features**.

### 5a — Interaction & Ratio Features (5 features)

Physics-informed combinations that capture stress and degradation signals:

| Feature | Formula | Physical Meaning |
|---|---|---|
| `power_to_load_ratio` | `power_kw / (load_kg + 1)` | Power efficiency under load — stress indicator |
| `temp_diff_motor_ambient` | `motor_temp_c - ambient_temp_c` | Motor thermal excess above environment |
| `temp_diff_battery_ambient` | `battery_temp_c - ambient_temp_c` | Battery thermal stress above environment |
| `voltage_per_soc` | `battery_voltage_v / (soc_pct + 1)` | Voltage health relative to charge level |
| `speed_x_load` | `speed_kmh * load_kg` | Kinetic-mechanical stress proxy |

### 5b — Rolling Window Features (8 features)

Per-vehicle temporal trends that capture degradation patterns leading up to failures. Applied with `window=3` (covering 30 minutes of sensor history at 10-minute intervals).

| Base Column | Rolling Mean Feature | Rolling Std Feature |
|---|---|---|
| `motor_temp_c` | `motor_temp_c_roll_mean` | `motor_temp_c_roll_std` |
| `battery_temp_c` | `battery_temp_c_roll_mean` | `battery_temp_c_roll_std` |
| `battery_voltage_v` | `battery_voltage_v_roll_mean` | `battery_voltage_v_roll_std` |
| `power_kw` | `power_kw_roll_mean` | `power_kw_roll_std` |

```python
ROLLING_COLS = ['motor_temp_c', 'battery_temp_c', 'battery_voltage_v', 'power_kw']
ROLLING_WINDOW = 3

for col in ROLLING_COLS:
    grouped = df.groupby('car_id')[col]
    df[f'{col}_roll_mean'] = grouped.transform(
        lambda x: x.rolling(window=3, min_periods=1).mean()
    )
    df[f'{col}_roll_std'] = grouped.transform(
        lambda x: x.rolling(window=3, min_periods=1).std()
    )
```

> **Note on inference approximation:** At inference time, rolling window history is not available. The backend approximates:
> - `roll_mean = current sensor value` (stable-state assumption)
> - `roll_std = 0` (no variance = stable assumption)

### 5c — Temporal Features (2 features)

Extracted from the `timestamp` column to capture operational cycle patterns:

| Feature | Extraction | Range |
|---|---|---|
| `hour_of_day` | `timestamp.dt.hour` | 0–23 |
| `day_of_week` | `timestamp.dt.dayofweek` | 0 (Monday) – 6 (Sunday) |

### Final Feature List (25 Features Used for Training)

```
speed_kmh, distance_m, soc_pct, battery_voltage_v,
battery_temp_c, motor_rpm, motor_temp_c, power_kw,
ambient_temp_c, load_kg,
power_to_load_ratio, temp_diff_motor_ambient, temp_diff_battery_ambient,
voltage_per_soc, speed_x_load,
motor_temp_c_roll_mean, motor_temp_c_roll_std,
battery_temp_c_roll_mean, battery_temp_c_roll_std,
battery_voltage_v_roll_mean, battery_voltage_v_roll_std,
power_kw_roll_mean, power_kw_roll_std,
hour_of_day, day_of_week
```

---

## 6. Class Imbalance Handling

### Strategy: ADASYN (Adaptive Synthetic Oversampling)

Applied **only to the training split** after the 80/20 train-test split to prevent data leakage.

```python
from imblearn.over_sampling import ADASYN

adasyn = ADASYN(random_state=42)
X_train_resampled, y_train_resampled = adasyn.fit_resample(
    X_train_scaled, y_train
)
```

- **Before ADASYN:** 16,240 training samples
- **After ADASYN:** Minority classes synthetically upsampled to balance training distribution

> **Why ADASYN over SMOTE?**
> ADASYN focuses synthetic sample generation on regions where minority classes are harder to learn, adapting to local data density. This is more effective for the extreme imbalance present (444:1 ratio).

**Why NOT applied to the full dataset before the split?**
SMOTE/ADASYN generates synthetic samples by interpolating between existing points. If applied before the split, synthetic samples based on test-set points would leak into training — inflating evaluation metrics.

**Additional Strategies Used:**
- **Stratified Train-Test Split:** `stratify=y` ensures class proportions are preserved in both splits
- **Evaluation Metrics:** Macro-Averaged F1, Recall, and AUC used instead of accuracy to fairly evaluate minority class performance

---

## 7. Models Evaluated

Six models were trained and evaluated on the same preprocessed dataset with ADASYN-balanced training data:

| Model | Accuracy | Macro F1 | Macro Precision | Macro Recall | Macro AUC | Cohen's Kappa | MCC |
|---|---|---|---|---|---|---|---|
| **LightGBM (Selected)** | **0.9943** | **0.8910** | 0.8805 | **0.9034** | **0.9990** | **0.9233** | **0.9238** |
| XGBoost | 0.9936 | 0.8841 | 0.8666 | 0.9071 | 0.9986 | 0.9149 | 0.9162 |
| Random Forest | 0.9892 | 0.8460 | 0.8498 | 0.8576 | 0.9985 | 0.8603 | 0.8634 |
| SVC (RBF) | 0.9736 | 0.7028 | 0.6215 | 0.8756 | — | 0.7146 | 0.7360 |
| k-NN | 0.9567 | 0.6169 | 0.5394 | 0.8466 | — | 0.5891 | 0.6265 |
| Logistic Regression | 0.9347 | 0.5506 | 0.4735 | 0.8723 | — | 0.4975 | 0.5650 |

---

## 8. Selected Model — LightGBM

**LightGBM** (Light Gradient Boosting Machine) was selected as the production model due to its highest overall performance across all metrics.

### Hyperparameters

```python
import lightgbm as lgb

model = lgb.LGBMClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=-1,       # No depth limit — trees grow until leaf-stop criteria
    num_leaves=31,      # Controls tree complexity
    random_state=42,
    verbose=-1,
    n_jobs=-1,          # Parallel training on all CPU cores
)
```

### Training Pipeline (Full Sequence)

```
Raw Data (fleet_augmented.csv)
        |
        v
1.  Chronological sort [car_id, timestamp]
        |
        v
2.  Duplicate removal (exact rows + key duplicates)
        |
        v
3.  Physical constraint clamping (10 columns)
        |
        v
4.  Missing value imputation (per-vehicle ffill/bfill + median fallback)
        |
        v
5.  Feature engineering
    - 5 interaction features
    - 8 rolling window features (window=3)
    - 2 temporal features
        |
        v
6.  Target label encoding (LabelEncoder → integers 0–4)
        |
        v
7.  Stratified 80/20 Train-Test Split (random_state=42)
        |
        v
8.  StandardScaler fit on X_train only → transform both X_train and X_test
        |
        v
9.  ADASYN oversampling on X_train_scaled only
        |
        v
10. LightGBM training on X_train_resampled
        |
        v
11. Evaluation on X_test_scaled (unseen hold-out data)
        |
        v
12. Export: {scaler + model} → lgbm_pipeline.joblib
```

### Train-Test Split

| Split | Samples |
|---|---|
| Training (80%) | 16,240 |
| Test (20%) | 4,060 |

---

## 9. Model Evaluation & Results

### Cross-Validation (5-Fold Stratified)

| Metric | Train Mean | Train Std | Test Mean | Test Std |
|---|---|---|---|---|
| Accuracy | 1.0000 | 0.0000 | 0.9934 | 0.0006 |
| Macro F1 | 1.0000 | 0.0000 | 0.8797 | 0.0316 |
| Weighted F1 | 1.0000 | 0.0000 | 0.9935 | 0.0006 |
| Balanced Accuracy | 1.0000 | 0.0000 | 0.9026 | 0.0419 |

### Per-Class Performance (Test Set)

| Class | Precision | Recall | F1-Score |
|---|---|---|---|
| `Critical_Overheating` | 0.8375 | 0.9710 | 0.8993 |
| `Mechanical_Stress` | 0.9000 | 0.9000 | 0.9000 |
| `Normal` | 1.0000 | 0.9962 | 0.9981 |
| `Thermal_Overload` | 1.0000 | 0.9836 | 0.9918 |
| `Voltage_Sag` | 0.6667 | 0.6667 | 0.6667 |

### ROC-AUC Per Class (LightGBM)

| Class | AUC |
|---|---|
| `Critical_Overheating` | 0.9996 |
| `Mechanical_Stress` | 0.9998 |
| `Normal` | 0.9989 |
| `Thermal_Overload` | 1.0000 |
| `Voltage_Sag` | 0.9968 |
| **Macro Average** | **0.9990** |

### Confusion Matrix (Test Set)

|  | Pred: Critical | Pred: Mechanical | Pred: Normal | Pred: Thermal | Pred: Voltage |
|---|---|---|---|---|---|
| **True: Critical** | 67 | 0 | 2 | 0 | 0 |
| **True: Mechanical** | 1 | 9 | 0 | 0 | 0 |
| **True: Normal** | 12 | 1 | 3,895 | 0 | 3 |
| **True: Thermal** | 0 | 0 | 1 | 60 | 0 |
| **True: Voltage** | 0 | 0 | 3 | 0 | 6 |

---

## 10. Feature Importance

Feature importance measured by **gain** (total information gain from all splits using each feature):

| Rank | Feature | Display Name | Gain | Split |
|---|---|---|---|---|
| 1 | `battery_voltage_v_roll_mean` | Battery Voltage Trend | 0.1677 | 0.1567 |
| 2 | `motor_temp_c_roll_mean` | Motor Temp Trend | 0.1540 | 0.1423 |
| 3 | `battery_temp_c_roll_mean` | Battery Temp Trend | 0.1102 | 0.1189 |
| 4 | `power_kw_roll_mean` | Power Trend | 0.0832 | 0.0945 |
| 5 | `battery_temp_c` | Battery Temperature | 0.0615 | 0.0712 |
| 6 | `motor_temp_c` | Motor Temperature | 0.0580 | 0.0645 |
| 7 | `battery_voltage_v` | Battery Voltage | 0.0478 | 0.0534 |
| 8 | `temp_diff_motor_ambient` | Motor-Ambient Temp Diff | 0.0421 | 0.0334 |
| 9 | `power_kw` | Power Consumption | 0.0390 | 0.0312 |
| 10 | `temp_diff_battery_ambient` | Battery-Ambient Temp Diff | 0.0355 | 0.0298 |
| 11 | `voltage_per_soc` | Voltage per SoC | 0.0310 | 0.0276 |
| 12 | `soc_pct` | State of Charge | 0.0275 | 0.0345 |
| 13 | `speed_kmh` | Vehicle Speed | 0.0198 | 0.0267 |
| 14 | `motor_rpm` | Motor RPM | 0.0178 | 0.0234 |
| 15 | `ambient_temp_c` | Ambient Temperature | 0.0155 | 0.0213 |
| 16 | `power_to_load_ratio` | Power-to-Load Ratio | 0.0140 | 0.0198 |
| 17 | `load_kg` | Vehicle Load | 0.0125 | 0.0187 |
| 18 | `speed_x_load` | Speed x Load | 0.0112 | 0.0176 |
| 19 | `distance_m` | Distance Traveled | 0.0098 | 0.0165 |
| 20 | `battery_voltage_v_roll_std` | Battery Voltage Variability | 0.0085 | 0.0145 |
| 21 | `motor_temp_c_roll_std` | Motor Temp Variability | 0.0076 | 0.0132 |
| 22 | `hour_of_day` | Hour of Day | 0.0072 | 0.0156 |
| 23 | `battery_temp_c_roll_std` | Battery Temp Variability | 0.0068 | 0.0123 |
| 24 | `power_kw_roll_std` | Power Variability | 0.0060 | 0.0112 |
| 25 | `day_of_week` | Day of Week | 0.0058 | 0.0098 |

> **Key Insight:** The rolling mean features (`battery_voltage_v_roll_mean`, `motor_temp_c_roll_mean`, `battery_temp_c_roll_mean`) are the top 3 most predictive features — confirming that temporal trends matter more than instantaneous sensor readings for failure prediction.

---

## 11. Model Export & Serialization

The trained pipeline is serialized using `joblib` into a single dictionary bundle:

```python
pipeline_bundle = {
    "scaler": scaler,               # Fitted StandardScaler
    "model": model,                 # Trained LightGBMClassifier
    "feature_names": FEATURE_COLS,  # Ordered list of 25 features
    "class_names": CLASS_NAMES,     # 5 class name strings
    "label_mapping": LABEL_MAPPING  # {class_name: int} mapping
}
joblib.dump(pipeline_bundle, "model_weights/lgbm_pipeline.joblib")
```

**Exported Files:**

| File | Location | Size | Description |
|---|---|---|---|
| `lgbm_pipeline.joblib` | `model_weights/` and `backend/app/models/` | ~1.77 MB | Scaler + LightGBM model bundle |
| `model_metadata.json` | `model_weights/` and `backend/app/models/` | ~569 B | Performance metrics and configuration |

**model_metadata.json:**
```json
{
  "model_name": "LightGBM",
  "version": "1.0.0",
  "accuracy": 0.9943,
  "macro_f1": 0.8910,
  "macro_auc": 0.9990,
  "cohens_kappa": 0.9233,
  "mcc": 0.9238,
  "training_samples": 16240,
  "test_samples": 4060,
  "feature_count": 25,
  "classes": ["Critical_Overheating", "Mechanical_Stress", "Normal", "Thermal_Overload", "Voltage_Sag"],
  "label_mapping": {
    "Critical_Overheating": 0, "Mechanical_Stress": 1,
    "Normal": 2, "Thermal_Overload": 3, "Voltage_Sag": 4
  },
  "last_trained": "2026"
}
```

---

## 12. Backend API Architecture

The backend is a **FastAPI** application named **EVGuard API** (v1.0.0), built with Python 3.11 and served via **Uvicorn**.

### Directory Structure

```
backend/
├── Dockerfile
├── requirements.txt
└── app/
    ├── __init__.py
    ├── main.py                        # FastAPI app + lifespan management
    ├── core/
    │   ├── __init__.py
    │   └── config.py                  # Env-var configuration
    ├── models/
    │   ├── lgbm_pipeline.joblib       # Serialized scaler + model
    │   └── model_metadata.json        # Model performance metadata
    ├── routes/
    │   ├── __init__.py
    │   ├── predict.py                 # POST /api/v1/predict
    │   ├── health.py                  # GET  /api/v1/health
    │   └── model_info.py              # GET  /api/v1/model-info
    ├── schemas/
    │   ├── __init__.py
    │   ├── prediction_request.py      # Pydantic input schema (12 fields)
    │   └── prediction_response.py     # Pydantic output schema
    └── services/
        ├── __init__.py
        └── prediction_service.py      # Core inference logic
```

### Application Lifecycle

The model is loaded **once at startup** via FastAPI's `lifespan` context manager and stored on `app.state`. This avoids reloading the model on every request:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    service = PredictionService(model_path=MODEL_PATH, metadata_path=METADATA_PATH)
    service.load_model()
    app.state.prediction_service = service
    app.state.start_time = time.time()
    yield  # App runs here
```

### Configuration (Environment Variables)

| Variable | Default | Description |
|---|---|---|
| `ENV` | `development` | Environment mode |
| `PORT` | `8000` | Server port |
| `MODEL_PATH` | `./app/models/lgbm_pipeline.joblib` | Path to model file |
| `METADATA_PATH` | `./app/models/model_metadata.json` | Path to metadata file |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | CORS allowed origins |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

---

## 13. API Endpoints

### `POST /api/v1/predict`
Run a failure classification prediction.

**Request Body (12 raw sensor + temporal fields):**

| Field | Type | Validation Range | Description |
|---|---|---|---|
| `speed_kmh` | float | 0–200 | Vehicle speed in km/h |
| `distance_m` | float | >= 0 | Total odometer distance in meters |
| `soc_pct` | float | 0–100 | State of Charge (%) |
| `battery_voltage_v` | float | 250–500 | Battery voltage in Volts |
| `battery_temp_c` | float | -40–80 | Battery temperature in Celsius |
| `motor_rpm` | float | 0–12,000 | Motor RPM |
| `motor_temp_c` | float | -20–120 | Motor temperature in Celsius |
| `power_kw` | float | 0–50 | Power consumption in kW |
| `ambient_temp_c` | float | -50–60 | Ambient temperature in Celsius |
| `load_kg` | float | 0–1,000 | Vehicle load in kg |
| `hour_of_day` | int | 0–23 | Hour of day |
| `day_of_week` | int | 0–6 | Day of week (0=Monday, 6=Sunday) |

---

### `GET /api/v1/health`
Returns service health status, model load state, and uptime in seconds.

---

### `GET /api/v1/model-info`
Returns full model metadata: per-class metrics, feature importance rankings, confusion matrix, cross-validation results, and per-class ROC-AUC.

---

### `GET /api/v1/sample-inputs`
Returns three preset test scenarios:
- **Healthy EV** — Normal operating conditions (speed=65, soc=78, motor_temp=42)
- **Thermal Warning** — Elevated temperatures (motor_temp=88, battery_temp=58, power=38)
- **Critical Failure Risk** — Multiple systems in danger zone (motor_temp=112, soc=12, voltage=298)

---

### `GET /`
Root endpoint — returns API name, version, and docs URL.

---

## 14. Inference Pipeline

When a prediction request arrives, `PredictionService.predict()` executes:

```
12 raw inputs (from POST /api/v1/predict body)
        |
        v
Step 1: Compute 13 derived features server-side
        - 5 interaction features (power_to_load_ratio, temp diffs, voltage_per_soc, speed_x_load)
        - 8 rolling approximations (roll_mean = current value, roll_std = 0)
        |
        v
Step 2: Assemble ordered feature vector [25 features in FEATURE_ORDER]
        |
        v
Step 3: StandardScaler.transform(feature_array)
        |
        v
Step 4: LightGBM.predict()       -> predicted_label (int 0–4)
         LightGBM.predict_proba() -> probability array [5 floats, sums to 1.0]
        |
        v
Step 5: Map label -> class name and risk level
        |
        v
Step 6: Compute feature contributions
        (importance score + status per feature: normal / warning / critical)
        |
        v
Step 7: Generate actionable recommendations based on class + feature statuses
        |
        v
Step 8: Return PredictionResponse JSON
```

### Feature Status Evaluation

Each feature is evaluated against its normal operating range:

| Status | Condition |
|---|---|
| `normal` | Value is within the normal range bounds |
| `warning` | Value is 0–10% outside the normal range boundary |
| `critical` | Value is > 10% outside the normal range boundary |

---

## 15. Output Structure

A full prediction response (`PredictionResponse`) JSON contains:

```json
{
  "predicted_class": "Normal",
  "predicted_label": 2,
  "probabilities": {
    "Critical_Overheating": 0.0012,
    "Mechanical_Stress": 0.0003,
    "Normal": 0.9945,
    "Thermal_Overload": 0.0025,
    "Voltage_Sag": 0.0015
  },
  "risk_level": "low",
  "confidence": 0.9945,
  "feature_contributions": [
    {
      "feature": "battery_voltage_v_roll_mean",
      "display_name": "Battery Voltage Trend",
      "value": 390.0,
      "importance": 0.1677,
      "status": "normal",
      "normal_range": [340, 420]
    }
  ],
  "recommendations": [
    {
      "severity": "INFO",
      "component": "System",
      "message": "All systems operating within normal parameters.",
      "action": "Continue regular monitoring schedule."
    }
  ],
  "model_version": "1.0.0",
  "prediction_id": "uuid-v4-string",
  "timestamp": "2026-07-08T07:00:00+00:00"
}
```

### Risk Level Mapping

| Predicted Class | Risk Level |
|---|---|
| `Normal` | `low` |
| `Mechanical_Stress` | `medium` |
| `Thermal_Overload` | `high` |
| `Voltage_Sag` | `high` |
| `Critical_Overheating` | `critical` |

### Recommendation Severity Levels

| Severity | Trigger |
|---|---|
| `INFO` | Normal prediction — routine monitoring message |
| `WARNING` | A feature value is 0–10% outside its normal operating range |
| `CRITICAL` | A feature value is >10% outside its normal range OR a high/critical class predicted |

---

## 16. Deployment

### Local Development (Docker Compose)

```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - ENV=development
      - MODEL_PATH=./app/models/lgbm_pipeline.joblib
      - METADATA_PATH=./app/models/model_metadata.json
      - ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    depends_on: [backend]
    environment:
      - VITE_API_URL=http://localhost:8000
```

### Production (Render Cloud)

Deployed via `render.yaml`:
- **Build command:** `pip install -r backend/requirements.txt`
- **Start command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Python version:** 3.11.0
- **Log level:** `WARNING` (production mode)

### Docker Container Details

- **Base image:** `python:3.11-slim`
- **System dependency:** `libgomp1` (required by LightGBM for OpenMP multi-threading)
- **Health check:** `GET /api/v1/health` every 30 seconds (timeout 10s, 3 retries)
- **Exposed port:** `8000`

---

## 17. Technology Stack

### Machine Learning & Data Science

| Library | Min Version | Purpose |
|---|---|---|
| `pandas` | 2.0.0 | Data loading, manipulation, feature engineering |
| `numpy` | 1.24.0 | Numerical operations, array handling |
| `scikit-learn` | 1.3.0 | StandardScaler, LabelEncoder, train-test split, metrics |
| `lightgbm` | 4.0.0 | Primary classification model (production) |
| `xgboost` | 2.0.0 | Alternative model (evaluated, not selected) |
| `imbalanced-learn` | 0.11.0 | ADASYN oversampling for class imbalance |
| `joblib` | 1.3.0 | Model serialization and deserialization |
| `scipy` | 1.10.0 | Statistical analysis (Z-score outlier detection in EDA) |
| `matplotlib` | 3.7.0 | Visualizations in notebooks |
| `seaborn` | 0.12.0 | Statistical plots in notebooks |

### Backend API

| Library | Min Version | Purpose |
|---|---|---|
| `fastapi` | 0.104.0 | REST API framework |
| `uvicorn[standard]` | 0.24.0 | ASGI server |
| `pydantic` | 2.0.0 | Request/response schema validation |
| `python-dotenv` | 1.0.0 | Environment variable management |

### Infrastructure

| Tool | Purpose |
|---|---|
| Docker | Containerization of backend service |
| Docker Compose | Local multi-service development orchestration |
| Render | Cloud deployment platform (backend API) |
| Netlify | Frontend hosting |
| GitHub | Version control |
| Jupyter Notebook | ML pipeline development and experimentation |

---

*Documentation compiled from a full scan of the `Capstone-Project-DEPI` repository, including all Jupyter notebooks (Phases 1–3), `export_model.py`, `model_metadata.json`, backend source code (`main.py`, `prediction_service.py`, schemas, routes, config), `docker-compose.yml`, `render.yaml`, and `requirements.txt`.*
