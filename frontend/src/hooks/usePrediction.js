// ──────────────────────────────────────────────
// EVGuard — usePrediction Hook
// ──────────────────────────────────────────────

import usePredictionStore from "../store/predictionStore";

export default function usePrediction() {
  const {
    inputs,
    result,
    isLoading,
    error,
    setInput,
    setInputs,
    resetInputs,
    runPrediction,
    clearResult,
    clearError,
  } = usePredictionStore();

  return {
    inputs,
    result,
    isLoading,
    error,
    setInput,
    setInputs,
    resetInputs,
    predict: runPrediction,
    reset: () => {
      clearResult();
      clearError();
    },
  };
}
