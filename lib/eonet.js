import {
  latestEonetGeometry,
} from "@/lib/disasters";

const EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events";

const CATEGORIES =
  "wildfires,severeStorms,floods,volcanoes,landslides,drought,dustHaze,snow,tempExtremes,manmade";

function mapCategory(categoryId) {
  if (categoryId === "wildfires") return "wildfire";
  if (categoryId === "severeStorms") return "storm";
  if (categoryId === "floods") return "flood";
  return "emergency";
}

function severityForEvent(type, magnitudeValue) {
  const mag = Number(magnitudeValue);
  if (type === "storm" && !Number.isNaN(mag)) {
    if (mag >= 96 || mag >= 4) return "extreme";
    if (mag >= 64 || mag >= 1) return "severe";
    return "moderate";
  }
  if (type === "flood") return "severe";
  if (type === "emergency") return "severe";
  return "moderate";
}

export function normalizeEonetEvent(event) {
  const category = event.categories?.[0] || {};
  const type = mapCategory(category.id);
  const point = latestEonetGeometry(event.geometry || []);
  const sourceUrl = event.sources?.[0]?.url || event.link || "";

  return {
    id: `eonet-${event.id}`,
    type,
    source: "eonet",
    title: event.title || category.title || "Natural event",
    place: event.title || "Unknown location",
    time: point?.date || null,
    latitude: point?.latitude ?? null,
    longitude: point?.longitude ?? null,
    url: sourceUrl,
    severity: severityForEvent(type, point?.magnitudeValue),
    category: category.title || type,
    description: event.description || "",
    magnitudeValue: point?.magnitudeValue ?? null,
    magnitudeUnit: point?.magnitudeUnit || "",
    status: event.closed ? "closed" : "open",
  };
}

/**
 * Fetch open NASA EONET events for storms, wildfires, floods, and other hazards.
 * @param {{ days?: number, limit?: number }} options
 * @param {AbortSignal} [signal]
 */
export async function getEonetEvents(options = {}, signal) {
  const { days = 7, limit = 150 } = options;

  const params = new URLSearchParams({
    status: "open",
    category: CATEGORIES,
    days: String(days),
    limit: String(limit),
  });

  const response = await fetch(`${EONET_URL}?${params}`, { signal });
  if (!response.ok) {
    throw new Error("Unable to load NASA EONET events.");
  }

  const data = await response.json();
  const events = (data.events || [])
    .map(normalizeEonetEvent)
    .filter((event) => event.latitude != null && event.longitude != null);

  return {
    events,
    count: events.length,
    generated: new Date().toISOString(),
  };
}
