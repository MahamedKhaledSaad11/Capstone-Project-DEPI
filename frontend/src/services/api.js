// ──────────────────────────────────────────────
// EVGuard — API Service
// ──────────────────────────────────────────────

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("[API] Request timed out");
      return Promise.reject(new Error("Request timed out. Please try again."));
    }
    if (!error.response) {
      console.error("[API] Network error — backend may be offline");
      return Promise.reject(
        new Error("Cannot connect to the server. Please check if the backend is running.")
      );
    }
    const message =
      error.response?.data?.detail || error.message || "An unexpected error occurred.";
    console.error(`[API] Error ${error.response?.status}: ${message}`);
    return Promise.reject(new Error(message));
  }
);

// ── Named API functions ──────────────────────

export async function postPrediction(data) {
  const response = await api.post("/api/v1/predict", data);
  return response.data;
}

export async function getHealth() {
  const response = await api.get("/api/v1/health");
  return response.data;
}

export async function getModelInfo() {
  const response = await api.get("/api/v1/model-info");
  return response.data;
}

export async function getSampleInputs() {
  const response = await api.get("/api/v1/sample-inputs");
  return response.data;
}

export default api;
