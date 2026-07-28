import { getAqiInfo } from "./airQuality";

/**
 * Health guidance based on European AQI and pollutant levels.
 */
export function getHealthRecommendations({ europeanAqi, pm25, ozone }) {
  const aqi = getAqiInfo(europeanAqi);
  const tips = [];

  switch (aqi.tone) {
    case "good":
      tips.push("Air quality is good — outdoor activities are fine for most people.");
      tips.push("Open windows for fresh ventilation when convenient.");
      break;
    case "fair":
      tips.push("Air quality is acceptable for most people.");
      tips.push("Sensitive individuals may prefer lighter outdoor exertion.");
      break;
    case "moderate":
      tips.push("Sensitive groups should reduce prolonged or heavy outdoor activity.");
      tips.push("Consider shorter outdoor sessions and monitor how you feel.");
      break;
    case "poor":
      tips.push("Limit outdoor exertion, especially for children and older adults.");
      tips.push("Keep indoor air cleaner by closing windows during peak pollution.");
      break;
    case "very-poor":
    case "extreme":
      tips.push("Avoid outdoor exercise and reduce time outdoors when possible.");
      tips.push("Use a well-fitting mask outdoors if you must travel through polluted air.");
      break;
    default:
      tips.push("Monitor local air quality updates before planning outdoor activity.");
  }

  if ((pm25 ?? 0) >= 35) {
    tips.push("PM2.5 is elevated — fine particles can irritate lungs and heart.");
  }
  if ((ozone ?? 0) >= 120) {
    tips.push("Ozone is elevated — schedule outdoor activity for early morning if needed.");
  }

  return {
    level: aqi.level,
    detail: aqi.detail,
    tone: aqi.tone,
    tips: tips.slice(0, 4),
  };
}

export function formatPollutantChartValue(value, digits = 0) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(Number(value).toFixed(digits));
}
