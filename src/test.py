import pandas as pd
from sklearn.metrics import classification_report, accuracy_score, f1_score

def evaluate_model(pipeline, X_test: pd.DataFrame, y_test: pd.Series, label_mapping: dict):
    """
    Evaluates the trained model on the test dataset.
    """
    print("\n--- Model Evaluation ---")
    
    y_pred = pipeline.predict(X_test)
    
    # Basic metrics
    acc = accuracy_score(y_test, y_pred)
    f1_macro = f1_score(y_test, y_pred, average='macro', zero_division=0)
    
    print(f"Test Accuracy: {acc:.4f}")
    print(f"Test Macro F1: {f1_macro:.4f}")
    
    # Classification Report
    class_names = [k for k, v in sorted(label_mapping.items(), key=lambda item: item[1])]
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=class_names, digits=4))

if __name__ == "__main__":
    # Test script standalone execution requires reloading the dataset and model
    import joblib
    from data_preprocessing import load_and_preprocess_data
    from feature_extraction import extract_features
    from sklearn.model_selection import train_test_split
    
    print("Loading test dataset...")
    df_clean = load_and_preprocess_data('../data/raw/fleet_augmented.csv')
    df_features, label_map = extract_features(df_clean)
    
    X = df_features.drop(columns=['timestamp', 'car_id', 'failure_type', 'failure_type_encoded'])
    y = df_features['failure_type_encoded']
    
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print("Loading model pipeline...")
    pipeline = joblib.load('../model_weights/lgbm_pipeline.joblib')
    
    evaluate_model(pipeline, X_test, y_test, label_map)
