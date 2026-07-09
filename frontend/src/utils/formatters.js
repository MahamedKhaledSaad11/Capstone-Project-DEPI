// ──────────────────────────────────────────────
// EVGuard — Utility Formatters
// ──────────────────────────────────────────────

/**
 * Format a number as a percentage string.
 * @param {number} value - Value between 0 and 1
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return "N/A";
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number with commas and decimals.
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return "N/A";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a metric value with appropriate precision.
 * @param {number} value
 * @returns {string}
 */
export function formatMetric(value) {
  if (value === null || value === undefined) return "N/A";
  return value.toFixed(4);
}

/**
 * Capitalize and clean class names for display.
 * @param {string} className - e.g. "Critical_Overheating"
 * @returns {string} e.g. "Critical Overheating"
 */
export function formatClassName(className) {
  if (!className) return "";
  return className.replace(/_/g, " ");
}

/**
 * Get a human-readable risk description.
 * @param {string} risk - LOW | MEDIUM | HIGH | CRITICAL
 * @returns {string}
 */
export function getRiskDescription(risk) {
  const descriptions = {
    LOW: "All systems operating normally",
    MEDIUM: "Minor issues detected — monitor closely",
    HIGH: "Significant issues detected — action required",
    CRITICAL: "Critical failure risk — immediate action needed",
  };
  return descriptions[risk] || "Unknown risk level";
}

/**
 * Format ISO timestamp to readable date.
 * @param {string} iso
 * @returns {string}
 */
export function formatTimestamp(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
