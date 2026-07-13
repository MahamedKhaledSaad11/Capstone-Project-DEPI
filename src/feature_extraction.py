import pandas as pd
from sklearn.preprocessing import LabelEncoder

def extract_features(df: pd.DataFrame) -> tuple:
    """
    Creates interaction features, rolling window features, temporal features,
    and encodes the target label.
    Returns (DataFrame with new features, label_mapping dictionary).
    """
    print("Extracting features...")
    
    # Interaction Features
    df['power_to_load_ratio'] = df['power_kw'] / (df['load_kg'] + 1)
    df['temp_diff_motor_ambient'] = df['motor_temp_c'] - df['ambient_temp_c']
    df['temp_diff_battery_ambient'] = df['battery_temp_c'] - df['ambient_temp_c']
    df['voltage_per_soc'] = df['battery_voltage_v'] / (df['soc_pct'] + 1)
    df['speed_x_load'] = df['speed_kmh'] * df['load_kg']

    # Rolling window features
    ROLLING_COLS = ['motor_temp_c', 'battery_temp_c', 'battery_voltage_v', 'power_kw']
    ROLLING_WINDOW = 3
    rolling_feature_names = []
    
    for col in ROLLING_COLS:
        mean_col = f'{col}_roll_mean'
        std_col = f'{col}_roll_std'

        grouped = df.groupby('car_id')[col]
        df[mean_col] = grouped.transform(lambda x: x.rolling(window=ROLLING_WINDOW, min_periods=1).mean())
        df[std_col] = grouped.transform(lambda x: x.rolling(window=ROLLING_WINDOW, min_periods=1).std())
        rolling_feature_names.extend([mean_col, std_col])

    # Fill NaNs from std deviation calculations
    std_cols = [c for c in rolling_feature_names if c.endswith('_roll_std')]
    df[std_cols] = df[std_cols].fillna(0)

    # Temporal features
    df['hour_of_day'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek

    # Label Encoding
    le = LabelEncoder()
    df['failure_type_encoded'] = le.fit_transform(df['failure_type'].astype(str))
    label_mapping = dict(zip(le.classes_, le.transform(le.classes_).tolist()))
    
    print(f"Feature extraction complete. Total columns: {df.shape[1]}")
    return df, label_mapping

if __name__ == "__main__":
    from data_preprocessing import load_and_preprocess_data
    import os
    
    DATA_PATH = '../data/raw/fleet_augmented.csv'
    if os.path.exists(DATA_PATH):
        df_clean = load_and_preprocess_data(DATA_PATH)
        df_features, label_map = extract_features(df_clean)
        print(f"Label map: {label_map}")
        print(df_features.head())
