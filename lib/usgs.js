const USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query";

const WINDOW_HOURS = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};

function toStartTime(windowKey) {
  const hours = WINDOW_HOURS[windowKey] ?? 24 * 7;
  const start = new Date(Date.now() - hours * 60 * 60 * 1000);
  return start.toISOString();
}

/**
 * Normalize a USGS GeoJSON feature.
 */
function normalizeFeature(feature) {
  const props = feature.properties || {};
  const coords = feature.geometry?.coordinates || [];
  return {
    id: feature.id || props.code || `${coords[0]}-${coords[1]}-${props.time}`,
    mag: props.mag == null ? null : Number(props.mag),
    place: props.place || "Unknown location",
    time: props.time ? new Date(props.time).toISOString() : null,
    updated: props.updated ? new Date(props.updated).toISOString() : null,
    depth: coords[2] == null ? null : Number(coords[2]),
    longitude: coords[0] == null ? null : Number(coords[0]),
    latitude: coords[1] == null ? null : Number(coords[1]),
    url: props.url || "",
    tsunami: Boolean(props.tsunami),
    felt: props.felt,
    status: props.status || "",
    type: props.type || "earthquake",
  };
}

/**
 * Fetch recent earthquakes from USGS FDSN Event API.
 * @param {{
 *   minMagnitude?: number,
 *   maxDepth?: number|null,
 *   window?: '24h'|'7d'|'30d',
 *   latitude?: number,
 *   longitude?: number,
 *   radiusKm?: number|null,
 *   limit?: number,
 * }} options
 * @param {AbortSignal} [signal]
 */
export async function getEarthquakes(options = {}, signal) {
  const {
    minMagnitude = 2.5,
    maxDepth = null,
    window = "7d",
    latitude,
    longitude,
    radiusKm = null,
    limit = 200,
  } = options;

  const params = new URLSearchParams({
    format: "geojson",
    orderby: "time",
    starttime: toStartTime(window),
    minmagnitude: String(minMagnitude),
    limit: String(limit),
  });

  if (
    latitude != null &&
    longitude != null &&
    radiusKm != null &&
    Number(radiusKm) > 0
  ) {
    params.set("latitude", String(latitude));
    params.set("longitude", String(longitude));
    params.set("maxradiuskm", String(radiusKm));
  }

  const response = await fetch(`${USGS_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error("Unable to load earthquake data.");
  }

  const data = await response.json();
  let events = (data.features || []).map(normalizeFeature);

  if (maxDepth != null && !Number.isNaN(Number(maxDepth))) {
    events = events.filter(
      (event) => event.depth != null && event.depth <= Number(maxDepth)
    );
  }

  return {
    events,
    count: events.length,
    generated: data.metadata?.generated
      ? new Date(data.metadata.generated).toISOString()
      : new Date().toISOString(),
  };
}
