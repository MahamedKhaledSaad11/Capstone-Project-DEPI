"""Leakage-safe EV telemetry modeling helpers.

The notebooks use this module so preprocessing, feature engineering, scaling,
and resampling can be fitted inside the model/CV pipeline instead of being
computed once on the full dataset.
"""

from __future__ import annotations

import os
from dataclasses import dataclass

import numpy as np
import pandas as pd
from imblearn.over_sampling import ADASYN
from imblearn.pipeline import Pipeline as ImbPipeline
from lightgbm import LGBMClassifier
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from xgboost import XGBClassifier


TARGET_COL = "failure_type"
GROUP_COL = "car_id"
RANDOM_STATE = 42
N_SPLITS = 5

RAW_NUMERIC_COLS = [
    "speed_kmh",
    "distance_m",
    "soc_pct",
    "battery_voltage_v",
    "battery_temp_c",
    "motor_rpm",
    "motor_temp_c",
    "power_kw",
    "ambient_temp_c",
    "load_kg",
]

CLAMP_RULES = {
    "speed_kmh": {"min": 0, "max": 200},
    "distance_m": {"min": 0, "max": None},
    "soc_pct": {"min": 0, "max": 100},
    "battery_voltage_v": {"min": 250, "max": 500},
    "battery_temp_c": {"min": -40, "max": 80},
    "motor_rpm": {"min": 0, "max": 12000},
    "motor_temp_c": {"min": -20, "max": 120},
    "power_kw": {"min": 0, "max": 50},
    "ambient_temp_c": {"min": -50, "max": 60},
    "load_kg": {"min": 0, "max": 1000},
}

FINAL_FEATURES = [
    "speed_kmh",
    "distance_m",
    "soc_pct",
    "battery_voltage_v",
    "battery_temp_c",
    "motor_rpm",
    "motor_temp_c",
    "power_kw",
    "ambient_temp_c",
    "load_kg",
    "power_to_load_ratio",
    "temp_diff_motor_ambient",
    "temp_diff_battery_ambient",
    "voltage_per_soc",
    "speed_x_load",
    "motor_temp_c_roll_mean",
    "motor_temp_c_roll_std",
    "battery_temp_c_roll_mean",
    "battery_temp_c_roll_std",
    "battery_voltage_v_roll_mean",
    "battery_voltage_v_roll_std",
    "power_kw_roll_mean",
    "power_kw_roll_std",
    "hour_of_day",
    "day_of_week",
]


class TelemetryFeatureTransformer(BaseEstimator, TransformerMixin):
    """Build model features without leaking validation/test information.

    The transformer stores medians during ``fit`` and uses those medians during
    ``transform``. Row order is preserved after per-vehicle chronological
    operations so labels remain aligned with features.
    """

    def __init__(self, rolling_window: int = 3):
        self.rolling_window = rolling_window

    def fit(self, X: pd.DataFrame, y=None):
        prepared = self._prepare_base(X, fit_mode=True)
        self.medians_ = prepared[RAW_NUMERIC_COLS].median()
        self.feature_names_out_ = np.array(FINAL_FEATURES, dtype=object)
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        prepared = self._prepare_base(X, fit_mode=False)
        prepared[RAW_NUMERIC_COLS] = prepared[RAW_NUMERIC_COLS].fillna(self.medians_)
        featured = self._add_features(prepared)
        return featured[FINAL_FEATURES]

    def get_feature_names_out(self, input_features=None):
        return self.feature_names_out_

    def _prepare_base(self, X: pd.DataFrame, fit_mode: bool) -> pd.DataFrame:
        df = X.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df["_row_order"] = np.arange(len(df))

        for col, bounds in CLAMP_RULES.items():
            lo = bounds["min"]
            hi = bounds["max"]
            if lo is not None:
                df[col] = df[col].mask(df[col] < lo, lo)
            if hi is not None:
                df[col] = df[col].mask(df[col] > hi, hi)

        df = df.sort_values([GROUP_COL, "timestamp"])
        df[RAW_NUMERIC_COLS] = df.groupby(GROUP_COL)[RAW_NUMERIC_COLS].transform(
            lambda g: g.ffill()
        )
        if fit_mode:
            df[RAW_NUMERIC_COLS] = df[RAW_NUMERIC_COLS].fillna(
                df[RAW_NUMERIC_COLS].median()
            )

        return df.sort_values("_row_order").drop(columns=["_row_order"])

    def _add_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df["_row_order"] = np.arange(len(df))
        df = df.sort_values([GROUP_COL, "timestamp"])

        df["power_to_load_ratio"] = df["power_kw"] / (df["load_kg"] + 1)
        df["temp_diff_motor_ambient"] = df["motor_temp_c"] - df["ambient_temp_c"]
        df["temp_diff_battery_ambient"] = df["battery_temp_c"] - df["ambient_temp_c"]
        df["voltage_per_soc"] = df["battery_voltage_v"] / (df["soc_pct"] + 1)
        df["speed_x_load"] = df["speed_kmh"] * df["load_kg"]

        for col in ["motor_temp_c", "battery_temp_c", "battery_voltage_v", "power_kw"]:
            grouped = df.groupby(GROUP_COL)[col]
            df[f"{col}_roll_mean"] = grouped.transform(
                lambda s: s.rolling(self.rolling_window, min_periods=1).mean()
            )
            df[f"{col}_roll_std"] = grouped.transform(
                lambda s: s.rolling(self.rolling_window, min_periods=1).std()
            ).fillna(0)

        df["hour_of_day"] = df["timestamp"].dt.hour
        df["day_of_week"] = df["timestamp"].dt.dayofweek
        return df.sort_values("_row_order").drop(columns=["_row_order"])


@dataclass
class DatasetBundle:
    raw_df: pd.DataFrame
    X: pd.DataFrame
    y: pd.Series
    groups: pd.Series
    class_names: list[str]
    label_mapping: dict[str, int]
    label_mapping_inv: dict[int, str]


def load_dataset(raw_data_path: str) -> DatasetBundle:
    raw_df = pd.read_csv(raw_data_path)
    raw_df["timestamp"] = pd.to_datetime(raw_df["timestamp"])
    raw_df = raw_df.sort_values([GROUP_COL, "timestamp"]).reset_index(drop=True)

    class_names = sorted(raw_df[TARGET_COL].astype(str).unique())
    label_mapping = {name: idx for idx, name in enumerate(class_names)}
    label_mapping_inv = {idx: name for name, idx in label_mapping.items()}

    X = raw_df.drop(columns=[TARGET_COL])
    y = raw_df[TARGET_COL].astype(str).map(label_mapping)
    groups = raw_df[GROUP_COL].astype(str)

    return DatasetBundle(
        raw_df=raw_df,
        X=X,
        y=y,
        groups=groups,
        class_names=class_names,
        label_mapping=label_mapping,
        label_mapping_inv=label_mapping_inv,
    )


def first_group_holdout(bundle: DatasetBundle, random_state: int = RANDOM_STATE):
    splitter = StratifiedGroupKFold(
        n_splits=N_SPLITS, shuffle=True, random_state=random_state
    )
    train_idx, test_idx = next(splitter.split(bundle.X, bundle.y, groups=bundle.groups))
    return {
        "X_train": bundle.X.iloc[train_idx].copy(),
        "X_test": bundle.X.iloc[test_idx].copy(),
        "y_train": bundle.y.iloc[train_idx].copy(),
        "y_test": bundle.y.iloc[test_idx].copy(),
        "groups_train": bundle.groups.iloc[train_idx].copy(),
        "groups_test": bundle.groups.iloc[test_idx].copy(),
    }


def make_pipeline(model, random_state: int = RANDOM_STATE) -> ImbPipeline:
    return ImbPipeline(
        steps=[
            ("features", TelemetryFeatureTransformer(rolling_window=3)),
            ("scaler", StandardScaler()),
            ("adasyn", ADASYN(random_state=random_state, n_neighbors=3)),
            ("model", model),
        ]
    )


def candidate_models(random_state: int = RANDOM_STATE):
    return {
        "Logistic Regression": LogisticRegression(
            max_iter=5000, class_weight="balanced", random_state=random_state
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=300,
            class_weight="balanced_subsample",
            random_state=random_state,
            n_jobs=-1,
        ),
        "SVC (RBF)": SVC(
            kernel="rbf",
            class_weight="balanced",
            probability=True,
            random_state=random_state,
        ),
        "k-NN": KNeighborsClassifier(n_neighbors=5, weights="distance", n_jobs=-1),
        "XGBoost": XGBClassifier(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.9,
            eval_metric="mlogloss",
            random_state=random_state,
            n_jobs=-1,
        ),
        "LightGBM": LGBMClassifier(
            n_estimators=300,
            max_depth=10,
            learning_rate=0.05,
            random_state=random_state,
            verbose=-1,
            n_jobs=-1,
        ),
    }


def champion_pipeline(random_state: int = RANDOM_STATE) -> ImbPipeline:
    return make_pipeline(
        LGBMClassifier(
            n_estimators=300,
            max_depth=10,
            learning_rate=0.05,
            random_state=random_state,
            verbose=-1,
            n_jobs=-1,
        ),
        random_state=random_state,
    )


def evaluate_predictions(y_true, y_pred) -> dict[str, float]:
    return {
        "Accuracy": accuracy_score(y_true, y_pred),
        "Balanced Accuracy": balanced_accuracy_score(y_true, y_pred),
        "Macro Precision": precision_score(
            y_true, y_pred, average="macro", zero_division=0
        ),
        "Macro Recall": recall_score(y_true, y_pred, average="macro", zero_division=0),
        "Macro F1": f1_score(y_true, y_pred, average="macro", zero_division=0),
        "Weighted F1": f1_score(y_true, y_pred, average="weighted", zero_division=0),
    }


def param_grids():
    return {
        "Random Forest": {
            "model__n_estimators": [200, 300],
            "model__max_depth": [10, 20, None],
            "model__min_samples_leaf": [1, 3],
        },
        "XGBoost": {
            "model__n_estimators": [200, 300],
            "model__max_depth": [4, 6],
            "model__learning_rate": [0.03, 0.05, 0.1],
            "model__subsample": [0.8, 1.0],
        },
        "LightGBM": {
            "model__n_estimators": [200, 300],
            "model__max_depth": [-1, 10, 20],
            "model__learning_rate": [0.03, 0.05, 0.1],
            "model__num_leaves": [31, 50],
        },
        "SVC (RBF)": {
            "model__C": [0.3, 1.0, 3.0],
            "model__gamma": ["scale", 0.03, 0.1],
        },
        "k-NN": {
            "model__n_neighbors": [3, 5, 7],
            "model__weights": ["uniform", "distance"],
        },
        "Logistic Regression": {"model__C": [0.1, 1.0, 10.0]},
    }


def default_raw_data_path() -> str:
    return os.path.join("..", "data", "raw", "fleet_augmented.csv")
