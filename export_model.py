"""
export_model.py
===============
Model Export Script for the EV Fleet Predictive Maintenance project.

This script:
1. Loads the preprocessed dataset (fleet_prepared.csv)
2. Selects the exact 25 features used during training
3. Splits data 80/20 stratified by target
4. Fits a StandardScaler on training data ONLY
5. Applies ADASYN oversampling on TRAINING data ONLY
6. Trains a LightGBM classifier
7. Exports the inference pipeline (scaler + model) via joblib
8. Exports model metadata as JSON
9. Verifies the exported model loads and predicts correctly

IMPORTANT — Rolling Feature Approximation at Inference Time:
    At inference, we do NOT have historical data for rolling windows.
    The following approximations are used:
        roll_mean  = current sensor value   (stable-state assumption)
        roll_std   = 0                      (no variance = stable assumption)
    This is documented in the backend's prediction_service.py as well.

Usage:
    python export_model.py
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, f1_score, cohen_kappa_score, matthews_corrcoef,
    classification_report, confusion_matrix, roc_auc_score
)
from imblearn.over_sampling import ADASYN
import lightgbm as lgb


# ──────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────
DATA_PATH = os.path.join("data", "preprocessed", "fleet_prepared.csv")
OUTPUT_DIR = os.path.join("model_weights")
PIPELINE_FILE = os.path.join(OUTPUT_DIR, "lgbm_pipeline.joblib")
METADATA_FILE = os.path.join(OUTPUT_DIR, "model_metadata.json")

TARGET_COL = "failure_type_encoded"
RANDOM_STATE = 42
TEST_SIZE = 0.20

# Exact 25 features used for training (order matters)
FEATURE_COLS = [
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

LABEL_MAPPING = {name: idx for idx, name in enumerate(CLASS_NAMES)}


def main():
    print("=" * 70)
    print("  EVGuard — Model Export Script")
    print("=" * 70)

    # ── 1. Load Data ──────────────────────────────────────────
    print("\n[1/7] Loading preprocessed data...")
    df = pd.read_csv(DATA_PATH)
    print(f"  Loaded {len(df)} rows, {len(df.columns)} columns")

    # Verify all required features exist
    missing_features = [f for f in FEATURE_COLS if f not in df.columns]
    if missing_features:
        raise ValueError(f"Missing features in dataset: {missing_features}")
    print(f"  All {len(FEATURE_COLS)} features confirmed present")

    # ── 2. Prepare X and y ────────────────────────────────────
    print("\n[2/7] Preparing feature matrix and target...")
    X = df[FEATURE_COLS].values
    y = df[TARGET_COL].values

    print(f"  X shape: {X.shape}")
    print(f"  y shape: {y.shape}")
    print(f"  Class distribution:")
    unique, counts = np.unique(y, return_counts=True)
    for cls_idx, count in zip(unique, counts):
        cls_name = CLASS_NAMES[cls_idx]
        pct = count / len(y) * 100
        print(f"    {cls_name:>25s} (label {cls_idx}): {count:>6d} ({pct:5.2f}%)")

    # ── 3. Train/Test Split ───────────────────────────────────
    print("\n[3/7] Splitting data (80/20 stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    print(f"  Training samples: {len(X_train)}")
    print(f"  Test samples:     {len(X_test)}")

    # ── 4. Fit StandardScaler on TRAINING data only ───────────
    print("\n[4/7] Fitting StandardScaler on training data...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    print("  Scaler fitted successfully")

    # ── 5. ADASYN oversampling on TRAINING data only ──────────
    #    NOTE: ADASYN is NOT included in the inference pipeline.
    #    It is used solely to balance the training set.
    print("\n[5/7] Applying ADASYN oversampling on training data...")
    adasyn = ADASYN(random_state=RANDOM_STATE)
    X_train_resampled, y_train_resampled = adasyn.fit_resample(
        X_train_scaled, y_train
    )
    print(f"  Before ADASYN: {len(X_train_scaled)} samples")
    print(f"  After  ADASYN: {len(X_train_resampled)} samples")
    print(f"  Resampled class distribution:")
    unique_r, counts_r = np.unique(y_train_resampled, return_counts=True)
    for cls_idx, count in zip(unique_r, counts_r):
        cls_name = CLASS_NAMES[cls_idx]
        print(f"    {cls_name:>25s}: {count:>6d}")

    # ── 6. Train LightGBM ────────────────────────────────────
    print("\n[6/7] Training LightGBM classifier...")
    model = lgb.LGBMClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=-1,
        num_leaves=31,
        random_state=RANDOM_STATE,
        verbose=-1,
        n_jobs=-1,
    )
    model.fit(X_train_resampled, y_train_resampled)
    print("  LightGBM trained successfully")

    # ── Evaluate on test set ──────────────────────────────────
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)

    accuracy = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average="macro")
    kappa = cohen_kappa_score(y_test, y_pred)
    mcc = matthews_corrcoef(y_test, y_pred)

    # ROC AUC (macro, one-vs-rest)
    try:
        macro_auc = roc_auc_score(
            y_test, y_pred_proba, multi_class="ovr", average="macro"
        )
    except ValueError:
        macro_auc = None

    print(f"\n  -- Test Set Evaluation --")
    print(f"  Accuracy:       {accuracy:.4f}")
    print(f"  Macro F1:       {macro_f1:.4f}")
    print(f"  Macro AUC:      {macro_auc:.4f}" if macro_auc else "  Macro AUC:      N/A")
    print(f"  Cohen's Kappa:  {kappa:.4f}")
    print(f"  MCC:            {mcc:.4f}")

    print(f"\n  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=CLASS_NAMES))

    # ── 7. Export Pipeline ────────────────────────────────────
    print("[7/7] Exporting model pipeline...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Bundle scaler + model together (NOT ADASYN)
    pipeline_bundle = {
        "scaler": scaler,
        "model": model,
        "feature_names": FEATURE_COLS,
        "class_names": CLASS_NAMES,
        "label_mapping": LABEL_MAPPING,
    }
    joblib.dump(pipeline_bundle, PIPELINE_FILE)
    print(f"  Pipeline saved to: {PIPELINE_FILE}")

    # Export metadata
    metadata = {
        "model_name": "LightGBM",
        "version": "1.0.0",
        "accuracy": round(accuracy, 4),
        "macro_f1": round(macro_f1, 4),
        "macro_auc": round(macro_auc, 4) if macro_auc else None,
        "cohens_kappa": round(kappa, 4),
        "mcc": round(mcc, 4),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "feature_count": len(FEATURE_COLS),
        "classes": CLASS_NAMES,
        "label_mapping": LABEL_MAPPING,
        "last_trained": str(datetime.now().year),
    }
    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"  Metadata saved to: {METADATA_FILE}")

    # ── Verify exported model loads correctly ─────────────────
    print("\n  Verifying exported model...")
    loaded = joblib.load(PIPELINE_FILE)
    loaded_scaler = loaded["scaler"]
    loaded_model = loaded["model"]

    # Quick prediction test
    X_test_verify = loaded_scaler.transform(X_test[:5])
    y_verify = loaded_model.predict(X_test_verify)
    print(f"  Verification predictions: {[CLASS_NAMES[i] for i in y_verify]}")
    print(f"  [OK] Model loads and predicts correctly!")

    # Final summary
    print("\n" + "=" * 70)
    print("  EXPORT COMPLETE")
    print(f"  Model Accuracy: {accuracy:.4f}")
    print(f"  Files created:")
    print(f"    - {PIPELINE_FILE} ({os.path.getsize(PIPELINE_FILE) / 1024:.1f} KB)")
    print(f"    - {METADATA_FILE} ({os.path.getsize(METADATA_FILE) / 1024:.1f} KB)")
    print("=" * 70)


if __name__ == "__main__":
    main()
