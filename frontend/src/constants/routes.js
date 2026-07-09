// ──────────────────────────────────────────────
// EVGuard — Route Constants
// ──────────────────────────────────────────────

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  PROBLEM: "/problem",
  PIPELINE: "/pipeline",
  PIPELINE_DATA: "/pipeline/data",
  PIPELINE_EDA: "/pipeline/eda",
  PIPELINE_PREPROCESSING: "/pipeline/preprocessing",
  PIPELINE_FEATURES: "/pipeline/features",
  PIPELINE_MODELS: "/pipeline/models",
  PIPELINE_EVALUATION: "/pipeline/evaluation",
  PREDICT: "/predict",
  DASHBOARD: "/dashboard",
  ARCHITECTURE: "/architecture",
};

export const NAV_LINKS = [
  { name: "Home", path: ROUTES.HOME },
  { name: "About", path: ROUTES.ABOUT },
  { name: "Problem", path: ROUTES.PROBLEM },
  {
    name: "Pipeline",
    path: ROUTES.PIPELINE,
    children: [
      { name: "Data Collection", path: ROUTES.PIPELINE_DATA },
      { name: "EDA", path: ROUTES.PIPELINE_EDA },
      { name: "Preprocessing", path: ROUTES.PIPELINE_PREPROCESSING },
      { name: "Feature Engineering", path: ROUTES.PIPELINE_FEATURES },
      { name: "Model Training", path: ROUTES.PIPELINE_MODELS },
      { name: "Evaluation", path: ROUTES.PIPELINE_EVALUATION },
    ],
  },
  { name: "Predict", path: ROUTES.PREDICT },
  { name: "Dashboard", path: ROUTES.DASHBOARD },
  { name: "Architecture", path: ROUTES.ARCHITECTURE },
];
