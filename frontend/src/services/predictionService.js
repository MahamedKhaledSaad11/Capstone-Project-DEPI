// ──────────────────────────────────────────────
// EVGuard — Prediction Service
// ──────────────────────────────────────────────

import { postPrediction } from "./api";

/**
 * Run a prediction against the backend API.
 * @param {object} inputs - The 12 raw sensor + temporal inputs
 * @returns {Promise<object>} Full prediction response
 */
export async function runPrediction(inputs) {
  return postPrediction(inputs);
}

export default { runPrediction };
