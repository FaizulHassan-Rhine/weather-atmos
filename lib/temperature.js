/**
 * Convert Celsius to Fahrenheit.
 * @param {number} celsius
 */
export function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

/**
 * Format a temperature value for the active unit.
 * @param {number|null|undefined} celsius
 * @param {'c'|'f'} unit
 * @param {{ digits?: number, withUnit?: boolean }} [options]
 */
export function formatTemperature(celsius, unit = "c", options = {}) {
  const { digits = 0, withUnit = true } = options;

  if (celsius == null || Number.isNaN(celsius)) {
    return "—";
  }

  const value = unit === "f" ? celsiusToFahrenheit(celsius) : celsius;
  const rounded = Number(value).toFixed(digits);
  return withUnit ? `${rounded}°${unit === "f" ? "F" : "C"}` : `${rounded}°`;
}

export function formatWindSpeed(kmh, unit = "c") {
  if (kmh == null || Number.isNaN(kmh)) return "—";

  if (unit === "f") {
    const mph = kmh * 0.621371;
    return `${Math.round(mph)} mph`;
  }

  return `${Math.round(kmh)} km/h`;
}

export function formatVisibility(meters, unit = "c") {
  if (meters == null || Number.isNaN(meters)) return "—";

  if (unit === "f") {
    const miles = meters / 1609.34;
    return `${miles >= 10 ? Math.round(miles) : miles.toFixed(1)} mi`;
  }

  const km = meters / 1000;
  return `${km >= 10 ? Math.round(km) : km.toFixed(1)} km`;
}

export function formatPressure(hPa) {
  if (hPa == null || Number.isNaN(hPa)) return "—";
  return `${Math.round(hPa)} hPa`;
}

export function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.round(value)}%`;
}

export function formatUvIndex(value) {
  if (value == null || Number.isNaN(value)) return "—";
  const rounded = Math.round(value * 10) / 10;
  let level = "Low";
  if (rounded >= 11) level = "Extreme";
  else if (rounded >= 8) level = "Very high";
  else if (rounded >= 6) level = "High";
  else if (rounded >= 3) level = "Moderate";
  return { value: rounded, level };
}
