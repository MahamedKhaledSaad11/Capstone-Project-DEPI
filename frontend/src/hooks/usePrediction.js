// ──────────────────────────────────────────────
// EVGuard — usePrediction Hook
// ──────────────────────────────────────────────

import usePredictionStore from "../store/predictionStore";

export default function usePrediction() {
  const {
    inputs,
    sequence,
    result,
    isLoading,
    error,
    setInput,
    setInputs,
    resetInputs,
    addToSequence,
    removeFromSequence,
    clearSequence,
    runPrediction,
    clearResult,
    clearError,
  } = usePredictionStore();

  return {
    inputs,
    sequence,
    result,
    isLoading,
    error,
    setInput,
    setInputs,
    resetInputs,
    addToSequence,
    removeFromSequence,
    clearSequence,
    predict: runPrediction,
    reset: () => {
      clearResult();
      clearError();
      clearSequence();
    },
  };
}
