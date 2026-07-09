# Frontend Documentation
## EVGuard — Electric Vehicle Predictive Maintenance

> **Project:** Capstone Project DEPI
>
> **System Name:** EVGuard Frontend
>
> **Last Updated:** 2026

---

## Table of Contents

1. [Frontend Overview](#1-frontend-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture & Directory Structure](#3-architecture--directory-structure)
4. [State Management](#4-state-management)
5. [Routing & Pages](#5-routing--pages)
6. [Key Components](#6-key-components)
7. [API Integration](#7-api-integration)
8. [Animations & 3D Rendering](#8-animations--3d-rendering)
9. [Styling & Theming](#9-styling--theming)
10. [Local Development](#10-local-development)

---

## 1. Frontend Overview

The EVGuard frontend is a modern, responsive single-page application (SPA) built to provide an interactive interface for predicting electric vehicle failures. It connects directly to the FastAPI backend to visualize machine learning inferences, display performance metrics, and explain the predictive maintenance pipeline.

**Core Objectives:**
- Provide a form for real-time sensor data input and live predictions.
- Visualize the performance of the LightGBM model (Confusion Matrix, ROC AUC, Feature Importance).
- Offer an interactive, animated, and visually appealing user experience using Framer Motion and Three.js.
- Educate users about the CRISP-DM methodology and ML pipeline through dedicated informative pages.

---

## 2. Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | `^19.2.7` | Core UI library |
| **Vite** | `^8.1.1` | Build tool and development server |
| **Tailwind CSS** | `^4.3.2` | Utility-first CSS framework for styling |
| **Zustand** | `^5.0.14` | Lightweight global state management |
| **React Router DOM** | `^7.18.1` | Client-side routing |
| **Framer Motion** | `^12.42.2` | Complex animations and page transitions |
| **Recharts** | `^3.9.1` | Data visualization (charts) |
| **Three.js / R3F / Drei** | `^0.185.0` / `^9.6.1` / `^10.7.7` | 3D rendering (Interactive Car Model) |
| **Axios** | `^1.18.1` | HTTP client for backend communication |
| **Lucide React** | `^1.22.0` | SVG iconography |
| **Oxlint** | `^1.71.0` | Ultra-fast JavaScript linter |

---

## 3. Architecture & Directory Structure

The `frontend` directory follows a modular, feature-based architecture pattern.

```
frontend/
├── src/
│   ├── assets/           # Static assets (images, 3D models)
│   ├── components/       # Reusable React components
│   │   ├── charts/       # Recharts visualizations (ConfusionMatrix, ROCCurve, etc.)
│   │   ├── layout/       # Global layout components (Navbar, Footer)
│   │   ├── three/        # 3D canvas and models (CarScene, CarModel)
│   │   └── ui/           # Generic UI elements (Button, Card, Badge, Spinner)
│   ├── constants/        # Global constants (colors, mappings)
│   ├── data/             # Static data (sample inputs, model metrics, feature metadata)
│   ├── hooks/            # Custom React hooks (useCountUp, usePrediction, etc.)
│   ├── pages/            # Route-level page components
│   │   ├── Landing/      # Home page
│   │   ├── Predict/      # Live prediction interface
│   │   ├── Dashboard/    # Model metrics dashboard
│   │   └── Pipeline/     # ML pipeline explanation views
│   ├── services/         # API connection layer (Axios instance)
│   ├── store/            # Zustand global stores
│   ├── styles/           # Global CSS and Tailwind directives
│   ├── utils/            # Helper functions and formatters
│   ├── App.jsx           # Root application component and router configuration
│   └── main.jsx          # React DOM mounting point
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind configuration and custom theme
└── vite.config.js        # Vite configuration
```

---

## 4. State Management

The application utilizes **Zustand** for lightweight, boilerplate-free state management.

### `predictionStore.js`
Handles the core business logic for making predictions:
- Stores the 12 input features (sensor and temporal data).
- Provides `setInput` and `setInputs` methods for form binding and quick-fill presets.
- Manages the `runPrediction` asynchronous action, tracking `isLoading`, `result`, and `error` states.
- Maintains a history of the last 10 predictions.

### `uiStore.js`
Manages global UI states, such as mobile menu toggles or global alerts.

---

## 5. Routing & Pages

Routing is handled by `react-router-dom` in `App.jsx`, wrapped in `AnimatePresence` to enable smooth page transitions.

| Route | Page Component | Description |
|---|---|---|
| `/` | `Landing` | Hero section with 3D car scene, quick stats, and feature highlights. |
| `/predict` | `Predict` | Interactive form to input 12 sensor values, submit to the backend, and view formatted prediction results, risk levels, and recommendations. |
| `/dashboard` | `Dashboard` | A visualization-heavy page showing LightGBM model metrics (Confusion Matrix, ROC Curve, Class Metrics) using Recharts. |
| `/pipeline/*` | `Pipeline` | Multi-step educational section detailing the CRISP-DM phases (Data, EDA, Preprocessing, Features, Models, Evaluation). |
| `/problem` | `Problem` | Explanation of the predictive maintenance business case. |
| `/architecture` | `Architecture`| System architecture overview. |
| `/about` | `About` | Team and project information. |

---

## 6. Key Components

### UI Components (`src/components/ui/`)
- `Card`: A sleek container with optional hover effects and glassmorphism.
- `Button`: Standardized button component with primary, secondary, and outline variants.
- `Badge`: Used to denote risk levels (Low, Medium, High, Critical) with appropriate colors.

### Chart Components (`src/components/charts/`)
Built with Recharts to visualize the model's metadata.
- `ConfusionMatrix.jsx`: Custom scatter/heatmap implementation.
- `ProbabilityChart.jsx`: Horizontal bar chart showing the predicted probabilities for the 5 classes.
- `FeatureImportanceChart.jsx`: Visualizes the top features driving the LightGBM model.
- `ROCCurveChart.jsx`: Plots the True Positive Rate against the False Positive Rate.

---

## 7. API Integration

All backend communication is centralized in `src/services/api.js` using Axios.

- **Base URL:** Defined via the `VITE_API_URL` environment variable, defaulting to `http://localhost:8000`.
- **Interceptors:** Request and response interceptors are configured to log API calls and handle global error mapping (e.g., standardizing timeout or network error messages).
- **Endpoints Used:**
  - `POST /api/v1/predict`: Sends 12 sensor inputs, receives the `PredictionResponse` JSON.
  - `GET /api/v1/health`: Checks backend connectivity.
  - `GET /api/v1/model-info`: Retrieves metadata (not always used live if static data is cached in `src/data`).

---

## 8. Animations & 3D Rendering

### Framer Motion
- **Page Transitions:** Entire routes fade and slide in/out using `motion.div` wrappers in `App.jsx`.
- **Component Entrances:** Staggered list animations and scroll-triggered fade-ins (using `whileInView` and `viewport={{ once: true }}`).
- **Interactive Feedback:** Hover and tap animations on buttons and cards.

### Three.js & React Three Fiber (R3F)
- **`CarScene.jsx` & `CarModel.jsx`:** Render an interactive 3D model of a car on the Landing page. It utilizes `@react-three/fiber` for the declarative scene setup and `@react-three/drei` for lighting, environment, and controls (e.g., OrbitControls).

---

## 9. Styling & Theming

The application utilizes **Tailwind CSS v4**.

- **CSS Variables:** Colors are heavily driven by variables defined in `index.css` to allow for easy theming (e.g., `--color-accent`, `--color-bg-primary`).
- **Domain Colors:** Specific colors are mapped to failure types and risk levels in `src/constants/colors.js`:
  - `Success / Low Risk`: Green hues
  - `Warning / Medium Risk`: Yellow/Orange hues
  - `Danger / Critical Risk`: Red hues
- **Glassmorphism:** Extensive use of Tailwind's `backdrop-blur` and translucent backgrounds (e.g., `bg-white/5`) to create a premium, modern aesthetic.

---

## 10. Local Development

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variables:
   Create a `.env` file in the `frontend` root:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

### Build for Production
To build the frontend for production deployment:
```bash
npm run build
```
The optimized static files will be generated in the `dist/` directory.
