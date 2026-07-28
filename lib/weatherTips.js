import { getWeatherInfo } from "./weatherCodes";

/**
 * Derive weather alerts and clothing tips from current conditions.
 */
export function getWeatherTips({
  code,
  temperature,
  apparentTemperature,
  windSpeed,
  uvIndex,
  precipProbability,
  isDay,
  humidity,
}) {
  const info = getWeatherInfo(code, isDay);
  const alerts = [];
  const wear = [];

  const temp = apparentTemperature ?? temperature ?? 20;
  const wind = windSpeed ?? 0;
  const uv = uvIndex ?? 0;
  const precip = precipProbability ?? 0;

  if (info.label === "Thunderstorm") {
    alerts.push({
      severity: "high",
      title: "Thunderstorm risk",
      message: "Seek sturdy shelter and avoid open areas if storms develop.",
    });
  }

  if (info.label === "Freezing rain" || info.label === "Snow") {
    alerts.push({
      severity: "high",
      title: "Wintry conditions",
      message: "Roads may be slippery — allow extra travel time.",
    });
  }

  if (info.label === "Fog") {
    alerts.push({
      severity: "medium",
      title: "Reduced visibility",
      message: "Drive carefully and use low-beam lights in fog.",
    });
  }

  if (precip >= 60 || info.isPrecip) {
    alerts.push({
      severity: "medium",
      title: "Rain likely",
      message: "Keep an umbrella or rain jacket handy today.",
    });
  }

  if (uv >= 6 && isDay) {
    alerts.push({
      severity: uv >= 8 ? "high" : "medium",
      title: "High UV index",
      message: "Seek shade midday and use sunscreen if outdoors.",
    });
  }

  if (wind >= 40) {
    alerts.push({
      severity: "medium",
      title: "Strong winds",
      message: "Secure loose outdoor items and watch for gusts.",
    });
  }

  if (temp >= 32) {
    alerts.push({
      severity: "medium",
      title: "Heat caution",
      message: "Stay hydrated and take breaks in cooler spaces.",
    });
  }

  if (temp <= 5) {
    alerts.push({
      severity: "medium",
      title: "Cold conditions",
      message: "Layer up and cover extremities if heading outside.",
    });
  }

  // Clothing tips
  if (temp >= 28) {
    wear.push("Light, breathable fabrics");
    wear.push("Sunglasses and a sun hat");
  } else if (temp >= 20) {
    wear.push("Comfortable short sleeves or a light shirt");
  } else if (temp >= 12) {
    wear.push("A light jacket or long sleeves");
  } else if (temp >= 5) {
    wear.push("A warm coat and closed shoes");
  } else {
    wear.push("Heavy layers, gloves, and a warm hat");
  }

  if (precip >= 40 || info.isPrecip) {
    wear.push("Waterproof outer layer or umbrella");
  }

  if (wind >= 25) {
    wear.push("A wind-resistant layer");
  }

  if (uv >= 5 && isDay) {
    wear.push("SPF sunscreen for exposed skin");
  }

  if ((humidity ?? 0) >= 80 && temp >= 24) {
    wear.push("Moisture-wicking clothes for humidity");
  }

  if (!isDay && info.label === "Clear") {
    wear.push("A light extra layer for cooler nights");
  }

  const summary =
    wear.length > 0
      ? `What to wear: ${wear.slice(0, 3).join(" · ")}`
      : "Dress for comfort based on how you feel outdoors.";

  return {
    alerts: alerts.slice(0, 4),
    wear: wear.slice(0, 5),
    summary,
  };
}
