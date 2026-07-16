# Generated from: Phase_4_Modeling.ipynb
# Export regenerated after leakage-safe notebook edits.

# %% [markdown] cell 0
# # Phase 4: Modeling - Leakage-Safe Workflow
# 
# This phase rebuilds the modeling workflow from raw telemetry instead of relying on the fully prepared CSV. The final validation is stricter:
# 
# - split by `car_id`, so test vehicles are not also present in training;
# - fit preprocessing inside the model pipeline;
# - apply ADASYN inside the `imblearn` pipeline and inside CV folds;
# - select models using macro metrics instead of accuracy alone.
# 
# References: [scikit-learn data leakage](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage), [imbalanced-learn leakage pitfalls](https://imbalanced-learn.org/stable/common_pitfalls.html), [StratifiedGroupKFold](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.StratifiedGroupKFold.html).

# %% [markdown] cell 1
# ---
# ## Section 1: Setup and Data Loading

# %% cell 2
# Jupyter magic: %pip install -r requirements.txt

# %% cell 3
import os
import sys
import json
import warnings
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from datetime import datetime
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay
from sklearn.model_selection import GridSearchCV, StratifiedGroupKFold

for path in [os.getcwd(), os.path.join(os.getcwd(), 'notebooks')]:
    if path not in sys.path:
        sys.path.append(path)

from leakage_safe_pipeline import (
    RANDOM_STATE, N_SPLITS, FINAL_FEATURES,
    load_dataset, first_group_holdout, candidate_models, make_pipeline,
    evaluate_predictions, param_grids,
)

pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', 100)
pd.set_option('display.float_format', '{:.4f}'.format)
sns.set_style('whitegrid')
warnings.filterwarnings('ignore')
# Jupyter magic: %matplotlib inline

print('Phase 4: Leakage-safe modeling')
print(f'Start time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')

# %% cell 4
candidate_paths = [
    os.path.join('..', 'data', 'raw', 'fleet_augmented.csv'),
    os.path.join('data', 'raw', 'fleet_augmented.csv'),
]
RAW_DATA_PATH = next(path for path in candidate_paths if os.path.exists(path))

bundle = load_dataset(RAW_DATA_PATH)
split = first_group_holdout(bundle)

X_train = split['X_train']
X_test = split['X_test']
y_train = split['y_train']
y_test = split['y_test']
groups_train = split['groups_train']
groups_test = split['groups_test']

print(f'Raw shape: {bundle.raw_df.shape}')
print(f'Unique vehicles: {bundle.groups.nunique()}')
print('Label mapping:', bundle.label_mapping)
print(f'Train rows: {len(X_train):,} | Test rows: {len(X_test):,}')
print(f'Train vehicles: {groups_train.nunique():,} | Test vehicles: {groups_test.nunique():,}')
print(f'Vehicle overlap: {len(set(groups_train) & set(groups_test))}')

class_report = pd.DataFrame({
    'train_count': y_train.map(bundle.label_mapping_inv).value_counts().reindex(bundle.class_names, fill_value=0),
    'test_count': y_test.map(bundle.label_mapping_inv).value_counts().reindex(bundle.class_names, fill_value=0),
})
class_report['train_pct'] = (class_report['train_count'] / class_report['train_count'].sum() * 100).round(3)
class_report['test_pct'] = (class_report['test_count'] / class_report['test_count'].sum() * 100).round(3)
display(class_report)

assert len(set(groups_train) & set(groups_test)) == 0, 'Group leakage: a vehicle appears in both train and test.'

# %% [markdown] cell 5
# ---
# ## Section 2: Candidate Pipelines
# 
# Each candidate pipeline is:
# 
# `TelemetryFeatureTransformer -> StandardScaler -> ADASYN -> classifier`
# 
# The transformer and ADASYN are fitted only during training. The test set remains original and non-resampled.

# %% cell 6
pipelines = {
    name: make_pipeline(model)
    for name, model in candidate_models().items()
}

results = {}
for name, pipe in pipelines.items():
    print(f'\nTraining: {name}')
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)
    metrics = evaluate_predictions(y_test, y_pred)
    results[name] = {'pipeline': pipe, 'y_pred': y_pred, **metrics}
    print(f"  Accuracy: {metrics['Accuracy']:.4f}")
    print(f"  Balanced Accuracy: {metrics['Balanced Accuracy']:.4f}")
    print(f"  Macro F1: {metrics['Macro F1']:.4f}")

# %% [markdown] cell 7
# ---
# ## Section 3: Model Comparison
# 
# Macro F1 and macro recall are the primary selection metrics because the rare failure classes matter more than the dominant `Normal` class.

# %% cell 8
comparison_df = pd.DataFrame({
    name: {k: v for k, v in res.items() if k not in ['pipeline', 'y_pred']}
    for name, res in results.items()
}).T.sort_values('Macro F1', ascending=False)

display(comparison_df.style.format('{:.4f}').highlight_max(axis=0, color='lightgreen'))

fig, ax = plt.subplots(figsize=(14, 6))
comparison_df[['Accuracy', 'Balanced Accuracy', 'Macro Recall', 'Macro F1', 'Weighted F1']].plot(
    kind='bar', ax=ax, edgecolor='black', linewidth=0.5
)
ax.set_ylim(0, 1.05)
ax.set_ylabel('Score')
ax.set_title('Leakage-Safe Holdout Model Comparison')
plt.xticks(rotation=25, ha='right')
plt.tight_layout()
plt.show()

best_model_name = comparison_df['Macro F1'].idxmax()
best_pipeline = results[best_model_name]['pipeline']
y_pred_best = results[best_model_name]['y_pred']
print(f'Best holdout model by Macro F1: {best_model_name}')

# %% cell 9
print(classification_report(y_test, y_pred_best, target_names=bundle.class_names, zero_division=0, digits=4))

fig, axes = plt.subplots(1, 2, figsize=(16, 6))
cm = confusion_matrix(y_test, y_pred_best)
ConfusionMatrixDisplay(cm, display_labels=bundle.class_names).plot(
    ax=axes[0], cmap='Blues', values_format='d', xticks_rotation=45
)
axes[0].set_title(f'{best_model_name} - Holdout Counts')

cm_norm = confusion_matrix(y_test, y_pred_best, normalize='true')
ConfusionMatrixDisplay(cm_norm, display_labels=bundle.class_names).plot(
    ax=axes[1], cmap='Oranges', values_format='.3f', xticks_rotation=45
)
axes[1].set_title(f'{best_model_name} - Recall Normalized')
plt.tight_layout()
plt.show()

# %% [markdown] cell 10
# ---
# ## Section 4: Hyperparameter Tuning
# 
# Grid search is run on the full pipeline. Preprocessing, scaling, and ADASYN are refit inside each CV training fold, and `StratifiedGroupKFold` keeps vehicles isolated between training and validation.

# %% cell 11
selected_grid = param_grids()[best_model_name]
cv = StratifiedGroupKFold(n_splits=N_SPLITS, shuffle=True, random_state=RANDOM_STATE)

grid_search = GridSearchCV(
    estimator=best_pipeline,
    param_grid=selected_grid,
    scoring='f1_macro',
    cv=cv,
    n_jobs=-1,
    verbose=1,
    refit=True,
)

print(f'Running leakage-safe GridSearchCV for: {best_model_name}')
grid_search.fit(X_train, y_train, groups=groups_train)
print(f'Best parameters: {grid_search.best_params_}')
print(f'Best CV Macro F1: {grid_search.best_score_:.4f}')

# %% cell 12
tuned_pipeline = grid_search.best_estimator_
y_pred_tuned = tuned_pipeline.predict(X_test)
tuned_metrics = evaluate_predictions(y_test, y_pred_tuned)

display(pd.DataFrame([tuned_metrics], index=[f'Tuned {best_model_name}']).style.format('{:.4f}'))
print(classification_report(y_test, y_pred_tuned, target_names=bundle.class_names, zero_division=0, digits=4))

# %% [markdown] cell 13
# ---
# ## Section 5: Modeling Summary
# 
# The final project claim should use the tuned holdout metrics from this leakage-safe workflow. Do not reuse earlier random-row-split metrics as deployment evidence.

# %% cell 14
summary = {
    'split_strategy': 'StratifiedGroupKFold holdout by car_id',
    'vehicle_overlap_between_train_test': int(len(set(groups_train) & set(groups_test))),
    'best_model_before_tuning': best_model_name,
    'best_cv_macro_f1': float(grid_search.best_score_),
    'holdout_metrics_after_tuning': {k: float(v) for k, v in tuned_metrics.items()},
    'label_mapping': bundle.label_mapping,
    'feature_count': len(FINAL_FEATURES),
    'methodology_notes': [
        'Preprocessing is fitted inside the pipeline.',
        'ADASYN is fitted only inside training folds.',
        'Test vehicles are unseen during training.',
        'Accuracy is reported but not used as the primary success metric.'
    ],
}

print(json.dumps(summary, indent=2))

