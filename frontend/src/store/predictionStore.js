// ──────────────────────────────────────────────
// EVGuard — Prediction Store (Zustand)
// ──────────────────────────────────────────────

import { create } from "zustand";
import { runPrediction } from "../services/predictionService";

const DEFAULT_INPUTS = {
  speed_kmh: 65.0,
  distance_m: 150000.0,
  soc_pct: 78.0,
  battery_voltage_v: 390.0,
  battery_temp_c: 28.0,
  motor_rpm: 3500.0,
  motor_temp_c: 42.0,
  power_kw: 9.0,
  ambient_temp_c: 22.0,
  load_kg: 220.0,
  hour_of_day: 10,
  day_of_week: 1,
};

const usePredictionStore = create((set, get) => ({
  inputs: { ...DEFAULT_INPUTS },
  sequence: [], // Stores up to 2 previous readings (T-2, T-1)
  result: null,
  isLoading: false,
  error: null,
  history: [], // Stores past predictions for UI history

  setInput: (key, value) =>
    set((state) => ({
      inputs: { ...state.inputs, [key]: value },
    })),

  setInputs: (inputs) =>
    set({ inputs: { ...inputs } }),

  resetInputs: () =>
    set({ inputs: { ...DEFAULT_INPUTS }, result: null, error: null }),

  addToSequence: () => {
    const { inputs, sequence } = get();
    if (sequence.length < 2) {
      set({ sequence: [...sequence, { ...inputs }] });
    }
  },

  removeFromSequence: (index) => {
    const { sequence } = get();
    set({ sequence: sequence.filter((_, i) => i !== index) });
  },

  clearSequence: () => set({ sequence: [] }),

  runPrediction: async () => {
    const { inputs, sequence } = get();
    set({ isLoading: true, error: null });

    try {
      // Send the sequence plus the current reading (max length 3)
      const payload = [...sequence, inputs];
      const result = await runPrediction(payload);
      
      set((state) => ({
        result,
        isLoading: false,
        history: [
          { payload, result, timestamp: new Date().toISOString() },
          ...state.history,
        ].slice(0, 10), // keep last 10
      }));
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearResult: () => set({ result: null }),

  clearError: () => set({ error: null }),
}));

export default usePredictionStore;
