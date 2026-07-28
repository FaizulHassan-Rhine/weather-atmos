/**
 * European AQI category helpers and air-quality formatting.
 */

export function getAqiInfo(europeanAqi) {
  const value = Number(europeanAqi);

  if (Number.isNaN(value)) {
    return { level: "Unknown", detail: "No data", tone: "muted" };
  }

  if (value <= 20) {
    return { level: "Good", detail: "Air quality is satisfactory", tone: "good" };
  }
  if (value <= 40) {
    return {
      level: "Fair",
      detail: "Acceptable for most people",
      tone: "fair",
    };
  }
  if (value <= 60) {
    return {
      level: "Moderate",
      detail: "Sensitive groups may notice effects",
      tone: "moderate",
    };
  }
  if (value <= 80) {
    return {
      level: "Poor",
      detail: "Consider limiting outdoor exertion",
      tone: "poor",
    };
  }
  if (value <= 100) {
    return {
      level: "Very poor",
      detail: "Reduce prolonged outdoor activity",
      tone: "very-poor",
    };
  }

  return {
    level: "Extremely poor",
    detail: "Avoid outdoor exertion if possible",
    tone: "extreme",
  };
}

export function formatPollutant(value, unit = "µg/m³", digits = 0) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${Number(value).toFixed(digits)} ${unit}`;
}
