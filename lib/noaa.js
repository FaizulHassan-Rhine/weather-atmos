import { geometryToPoint } from "@/lib/disasters";

const NOAA_HEADERS = {
  "User-Agent": "AtmosWeather/1.0 (https://github.com; disaster-monitor)",
  Accept: "application/geo+json",
};

const NWS_ALERTS_URL =
  "https://api.weather.gov/alerts/active?status=actual&message_type=alert&severity=Extreme,Severe";
const NHC_STORMS_URL = "https://www.nhc.noaa.gov/CurrentStorms.json";

function classifyAlert(eventName = "") {
  const name = String(eventName).toLowerCase();
  if (
    /(tornado|hurricane|tropical|thunderstorm|blizzard|cyclone|typhoon|storm surge|extreme wind|high wind)/.test(
      name
    )
  ) {
    return "storm";
  }
  if (/(flood|flash flood)/.test(name)) return "flood";
  if (/(fire weather|red flag|wildfire)/.test(name)) return "wildfire";
  return "emergency";
}

function mapSeverity(value) {
  const sev = String(value || "").toLowerCase();
  if (sev === "extreme") return "extreme";
  if (sev === "severe") return "severe";
  if (sev === "moderate") return "moderate";
  return "minor";
}

function parseNhclLatLon(value, fallback) {
  if (typeof fallback === "number" && !Number.isNaN(fallback)) return fallback;
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)([NSEW])$/i);
  if (!match) {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  }
  const amount = Number(match[1]);
  const dir = match[2].toUpperCase();
  if (dir === "S" || dir === "W") return -Math.abs(amount);
  return Math.abs(amount);
}

export function normalizeNwsAlert(feature) {
  const props = feature.properties || {};
  const point = geometryToPoint(feature.geometry);
  const eventName = props.event || "Weather alert";

  return {
    id: `noaa-${props.id || feature.id || `${eventName}-${props.sent}`}`,
    type: classifyAlert(eventName),
    source: "noaa",
    title: eventName,
    place: props.areaDesc || props.headline || eventName,
    time: props.onset || props.effective || props.sent || null,
    latitude: point?.latitude ?? null,
    longitude: point?.longitude ?? null,
    url: props.web || props["@id"] || "",
    severity: mapSeverity(props.severity),
    category: eventName,
    description: props.headline || props.instruction || "",
    status: props.status || "Actual",
    urgency: props.urgency || "",
    certainty: props.certainty || "",
    ends: props.ends || props.expires || null,
  };
}

export function normalizeNhclStorm(storm) {
  const latitude = parseNhclLatLon(storm.latitude, storm.latitudeNumeric);
  const longitude = parseNhclLatLon(storm.longitude, storm.longitudeNumeric);
  const classification = String(storm.classification || "").toUpperCase();
  const intensity = Number(storm.intensity);
  const severity =
    classification === "HU" || intensity >= 96
      ? "extreme"
      : intensity >= 64
        ? "severe"
        : "moderate";

  return {
    id: `noaa-nhc-${storm.id || storm.name}`,
    type: "storm",
    source: "noaa",
    title: storm.name
      ? `Tropical cyclone ${storm.name}`
      : "Active tropical cyclone",
    place: storm.name || "Tropical cyclone",
    time: storm.lastUpdate || null,
    latitude,
    longitude,
    url: storm.publicAdvisory?.url || storm.forecastAdvisory?.url || "",
    severity,
    category: classification || "Tropical cyclone",
    description: storm.movementDir
      ? `Moving ${storm.movementDir}° at ${storm.movementSpeed || "—"} kt`
      : "",
    magnitudeValue: Number.isNaN(intensity) ? null : intensity,
    magnitudeUnit: "kts",
    pressure: storm.pressure ? `${storm.pressure} mb` : "",
    status: "active",
  };
}

async function fetchJson(url, signal, headers = NOAA_HEADERS) {
  const response = await fetch(url, { signal, headers });
  if (!response.ok) {
    throw new Error(`NOAA request failed (${response.status})`);
  }
  return response.json();
}

/**
 * Fetch NOAA NWS severe alerts and NHC tropical cyclones.
 * Intended for server-side use (User-Agent required by NWS).
 */
export async function getNoaaEvents(signal) {
  const alertsResult = await Promise.allSettled([
    fetchJson(NWS_ALERTS_URL, signal),
    fetchJson(NHC_STORMS_URL, signal, {
      "User-Agent": NOAA_HEADERS["User-Agent"],
      Accept: "application/json",
    }),
  ]);

  const alerts =
    alertsResult[0].status === "fulfilled"
      ? (alertsResult[0].value.features || [])
          .map(normalizeNwsAlert)
          .filter((event) => event.latitude != null && event.longitude != null)
      : [];

  const storms =
    alertsResult[1].status === "fulfilled"
      ? (alertsResult[1].value.activeStorms || [])
          .map(normalizeNhclStorm)
          .filter((event) => event.latitude != null && event.longitude != null)
      : [];

  if (!alerts.length && !storms.length) {
    const firstError =
      alertsResult.find((item) => item.status === "rejected")?.reason;
    if (firstError) {
      throw new Error(firstError.message || "Unable to load NOAA events.");
    }
  }

  const seen = new Set();
  const events = [...storms, ...alerts].filter((event) => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });

  return {
    events: events.slice(0, 180),
    count: events.length,
    generated: new Date().toISOString(),
    sources: {
      nws: alertsResult[0].status === "fulfilled",
      nhc: alertsResult[1].status === "fulfilled",
    },
  };
}
