### 📋 Industrial & Car Machine Maintenance Prediction Dataset Documentation

This source file details the relational schema structure, uncleaned raw data anomalies, and predictive feature sets of the imported fleet dataset utilized for our **Multi-Vehicle Relational Predictive Maintenance System**. 

The underlying data represents an external fleet telemetry dataset imported directly into our local environment for modeling. Unlike flat datasets, this configuration relies heavily on relational joins across multiple uncleaned files, containing dirty values, unaligned dimensions, and missing features that require explicit preprocessing.

---

### 1. Relational Telematics & Structural Sourcing
* **`timestamp`**: Non-unique, highly granular temporal indexing markers across the fleet. Requires per-vehicle chronological alignment (`by=['car_id', 'timestamp']`).
* **`car_id`**: High-cardinality categorical identifier used as the primary relational foreign key to map sensor tracks to independent fleet assets.
* **`load_kg`**: Physical payload mass metrics, serving as a primary structural stress weight multiplier during relational operations.

### 2. Battery & Electrical Subsystem Metrics
* **`soc_pct`**: State of Charge tracking percentage. Exhibits severe scaling noise with unclipped ranges spiking well above $100\%$, requiring explicit bounding rules.
* **`battery_voltage_v`**: Continuous voltage fluctuations reflecting transient electrical load strain.
* **`battery_temp_c`**: Component cell temperature tracking profiles showing ambient-driven seasonal variations.

### 3. Kinematic Propulsion & Thermal Telemetry
* **`motor_rpm`**: Rotational velocity markers. Prone to extreme tracking noise signatures and unhandled outliers.
* **`power_kw`**: Dynamic real-time energy draw profiles mapping closely to drivetrain physical stress.
* **`motor_temp_c`**: Critical core thermal metric showing massive non-linear spikes up to $\sim71.78^\circ\text{C}$ directly prior to major failure states.

### 4. Raw Vehicle Kinematics (Dirty Tracks)
* **`speed_kmh`**: Current vehicle travel speed. Suffers from measurement anomalies, including non-physical inverted negative entries.
* **`distance_m`**: Absolute accumulated distance markers. Prone to severe telemetry dropping noise (e.g., erratic downward steps).

---

### 🎯 Machine Learning Targets (Multi-Class Operational States)

| Target Field | Data Type | Analytical Focus | Operational Definition |
| :--- | :--- | :--- | :--- |
| **`failure_type`** | Categorical / String | Multi-Class Classification | Categorical classification tracking specific vehicle states: `Normal`, `Critical_Overheating`, `Thermal_Overload`, `Mechanical_Stress`, and `Voltage_Sag`. |

---

### 🛠️ Data Preprocessing & Pipeline Hypotheses

* **Relational Feature Engineering**: Because the data relies heavily on complex relational tracking, interaction terms—such as cumulative thermal duration profiles and power-to-load weight ratios—must be engineered to unlock predictive signal.
* **Non-Linear Domain Optimization**: Mutual information scoring and boxplot bivariate distributions confirm that simple linear modeling will fail. Tree-based ensembles or deep sequential architectures are required to separate complex multi-class targets like `Mechanical_Stress` and `Voltage_Sag`.
* **Rigorous Imputation Requirements**: Telemetry streams are dirty and missing complete blocks across several sensor tracks. Robust rolling window median imputation must be isolation-tested per vehicle profile to prevent raw data leakages.