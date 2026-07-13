import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import ADASYN
from lightgbm import LGBMClassifier
from sklearn.pipeline import Pipeline

def train_model(df: pd.DataFrame, target_col: str, drop_cols: list, model_dir: str):
    """
    Splits data, scales features, applies ADASYN (training only), trains LGBM,
    and saves the model pipeline.
    """
    print("Preparing data for training...")
    
    # Feature columns order must be preserved exactly
    X = df.drop(columns=drop_cols + [target_col])
    y = df[target_col]
    feature_cols = X.columns.tolist()
    
    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    
    # StandardScaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    # ADASYN Oversampling
    print("Applying ADASYN oversampling...")
    adasyn = ADASYN(random_state=42)
    X_train_resampled, y_train_resampled = adasyn.fit_resample(X_train_scaled, y_train)
    
    # LightGBM Classifier (Best Model from Phase 4)
    print("Training LightGBM Classifier...")
    lgbm = LGBMClassifier(
        n_estimators=300,
        learning_rate=0.1,
        max_depth=20,
        num_leaves=70,
        min_child_samples=10,
        random_state=42,
        n_jobs=-1,
        verbose=-1
    )
    
    lgbm.fit(X_train_resampled, y_train_resampled)
    
    # Construct Inference Pipeline (Scaler + Model)
    pipeline = Pipeline(steps=[
        ('scaler', scaler),
        ('lgbm', lgbm)
    ])
    
    # Save Model
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'lgbm_pipeline.joblib')
    joblib.dump(pipeline, model_path)
    print(f"Model pipeline saved to: {model_path}")
    
    # Save Feature Columns Metadata
    meta_path = os.path.join(model_dir, 'model_metadata.json')
    import json
    with open(meta_path, 'w') as f:
        json.dump({
            "features": feature_cols,
            "feature_count": len(feature_cols)
        }, f, indent=2)
    
    return pipeline, X_test, y_test

if __name__ == "__main__":
    from data_preprocessing import load_and_preprocess_data
    from feature_extraction import extract_features
    
    df_clean = load_and_preprocess_data('../data/raw/fleet_augmented.csv')
    df_features, label_map = extract_features(df_clean)
    
    train_model(
        df=df_features,
        target_col='failure_type_encoded',
        drop_cols=['timestamp', 'car_id', 'failure_type'],
        model_dir='../model_weights'
    )
