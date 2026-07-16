# Generated from: Phase_1_Business_Understanding.ipynb
# Converted at: 2026-07-16T08:42:20.981Z
# Next step (optional): refactor into modules & generate tests with RunCell
# Quick start: pip install runcell

# # Phase 1: Business Understanding
# 
# **CRISP-DM Phase Description:**  
# This phase focuses on understanding the project objectives and requirements from a business perspective, then converting this knowledge into a data mining problem definition and a preliminary plan designed to achieve the objectives.
# 
# ---


# ### Task 1: Determine Business Objectives
# 
# The first objective of the data analyst is to thoroughly understand, from a business perspective, what the customer really wants to accomplish. This involves:
# 
# - **Background:** Identify the organisational context and the business area the project relates to.
# - **Business Objectives:** Clearly state the primary question or problem the business wants to solve.
# - **Business Success Criteria:** Define the measurable criteria that determine whether the project's outcome is considered a success from the business's point of view (e.g., "reduce customer churn by 15%", "improve prediction accuracy to 90%").
# 
# **Instructions:** In the cells below, define your business objectives, background context, and success criteria as Python variables (strings or dictionaries). This ensures your business logic is documented directly in the notebook's code state.


# TODO: Define business objectives here.

business_objectives = {
    "background": "This project sits within the Vehicle Operations and Maintenance division.\n   The organisation manages a fleet of cars where current maintenance relies on fixed mileage intervals or calendar dates.\n   This leads to unexpected roadside failures and costly over-maintenance of still-healthy components.",
    "primary_objective": "- Reduce vehicle downtime caused by unplanned mechanical failures.\n   - Minimise maintenance costs by servicing components only when data predicts imminent failure.",
    "success_criteria": ["Criterion 1: Reduce unplanned vehicle breakdowns by 20%.", "Criterion 2: Achieve a 85% accuracy rate in predicting component failure.", "Criterion 3: Lower annual maintenance expenditure by 10%."]
}

# Display the defined objectives in a readable format
for key, value in business_objectives.items():
    print(f">> {key.upper().replace('_', ' ')}:")
    if isinstance(value, list):
        for item in value:
            print(f"   - {item}")
    else:
        print(f"   {value}")
    print()

# ---
# ### Task 2: Assess Situation
# 
# This task involves a more detailed fact-finding about all of the resources, constraints, assumptions, and other factors that should be considered in determining the data analysis goal and project plan. Key areas to assess:
# 
# - **Resources Inventory:** Personnel, data sources, computing resources, and software available.
# - **Requirements, Assumptions, and Constraints:** Project schedule, legal/ethical considerations, data access limitations, and budget.
# - **Risks and Contingencies:** Identify potential risks (e.g., data unavailability, quality issues, privacy concerns) and how to mitigate them.
# - **Terminology Glossary:** Define key domain-specific terms relevant to the project.
# - **Costs and Benefits:** A cost-benefit analysis of the project.
# 
# **Instructions:** Document your situation assessment as a structured dictionary or set of variables.


# TODO: Assess the current situation here.
# Document resources, requirements, assumptions, constraints, and risks.

situation_assessment = {
    "resources": {
        "personnel": ["Data Scientist",
                      "Domain Expert",
                      "Hardware Engineer"],
        "data_sources": ["fleet_augmented.csv"],
        "computing": "Local machine",
        "software": ["Python 3.9+", "pandas", "scikit-learn", "Plotly", "Dash", "Git"]
    },
    "requirements": ["Must comply with GDPR", "Deadline: 10/07/2026"],
    "assumptions": [
        "Historical maintenance labels (failure types) are accurate.",
        "There are no major recalls or manufacturing defects in the fleet that would skew baseline data."
    ],
    "constraints": ["Limited to 20,300 records across 500 unique vehicles (car_1 to car_500)"],
    "risks_and_contingencies": [
        {
            "risk": "Data Quality: Sensor telemetry contains significant missing values (ranging from ~2% up to 8% missing data per sensor column) and noisy outliers (e.g., negative speed/distance, SOC over 100%).",
            "probability": "High",
            "impact": "Model performance degrades, or pipeline crashes due to unhandled nulls/invalid values.",
            "mitigation": "Implement a robust data cleaning and imputation pipeline (e.g., forward-fill or median imputation per car_id); remove physical impossibilities like negative speeds."
        },
        {
            "risk": "Model Overfitting: The model may perform well on training data but poorly on unseen data.",
            "probability": "Medium",
            "impact": "Reduced reliability of predictions in real-world scenarios.",
            "mitigation": "Use stratified cross-validation, regularization techniques, and test on a hold-out dataset split by car_id."
        },
        {
            "risk": "Severe Class Imbalance: Failures are extremely rare events, making up only 3.67% of the total dataset (96.33% Normal, 1.69% Critical_Overheating, 1.52% Thermal_Overload, 0.25% Mechanical_Stress, and 0.22% Voltage_Sag).",
            "probability": "High",
            "impact": "Model predicts 'Normal' 100% of the time and becomes completely useless for predictive maintenance.",
            "mitigation": "Use cost-sensitive learning (weighted loss functions), SMOTE, or frame the problem as an anomaly detection task to penalize missed failures heavily."
        }
    ],
    "terminology": {
        "RUL": "Remaining Useful Life - The estimated time (or miles) left before a component fails."
    },
    "cost_benefit": "Cost: 3 months of Data Scientist time. Benefit: Estimated savings over $50,000 annually in maintenance costs and reduce downtime by 20%."
}

# Display situation assessment
import json
print(json.dumps(situation_assessment, indent=2))

# Optional: Add any further notes or elaboration on the situation assessment

# ---
# ### Task 3: Determine Data Mining Goals
# 
# A business goal states objectives in business terminology. A data mining goal states project objectives in technical terms. This task converts the business objectives identified in Task 1 into specific, measurable data mining goals:
# 
# - **Data Mining Problem Type:** Classify the problem (e.g., classification, regression, clustering, anomaly detection, association rule mining, etc.).
# - **Data Mining Goals:** State the technical objectives clearly (e.g., "Build a classification model to predict [target variable] with an F1-score ≥ 0.85").
# - **Data Mining Success Criteria:** Define the technical metrics that will be used to evaluate the model's performance (e.g., accuracy, precision, recall, RMSE, silhouette score).
# 
# **Instructions:** Map your business objectives to concrete data mining goals.


# TODO: Define data mining goals here.

data_mining_goals = {
    "problem_type": "Multi-class Classification",
    "target_variable": "failure_type",  # Contains: 'Normal', 'Critical_Overheating', 'Thermal_Overload', 'Mechanical_Stress', 'Voltage_Sag'
    "technical_goals": [
        "Goal 1: Develop a predictive model to classify the exact type of vehicle failure based on noisy, incomplete telemetry data (speed_kmh, soc_pct, battery/motor sensors, etc.).",
        "Goal 2: Identify the most critical feature correlations (e.g., motor_rpm vs motor_temp_c, battery_voltage_v vs soc_pct) contributing to each distinct failure mode.",
        "Goal 3: Construct an anomaly detection or data-imputation preprocessing baseline to cleanly handle the 2%-8% missing value rate across telemetry features without losing rare failure signals."
    ],
    "success_metrics": [
        "Metric 1: Macro-Averaged Recall (Sensitivity) of at least 80% -> Essential due to extreme class imbalance; the model must reliably catch rare minority events like 'Voltage_Sag' and 'Mechanical_Stress' which collectively make up less than 1% of the dataset.",
        "Metric 2: Micro-Averaged F1-Score of at least 85% -> To balance precision and recall effectively across both the dominant 'Normal' class (96.33%) and individual failure categories.",
        "Metric 3: ROC-AUC (One-vs-Rest) of at least 88% -> The model must maintain robust discriminative power between each individual failure category and the baseline normal operating state."
    ]
}

# Display the mapping from business objectives to data mining goals
print("=" * 60)
print("BUSINESS TO DATA MINING GOAL MAPPING")
print("=" * 60)
print(f"\nBusiness Objective : \n   {business_objectives['primary_objective']}")
print(f"Problem Type       : {data_mining_goals['problem_type']}")
print(f"Target Variable    : {data_mining_goals['target_variable']}")
print(f"\nTechnical Goals:")
for goal in data_mining_goals['technical_goals']:
    print(f"  - {goal}")
print(f"\nSuccess Metrics:")
for metric in data_mining_goals['success_metrics']:
    print(f"  - {metric}")

# ---
# ### Task 4: Produce Project Plan
# 
# Describe the intended plan for achieving the data mining goals and thereby achieving the business goals. The plan should specify:
# 
# - **Tools and Techniques:** The data mining tools (libraries, frameworks) and modelling techniques you plan to use.
# - **Project Plan / Timeline:** A step-by-step plan with estimated durations for each remaining CRISP-DM phase.
# - **Dependencies:** Any dependencies between tasks or on external factors.
# - **Initial Assessment of Tools and Techniques:** A brief justification for why the chosen tools and techniques are appropriate.
# 
# **Instructions:** Outline your full project plan as a structured data object below.


# TODO: Produce your project plan here.

project_plan = {
    "tools": [
        "Python",
        "pandas",
        "numpy",
        "scikit-learn",
        "LightGBM / XGBoost",
        "matplotlib & seaborn",
        "Plotly & Dash",
        "Jupyter Notebook",
        "GitHub"
    ],
    "techniques": [
        "GroupKFold Cross-Validation",
        "Random Forest Classifier & LightGBM",
        "SMOTE-NC / Class Weight Balancing",
        "GridSearchCV / RandomizedSearchCV"
    ],
    "timeline": [
        {"phase": "Data Understanding",   "duration": "Week 1-2",   "status": "Finished"},
        {"phase": "Data Preparation",     "duration": "Week 2-4",   "status": "Finished"},
        {"phase": "Modelling",            "duration": "Week 4-6",   "status": "In Progress"},
        {"phase": "Evaluation",           "duration": "Week 6-8",   "status": "Not Started"},
        {"phase": "Deployment Planning",  "duration": "Week 8-10",  "status": "Not Started"}
    ],
    "dependencies": [
        {"Data access: Provided via localized fleet_augmented.csv containing 500 unique vehicles tracking sequential 10-minute sensor intervals."}
    ],
    "tool_justification": "\nThe project relies on the Python ecosystem due to its flexibility with time-series sensor data and industry-standard machine learning libraries.\nThe chosen gradient boosting and ensemble algorithms are well-suited for handling tabular data with severe missing values and performing reliably on highly imbalanced multi-class classification problems common in vehicle failure prediction.\nModel explainability (e.g., SHAP or feature importances) is included as a non-negotiable requirement to ensure outputs are understandable to garage mechanics—without trust in why a vehicle is flagged for a specific fault (like Voltage_Sag or Thermal_Overload), the project will fail adoption regardless of predictive accuracy."
}

# Display the project plan
print("=" * 60)
print("PROJECT PLAN")
print("=" * 60)

print("\nTools:", ", ".join(project_plan['tools']) if project_plan['tools'] else "[Not yet defined]")
print("Techniques:", ", ".join(project_plan['techniques']) if project_plan['techniques'] else "[Not yet defined]")

print("\nTimeline:")
if project_plan['timeline']:
    for phase in project_plan['timeline']:
        print(f"  [{phase.get('status', 'N/A'):^13}] {phase['phase']:<25} | {phase['duration']}")
else:
    print("  [Not yet defined]")

print("\nDependencies:")
for dep in project_plan['dependencies']:
    print(f"  - {dep}")

print(f"\nTool Justification: {project_plan['tool_justification']}")

# Optional: Summarise all Phase 1 outputs for reference in subsequent phases
print("=" * 60)
print("PHASE 1 SUMMARY: BUSINESS UNDERSTANDING")
print("=" * 60)
print(f"\nPrimary Objective  : \n   {business_objectives['primary_objective']}")
print(f"Problem Type       : {data_mining_goals['problem_type']}")
print(f"Target Variable    : {data_mining_goals['target_variable']}")
print(f"Tools Planned      : {', '.join(project_plan['tools']) if project_plan['tools'] else 'TBD'}")
print(f"Techniques Planned : {', '.join(project_plan['techniques']) if project_plan['techniques'] else 'TBD'}")