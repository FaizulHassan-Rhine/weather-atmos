const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const REVERSE_GEOCODE_URL =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

const CURRENT_FIELDS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "precipitation",
  "cloud_cover",
  "weather_code",
  "surface_pressure",
  "wind_speed_10m",
  "wind_gusts_10m",
  "wind_direction_10m",
  "dew_point_2m",
  "visibility",
  "is_day",
].join(",");

const HOURLY_FIELDS = [
  "temperature_2m",
  "relative_humidity_2m",
  "wind_speed_10m",
  "precipitation_probability",
  "precipitation",
  "uv_index",
  "weather_code",
  "is_day",
].join(",");

const DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_max",
  "apparent_temperature_min",
  "precipitation_probability_max",
  "precipitation_sum",
  "sunrise",
  "sunset",
  "daylight_duration",
  "sunshine_duration",
  "uv_index_max",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "wind_direction_10m_dominant",
].join(",");

const AIR_QUALITY_CURRENT = [
  "european_aqi",
  "us_aqi",
  "pm2_5",
  "pm10",
  "ozone",
  "nitrogen_dioxide",
  "sulphur_dioxide",
  "carbon_monoxide",
].join(",");

const AIR_QUALITY_HOURLY = [
  "pm2_5",
  "pm10",
  "carbon_monoxide",
  "ozone",
  "nitrogen_dioxide",
  "sulphur_dioxide",
  "us_aqi",
  "european_aqi",
].join(",");

export const SEARCH_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "bn", label: "বাংলা" },
  { code: "hi", label: "हिन्दी" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

/**
 * @typedef {Object} OpenMeteoCurrent
 * @property {number} temperature_2m
 * @property {number} apparent_temperature
 * @property {number} relative_humidity_2m
 * @property {number} precipitation
 * @property {number} cloud_cover
 * @property {number} weather_code
 * @property {number} surface_pressure
 * @property {number} wind_speed_10m
 * @property {number} wind_gusts_10m
 * @property {number} wind_direction_10m
 * @property {number} dew_point_2m
 * @property {number} visibility
 * @property {number} is_day
 */

/**
 * @typedef {Object} OpenMeteoHourly
 * @property {string[]} time
 * @property {number[]} temperature_2m
 * @property {number[]} relative_humidity_2m
 * @property {number[]} wind_speed_10m
 * @property {number[]} precipitation_probability
 * @property {number[]} precipitation
 * @property {number[]} uv_index
 * @property {number[]} weather_code
 * @property {number[]} is_day
 */

/**
 * @typedef {Object} OpenMeteoDaily
 * @property {string[]} time
 * @property {number[]} weather_code
 * @property {number[]} temperature_2m_max
 * @property {number[]} temperature_2m_min
 * @property {number[]} apparent_temperature_max
 * @property {number[]} apparent_temperature_min
 * @property {number[]} precipitation_probability_max
 * @property {number[]} precipitation_sum
 * @property {string[]} sunrise
 * @property {string[]} sunset
 * @property {number[]} daylight_duration
 * @property {number[]} sunshine_duration
 * @property {number[]} uv_index_max
 * @property {number[]} wind_speed_10m_max
 * @property {number[]} wind_gusts_10m_max
 * @property {number[]} wind_direction_10m_dominant
 */

/**
 * @typedef {Object} OpenMeteoWeatherResponse
 * @property {string} timezone
 * @property {OpenMeteoCurrent} current
 * @property {OpenMeteoHourly} hourly
 * @property {OpenMeteoDaily} daily
 */

function mapCityResult(item) {
  return {
    id: `${item.id ?? `${item.latitude}-${item.longitude}`}`,
    name: item.name,
    admin1: item.admin1 ?? "",
    country: item.country ?? "",
    countryCode: item.country_code ?? "",
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone ?? "auto",
  };
}

/**
 * Search cities via Open-Meteo Geocoding API.
 * @param {string} query
 * @param {AbortSignal} [signal]
 * @param {string} [language="en"]
 */
export async function searchCities(query, signal, language = "en") {
  const params = new URLSearchParams({
    name: query,
    count: "8",
    language: language || "en",
    format: "json",
  });

  const response = await fetch(`${GEOCODING_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error("Unable to search cities right now.");
  }

  const data = await response.json();
  return (data.results ?? []).map(mapCityResult);
}

/**
 * Resolve a place name from coordinates (browser-friendly reverse geocode).
 */
export async function reverseGeocode({ latitude, longitude }, signal, language = "en") {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: language || "en",
  });

  const response = await fetch(`${REVERSE_GEOCODE_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error("Unable to resolve location name.");
  }

  const data = await response.json();
  const name =
    data.city ||
    data.locality ||
    data.principalSubdivision ||
    data.countryName ||
    "Current location";

  return {
    id: `geo-${Number(latitude).toFixed(4)}-${Number(longitude).toFixed(4)}`,
    name,
    admin1: data.principalSubdivision ?? "",
    country: data.countryName ?? "",
    countryCode: data.countryCode ?? "",
    latitude: Number(latitude),
    longitude: Number(longitude),
    timezone: "auto",
  };
}

/**
 * Fetch forecast for a location.
 * @param {{ latitude: number, longitude: number }} location
 * @param {AbortSignal} [signal]
 * @returns {Promise<OpenMeteoWeatherResponse>}
 */
export async function getWeather(location, signal) {
  const { latitude, longitude } = location;

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: CURRENT_FIELDS,
    hourly: HOURLY_FIELDS,
    daily: DAILY_FIELDS,
    timezone: "auto",
    forecast_days: "8",
  });

  const response = await fetch(`${FORECAST_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error("Unable to load weather data.");
  }

  return response.json();
}

/**
 * Fetch air quality for a location.
 * @param {{ latitude: number, longitude: number }} location
 * @param {AbortSignal} [signal]
 * @param {{ includeHourly?: boolean, forecastDays?: number, pastDays?: number }} [options]
 */
export async function getAirQuality(location, signal, options = {}) {
  const {
    includeHourly = false,
    forecastDays = 3,
    pastDays = 1,
  } = options;
  const { latitude, longitude } = location;

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: AIR_QUALITY_CURRENT,
    timezone: "auto",
  });

  if (includeHourly) {
    params.set("hourly", AIR_QUALITY_HOURLY);
    params.set("forecast_days", String(forecastDays));
    params.set("past_days", String(pastDays));
  }

  const response = await fetch(`${AIR_QUALITY_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error("Unable to load air quality data.");
  }

  return response.json();
}

/**
 * Fetch rain radar frame timestamps from RainViewer (no API key).
 */
export async function getRainViewerFrames(signal) {
  const response = await fetch(
    "https://api.rainviewer.com/public/weather-maps.json",
    { signal }
  );

  if (!response.ok) {
    throw new Error("Unable to load rain radar.");
  }

  const data = await response.json();
  const past = data?.radar?.past ?? [];
  const nowcast = data?.radar?.nowcast ?? [];
  const frames = [...past, ...nowcast];
  const latest = frames[frames.length - 1];

  return {
    host: data.host,
    path: latest?.path ?? null,
    frames,
  };
}

/** Default fallback city when geolocation is unavailable. */
export const DHAKA = {
  id: "dhaka-bd",
  name: "Dhaka",
  admin1: "Dhaka Division",
  country: "Bangladesh",
  countryCode: "BD",
  latitude: 23.8103,
  longitude: 90.4125,
  timezone: "Asia/Dhaka",
};
