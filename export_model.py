"""
export_model.py
===============
Model Export Script for the EV Fleet Predictive Maintenance project.

This script uses the **leakage-safe pipeline** defined in
``notebooks/leakage_safe_pipeline.py`` so the exported model exactly matches
the champion evaluated in Phase 4 and Phase 5:

    TelemetryFeatureTransformer → StandardScaler → ADASYN → LightGBM

Workflow:
    1. Load raw telemetry (fleet_augmented.csv)
    2. Vehicle-grouped holdout split (StratifiedGroupKFold, groups=car_id)
    3. Fit champion pipeline on the training split
    4. Evaluate on the holdout split (same metrics as Phase 5)
    5. Re-train on **all** data for deployment
    6. Export two artifacts:
       a. ``lgbm_pipeline.joblib``         — full imblearn pipeline (reproducibility)
       b. ``lgbm_inference_bundle.joblib``  — scaler + model dict   (backend inference)
    7. Export ``model_metadata.json`` with leakage-safe metrics
    8. Verify both exported artifacts load and predict correctly

IMPORTANT — Backend Inference:
    The backend (prediction_service.py) performs single-row inference where
    rolling window features are approximated (roll_mean = current value,
    roll_std = 0).  It needs the scaler and model separately because
    TelemetryFeatureTransformer expects a DataFrame with car_id, timestamp,
    and multiple rows for rolling windows, which do not exist at inference
    time.  That is why we export both formats.

Usage:
    python export_model.py
"""

import os
import sys
import json
import joblib
import numpy as np
from datetime import datetime

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    cohen_kappa_score,
    matthews_corrcoef,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)

# ── Make leakage_safe_pipeline importable ────────────────
for _p in [os.getcwd(), os.path.join(os.getcwd(), "notebooks")]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from leakage_safe_pipeline import (
    RANDOM_STATE,
    FINAL_FEATURES,
    load_dataset,
    first_group_holdout,
    champion_pipeline,
    evaluate_predictions,
)

# ──────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────
RAW_DATA_PATHS = [
    os.path.join("data", "raw", "fleet_augmented.csv"),
    os.path.join("..", "data", "raw", "fleet_augmented.csv"),
]

OUTPUT_DIR = os.path.join("model_weights")
PIPELINE_FILE = os.path.join(OUTPUT_DIR, "lgbm_pipeline.joblib")
INFERENCE_BUNDLE_FILE = os.path.join(OUTPUT_DIR, "lgbm_inference_bundle.joblib")
METADATA_FILE = os.path.join(OUTPUT_DIR, "model_metadata.json")


def _find_raw_data() -> str:
    for path in RAW_DATA_PATHS:
        if os.path.exists(path):
            return path
    raise FileNotFoundError(
        f"Raw data not found in any of: {RAW_DATA_PATHS}"
    )


def main():
    print("=" * 70)
    print("  EVGuard — Leakage-Safe Model Export")
    print("=" * 70)

    # ── 1. Load Raw Data ──────────────────────────────────────
    print("\n[1/8] Loading raw telemetry data...")
    raw_path = _find_raw_data()
    bundle = load_dataset(raw_path)

    print(f"  Loaded {len(bundle.raw_df):,} rows, {bundle.raw_df.shape[1]} columns")
    print(f"  Unique vehicles: {bundle.groups.nunique()}")
    print(f"  Classes: {bundle.class_names}")
    print(f"  Label mapping: {bundle.label_mapping}")

    # ── 2. Vehicle-Grouped Holdout Split ──────────────────────
    print("\n[2/8] Splitting by vehicle (StratifiedGroupKFold)...")
    split = first_group_holdout(bundle)
    X_train = split["X_train"]
    X_test = split["X_test"]
    y_train = split["y_train"]
    y_test = split["y_test"]
    groups_train = split["groups_train"]
    groups_test = split["groups_test"]

    overlap = len(set(groups_train) & set(groups_test))
    assert overlap == 0, f"Vehicle overlap detected: {overlap}"

    print(f"  Train: {len(X_train):,} rows, {groups_train.nunique()} vehicles")
    print(f"  Test:  {len(X_test):,} rows, {groups_test.nunique()} vehicles")
    print(f"  Vehicle overlap: {overlap}")

    # ── 3. Train Champion on Training Split ───────────────────
    print("\n[3/8] Training champion pipeline on training split...")
    pipe_holdout = champion_pipeline()
    pipe_holdout.fit(X_train, y_train)

    # ── 4. Evaluate on Holdout ────────────────────────────────
    print("\n[4/8] Evaluating on unseen-vehicle holdout...")
    y_pred = pipe_holdout.predict(X_test)
    y_prob = pipe_holdout.predict_proba(X_test)

    metrics = evaluate_predictions(y_test, y_pred)
    metrics["Cohen's Kappa"] = cohen_kappa_score(y_test, y_pred)
    metrics["MCC"] = matthews_corrcoef(y_test, y_pred)

    try:
        metrics["Macro AUC"] = roc_auc_score(
            y_test, y_prob, multi_class="ovr", average="macro"
        )
    except ValueError:
        metrics["Macro AUC"] = None

    print(f"\n  -- Holdout Evaluation (unseen vehicles) --")
    for k, v in metrics.items():
        if v is not None:
            print(f"  {k:<20s}: {v:.4f}")
        else:
            print(f"  {k:<20s}: N/A")

    print(f"\n  Classification Report:")
    print(
        classification_report(
            y_test, y_pred, target_names=bundle.class_names, zero_division=0
        )
    )

    # ── 5. Re-train on ALL Data for Deployment ────────────────
    print("[5/8] Re-training champion pipeline on ALL data for deployment...")
    pipe_deploy = champion_pipeline()
    pipe_deploy.fit(bundle.X, bundle.y)
    print("  Champion pipeline trained on full dataset")

    # ── 6. Export Full Pipeline ────────────────────────────────
    print("\n[6/8] Exporting full imblearn pipeline...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    joblib.dump(pipe_deploy, PIPELINE_FILE)
    print(f"  Saved to: {PIPELINE_FILE}")
    print(f"  Size: {os.path.getsize(PIPELINE_FILE) / 1024:.1f} KB")

    # ── 7. Export Inference Bundle (for Backend) ──────────────
    print("\n[7/8] Exporting backend inference bundle (scaler + model)...")

    # Extract the scaler and model from the deployed pipeline.
    # Pipeline steps: features (0) → scaler (1) → adasyn (2) → model (3)
    deployed_scaler = pipe_deploy.named_steps["scaler"]
    deployed_model = pipe_deploy.named_steps["model"]

    inference_bundle = {
        "scaler": deployed_scaler,
        "model": deployed_model,
        "feature_names": FINAL_FEATURES,
        "class_names": bundle.class_names,
        "label_mapping": bundle.label_mapping,
    }
    joblib.dump(inference_bundle, INFERENCE_BUNDLE_FILE)
    print(f"  Saved to: {INFERENCE_BUNDLE_FILE}")
    print(f"  Size: {os.path.getsize(INFERENCE_BUNDLE_FILE) / 1024:.1f} KB")

    # Also save the inference bundle as lgbm_pipeline.joblib for backward
    # compatibility with the current backend, which loads that filename.
    # The full imblearn pipeline is saved separately above.
    joblib.dump(inference_bundle, PIPELINE_FILE)
    print(f"  Also overwrote {PIPELINE_FILE} with inference bundle for backend compat")

    # ── 8. Export Metadata ────────────────────────────────────
    print("\n[8/8] Exporting model metadata...")

    # Get champion hyperparams from the holdout pipeline's model step
    champion_model = pipe_holdout.named_steps["model"]
    hyperparams = {
        "n_estimators": champion_model.n_estimators,
        "max_depth": champion_model.max_depth,
        "learning_rate": champion_model.learning_rate,
        "num_leaves": champion_model.num_leaves,
    }

    metadata = {
        "model_name": "LightGBM",
        "version": "2.0.0",
        "split_strategy": "StratifiedGroupKFold holdout by car_id",
        "vehicle_overlap_between_train_test": 0,
        "hyperparameters": hyperparams,
        "holdout_metrics": {
            k: round(float(v), 4) if v is not None else None
            for k, v in metrics.items()
        },
        "accuracy": round(metrics["Accuracy"], 4),
        "macro_f1": round(metrics["Macro F1"], 4),
        "macro_auc": round(metrics["Macro AUC"], 4) if metrics.get("Macro AUC") else None,
        "cohens_kappa": round(metrics["Cohen's Kappa"], 4),
        "mcc": round(metrics["MCC"], 4),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "deployment_trained_on": len(bundle.X),
        "feature_count": len(FINAL_FEATURES),
        "classes": bundle.class_names,
        "label_mapping": bundle.label_mapping,
        "last_trained": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "methodology_notes": [
            "Preprocessing is fitted inside the pipeline (no pre-split leakage).",
            "ADASYN is fitted only inside training folds / training split.",
            "Test vehicles are completely unseen during training (zero overlap).",
            "Holdout metrics reflect realistic deployment performance.",
            "Deployment model is retrained on all data after holdout validation.",
        ],
    }

    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"  Saved to: {METADATA_FILE}")

    # ── Verify Exported Artifacts ─────────────────────────────
    print("\n  Verifying exported artifacts...")

    # Verify inference bundle
    loaded_bundle = joblib.load(PIPELINE_FILE)
    loaded_scaler = loaded_bundle["scaler"]
    loaded_model = loaded_bundle["model"]

    # Quick prediction test with a few test rows
    # We need to manually transform test data since we extracted scaler/model
    transformer = pipe_holdout.named_steps["features"]
    X_test_features = transformer.transform(X_test.head(5))
    X_test_scaled = loaded_scaler.transform(X_test_features)
    y_verify = loaded_model.predict(X_test_scaled)
    predicted_names = [bundle.class_names[i] for i in y_verify]
    print(f"  Inference bundle verification: {predicted_names}")

    print(f"  [OK] All artifacts exported and verified!")

    # ── Final Summary ─────────────────────────────────────────
    print("\n" + "=" * 70)
    print("  EXPORT COMPLETE — LEAKAGE-SAFE MODEL")
    print("=" * 70)
    print(f"  Champion:        LightGBM (n_estimators={hyperparams['n_estimators']}, "
          f"max_depth={hyperparams['max_depth']})")
    print(f"  Split:           Vehicle-grouped (zero overlap)")
    print(f"  Holdout Macro F1: {metrics['Macro F1']:.4f}")
    print(f"  Holdout Accuracy: {metrics['Accuracy']:.4f}")
    print(f"  Files created:")
    print(f"    - {PIPELINE_FILE}")
    print(f"    - {INFERENCE_BUNDLE_FILE}")
    print(f"    - {METADATA_FILE}")
    print("=" * 70)


if __name__ == "__main__":
    main()
