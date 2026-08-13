/**
 * Shared types, colors, and helpers for the Global Disaster Monitor.
 */

import {
  formatQuakeTime,
  getRiskInfo,
} from "@/lib/earthquake";

export const DISASTER_TYPES = [
  { id: "earthquake", label: "Earthquakes", source: "USGS" },
  { id: "storm", label: "Storms", source: "NOAA / NASA EONET" },
  { id: "wildfire", label: "Wildfires", source: "NASA EONET" },
  { id: "flood", label: "Floods", source: "NASA EONET / NOAA" },
  { id: "emergency", label: "Emergency", source: "NASA EONET / NOAA" },
];

export const DISASTER_TYPE_IDS = DISASTER_TYPES.map((item) => item.id);

export function isAllDisasterTypes(types) {
  return !types?.length || types.length === DISASTER_TYPE_IDS.length;
}

export function toggleDisasterTypes(currentTypes, id) {
  const current = currentTypes?.length
    ? [...currentTypes]
    : [...DISASTER_TYPE_IDS];

  if (isAllDisasterTypes(current)) {
    return [id];
  }

  if (current.includes(id)) {
    const next = current.filter((item) => item !== id);
    return next.length ? next : [...DISASTER_TYPE_IDS];
  }

  return [...current, id];
}

export const DISASTER_COLORS = {
  earthquake: "#C45C4A",
  storm: "#6F92B5",
  wildfire: "#D4925A",
  flood: "#4F8F8B",
  emergency: "#8B6FBF",
};

export const SEVERITY_TONE_CLASSES = {
  minor: "bg-primary/15 text-primary dark:bg-primary/25 dark:text-sky",
  moderate: "bg-accent/25 text-[#9a6b3a] dark:text-accent",
  severe: "bg-red-500/15 text-red-700 dark:text-red-300",
  extreme: "bg-red-600/20 text-red-800 dark:text-red-200",
  muted: "bg-sky/20 text-muted",
};

export const WINDOW_DAYS = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
};

export function severityFromMagnitude(magnitude) {
  const risk = getRiskInfo(magnitude);
  if (risk.level === "Great" || risk.level === "Major") return "extreme";
  if (risk.level === "Strong") return "severe";
  if (risk.level === "Moderate") return "moderate";
  if (risk.level === "Unknown") return "minor";
  return "minor";
}

export function formatSeverity(severity) {
  if (!severity) return "Unknown";
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export function formatEventTime(iso) {
  return formatQuakeTime(iso);
}

export function sourceLabel(source) {
  if (source === "usgs") return "USGS";
  if (source === "eonet") return "NASA EONET";
  if (source === "noaa") return "NOAA";
  return source || "Unknown";
}

export function typeLabel(type) {
  const match = DISASTER_TYPES.find((item) => item.id === type);
  return match?.label || "Emergency";
}

export function markerScale(event) {
  if (event?.type === "earthquake") {
    const mag = Number(event.mag) || 1;
    return Math.max(10, Math.min(30, mag * 4.5));
  }
  if (event?.severity === "extreme") return 18;
  if (event?.severity === "severe") return 15;
  if (event?.severity === "moderate") return 12;
  return 10;
}

export function toRadians(deg) {
  return (Number(deg) * Math.PI) / 180;
}

export function haversineKm(a, b) {
  if (
    a?.latitude == null ||
    a?.longitude == null ||
    b?.latitude == null ||
    b?.longitude == null
  ) {
    return Infinity;
  }

  const R = 6371;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function centroidOfRing(ring = []) {
  if (!ring.length) return null;
  let sumLng = 0;
  let sumLat = 0;
  let count = 0;

  ring.forEach((pair) => {
    if (!Array.isArray(pair) || pair.length < 2) return;
    sumLng += Number(pair[0]);
    sumLat += Number(pair[1]);
    count += 1;
  });

  if (!count) return null;
  return { longitude: sumLng / count, latitude: sumLat / count };
}

export function geometryToPoint(geometry) {
  if (!geometry) return null;

  if (geometry.type === "Point" && Array.isArray(geometry.coordinates)) {
    return {
      longitude: Number(geometry.coordinates[0]),
      latitude: Number(geometry.coordinates[1]),
    };
  }

  if (geometry.type === "MultiPoint" && Array.isArray(geometry.coordinates)) {
    const last = geometry.coordinates[geometry.coordinates.length - 1];
    if (!last) return null;
    return { longitude: Number(last[0]), latitude: Number(last[1]) };
  }

  if (geometry.type === "LineString" && Array.isArray(geometry.coordinates)) {
    const last = geometry.coordinates[geometry.coordinates.length - 1];
    if (!last) return null;
    return { longitude: Number(last[0]), latitude: Number(last[1]) };
  }

  if (geometry.type === "Polygon") {
    return centroidOfRing(geometry.coordinates?.[0] || []);
  }

  if (geometry.type === "MultiPolygon") {
    return centroidOfRing(geometry.coordinates?.[0]?.[0] || []);
  }

  return null;
}

export function latestEonetGeometry(geometry = []) {
  if (!Array.isArray(geometry) || !geometry.length) return null;

  for (let i = geometry.length - 1; i >= 0; i -= 1) {
    const item = geometry[i];
    const point = geometryToPoint(item);
    if (!point) continue;
    return {
      ...point,
      date: item.date || null,
      magnitudeValue: item.magnitudeValue ?? null,
      magnitudeUnit: item.magnitudeUnit || "",
    };
  }

  return null;
}

export function withinWindow(iso, windowKey) {
  if (!iso) return true;
  const days = WINDOW_DAYS[windowKey] ?? 7;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return true;
  return Date.now() - then <= days * 24 * 60 * 60 * 1000;
}

export function filterDisasterEvents(events, filters = {}) {
  const {
    types,
    window = "7d",
    radiusKm = null,
    latitude,
    longitude,
    minMagnitude = 2.5,
    maxDepth = null,
  } = filters;

  const typeSet =
    Array.isArray(types) && types.length
      ? new Set(types)
      : new Set(DISASTER_TYPE_IDS);

  return (events || []).filter((event) => {
    if (!typeSet.has(event.type)) return false;

    if (event.type === "earthquake") {
      if (event.mag != null && Number(event.mag) < Number(minMagnitude)) {
        return false;
      }
      if (
        maxDepth != null &&
        event.depth != null &&
        Number(event.depth) > Number(maxDepth)
      ) {
        return false;
      }
    }

    // NOAA active alerts stay visible even if they began earlier.
    if (event.source !== "noaa" && !withinWindow(event.time, window)) {
      return false;
    }

    if (
      radiusKm != null &&
      Number(radiusKm) > 0 &&
      latitude != null &&
      longitude != null
    ) {
      if (event.latitude == null || event.longitude == null) return false;
      const distance = haversineKm(
        { latitude, longitude },
        { latitude: event.latitude, longitude: event.longitude }
      );
      if (distance > Number(radiusKm)) return false;
    }

    return true;
  });
}

export function countByType(events = []) {
  const counts = Object.fromEntries(DISASTER_TYPE_IDS.map((id) => [id, 0]));
  events.forEach((event) => {
    if (counts[event.type] != null) counts[event.type] += 1;
  });
  return counts;
}

/**
 * Timeline buckets with per-type counts.
 */
export function buildDisasterTimeline(events, windowKey = "7d") {
  if (!events?.length) return [];

  const useHours = windowKey === "24h";
  const buckets = new Map();

  events.forEach((event) => {
    if (!event.time) return;
    const date = new Date(event.time);
    if (Number.isNaN(date.getTime())) return;
    const key = useHours
      ? `${date.toISOString().slice(0, 13)}:00`
      : date.toISOString().slice(0, 10);

    const existing =
      buckets.get(key) ||
      {
        key,
        earthquake: 0,
        storm: 0,
        wildfire: 0,
        flood: 0,
        emergency: 0,
        total: 0,
      };

    if (existing[event.type] != null) existing[event.type] += 1;
    existing.total += 1;
    buckets.set(key, existing);
  });

  return [...buckets.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((item) => ({
      ...item,
      label: useHours
        ? new Date(item.key).toLocaleTimeString("en-US", { hour: "numeric" })
        : new Date(item.key).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
    }));
}

export function earthquakeToDisaster(event) {
  return {
    id: `usgs-${event.id}`,
    type: "earthquake",
    source: "usgs",
    title: event.place || "Earthquake",
    place: event.place || "Unknown location",
    time: event.time,
    latitude: event.latitude,
    longitude: event.longitude,
    url: event.url || "",
    severity: severityFromMagnitude(event.mag),
    category: "Earthquake",
    description: "",
    mag: event.mag,
    depth: event.depth,
    tsunami: Boolean(event.tsunami),
    felt: event.felt,
    status: event.status || "",
  };
}
