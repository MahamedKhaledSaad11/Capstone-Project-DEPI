import os
import json
import pandas as pd
import numpy as np

# Physical clamping rules derived from Phase 2 domain analysis
CLAMP_RULES = {
    'speed_kmh':         {'min': 0,    'max': 200},
    'distance_m':        {'min': 0,    'max': None},
    'soc_pct':           {'min': 0,    'max': 100},
    'battery_voltage_v': {'min': 250,  'max': 500},
    'battery_temp_c':    {'min': -40,  'max': 80},
    'motor_rpm':         {'min': 0,    'max': 12000},
    'motor_temp_c':      {'min': -20,  'max': 120},
    'power_kw':          {'min': 0,    'max': 50},
    'ambient_temp_c':    {'min': -50,  'max': 60},
    'load_kg':           {'min': 0,    'max': 1000},
}

def load_and_preprocess_data(data_path: str) -> pd.DataFrame:
    """
    Reads the raw dataset and applies deduplication, physical constraints clamping,
    and missing values imputation.
    """
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Sort by car_id and timestamp for time-series continuity
    df = df.sort_values(by=['car_id', 'timestamp']).reset_index(drop=True)
    
    # Remove exact-row duplicates
    df = df.drop_duplicates()
    
    # Remove same (car_id, timestamp) duplicates -- keep first occurrence
    df = df.drop_duplicates(subset=['car_id', 'timestamp'], keep='first').reset_index(drop=True)
    
    # Clamping rules
    for col, bounds in CLAMP_RULES.items():
        if col not in df.columns:
            continue
        lo = bounds.get('min')
        hi = bounds.get('max')
        
        if lo is not None:
            df.loc[df[col] < lo, col] = lo
        if hi is not None:
            df.loc[df[col] > hi, col] = hi

    # Missing value imputation
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    # Forward and backward fill per vehicle
    df[numeric_cols] = df.groupby('car_id')[numeric_cols].transform(lambda g: g.ffill().bfill())
    
    # Median fallback for remaining missing values
    if df[numeric_cols].isnull().sum().sum() > 0:
        medians = df[numeric_cols].median()
        df[numeric_cols] = df[numeric_cols].fillna(medians)

    print(f"Data preprocessing complete. Shape: {df.shape}")
    return df

if __name__ == "__main__":
    DATA_PATH = '../data/raw/fleet_augmented.csv'
    if os.path.exists(DATA_PATH):
        df_clean = load_and_preprocess_data(DATA_PATH)
        print(df_clean.head())
    else:
        print(f"Error: {DATA_PATH} not found. Please run from src directory or check path.")
