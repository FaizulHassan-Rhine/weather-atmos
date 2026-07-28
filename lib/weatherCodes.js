import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Cloudy,
  Moon,
  Snowflake,
  Sun,
  CloudSun,
} from "lucide-react";

const CODE_GROUPS = [
  { codes: [0], label: "Clear", dayIcon: Sun, nightIcon: Moon },
  { codes: [1], label: "Mostly clear", dayIcon: Sun, nightIcon: Moon },
  { codes: [2], label: "Partly cloudy", dayIcon: CloudSun, nightIcon: Cloud },
  { codes: [3], label: "Overcast", dayIcon: Cloudy, nightIcon: Cloudy },
  { codes: [45, 48], label: "Fog", dayIcon: CloudFog, nightIcon: CloudFog },
  { codes: [51, 53, 55, 56, 57], label: "Drizzle", dayIcon: CloudDrizzle, nightIcon: CloudDrizzle },
  { codes: [61, 63, 65, 80, 81, 82], label: "Rain", dayIcon: CloudRain, nightIcon: CloudRain },
  { codes: [66, 67], label: "Freezing rain", dayIcon: CloudSnow, nightIcon: CloudSnow },
  { codes: [71, 73, 75, 77, 85, 86], label: "Snow", dayIcon: Snowflake, nightIcon: Snowflake },
  { codes: [95, 96, 99], label: "Thunderstorm", dayIcon: CloudLightning, nightIcon: CloudLightning },
];

function findGroup(code) {
  return (
    CODE_GROUPS.find((group) => group.codes.includes(code)) ?? {
      label: "Clear",
      dayIcon: Sun,
      nightIcon: Moon,
    }
  );
}

/**
 * Map Open-Meteo weather code to label + Lucide icon.
 * @param {number} code
 * @param {boolean} [isDay=true]
 */
export function getWeatherInfo(code, isDay = true) {
  const group = findGroup(Number(code) || 0);
  return {
    label: group.label,
    Icon: isDay ? group.dayIcon : group.nightIcon,
    isPrecip: [
      "Drizzle",
      "Rain",
      "Freezing rain",
      "Snow",
      "Thunderstorm",
    ].includes(group.label),
  };
}

/**
 * Short contextual message based on current conditions.
 */
export function getWeatherMessage({ code, isDay, precipProbability, temperature }) {
  const info = getWeatherInfo(code, isDay);
  const hourFeel = isDay ? "afternoon" : "evening";

  if (info.label === "Thunderstorm") {
    return "Thunderstorms may develop — stay weather-aware";
  }
  if (info.label === "Snow") {
    return "Snowy conditions expected — dress warmly";
  }
  if (info.label === "Freezing rain") {
    return "Icy conditions possible — take care outdoors";
  }
  if (info.label === "Rain" || (precipProbability ?? 0) >= 60) {
    return "Rain may arrive later today";
  }
  if (info.label === "Drizzle") {
    return "Light drizzle may linger through the day";
  }
  if (info.label === "Fog") {
    return "Foggy conditions — visibility may be limited";
  }
  if (info.label === "Overcast") {
    return "A soft, overcast sky for the day ahead";
  }
  if (info.label === "Partly cloudy") {
    return isDay
      ? "Partly cloudy with pleasant intervals of sun"
      : "Partly cloudy skies through the evening";
  }
  if (info.label === "Mostly clear" || info.label === "Clear") {
    if ((temperature ?? 20) >= 28) {
      return `Warm and clear — a bright ${hourFeel}`;
    }
    return isDay
      ? "A calm and pleasant afternoon"
      : "Clear skies throughout the evening";
  }

  return "A calm outlook for the hours ahead";
}

export function windDirectionLabel(degrees) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(((degrees % 360) / 45)) % 8;
  return dirs[index];
}
