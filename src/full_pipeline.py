import os
import sys

def run_pipeline():
    """
    Executes the entire Machine Learning pipeline from start to finish:
    1. Data Preprocessing
    2. Feature Extraction
    3. Model Training
    4. Model Evaluation
    """
    print("="*60)
    print("EVGuard: Full Machine Learning Pipeline")
    print("="*60)
    
    from data_preprocessing import load_and_preprocess_data
    from feature_extraction import extract_features
    from model_training import train_model
    from test import evaluate_model
    
    # Configuration
    RAW_DATA_PATH = '../data/raw/fleet_augmented.csv'
    MODEL_DIR = '../model_weights'
    
    if not os.path.exists(RAW_DATA_PATH):
        print(f"Error: Raw data not found at {RAW_DATA_PATH}")
        sys.exit(1)
        
    # Phase 3: Data Preprocessing
    print("\n[1/4] Running Data Preprocessing...")
    df_clean = load_and_preprocess_data(RAW_DATA_PATH)
    
    # Phase 3: Feature Extraction
    print("\n[2/4] Running Feature Extraction...")
    df_features, label_map = extract_features(df_clean)
    
    # Phase 4: Model Training
    print("\n[3/4] Running Model Training...")
    pipeline, X_test, y_test = train_model(
        df=df_features,
        target_col='failure_type_encoded',
        drop_cols=['timestamp', 'car_id', 'failure_type'],
        model_dir=MODEL_DIR
    )
    
    # Phase 5: Model Evaluation
    print("\n[4/4] Running Model Evaluation...")
    evaluate_model(pipeline, X_test, y_test, label_map)
    
    print("\n" + "="*60)
    print("Pipeline Execution Completed Successfully!")
    print(f"Model saved to: {os.path.abspath(MODEL_DIR)}")
    print("="*60)

if __name__ == "__main__":
    run_pipeline()
