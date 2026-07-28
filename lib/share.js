/**
 * Serialize / parse shareable city query params.
 */

export function cityToSearchParams(city) {
  if (!city) return new URLSearchParams();

  const params = new URLSearchParams();
  params.set("lat", String(city.latitude));
  params.set("lon", String(city.longitude));
  if (city.name) params.set("name", city.name);
  if (city.country) params.set("country", city.country);
  if (city.admin1) params.set("admin1", city.admin1);
  if (city.countryCode) params.set("cc", city.countryCode);
  if (city.timezone && city.timezone !== "auto") {
    params.set("tz", city.timezone);
  }
  return params;
}

export function cityFromSearchParams(searchParams) {
  const lat = parseFloat(searchParams.get("lat"));
  const lon = parseFloat(searchParams.get("lon"));

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }

  const name = searchParams.get("name") || "Shared location";

  return {
    id: `share-${lat.toFixed(4)}-${lon.toFixed(4)}`,
    name,
    admin1: searchParams.get("admin1") || "",
    country: searchParams.get("country") || "",
    countryCode: searchParams.get("cc") || "",
    latitude: lat,
    longitude: lon,
    timezone: searchParams.get("tz") || "auto",
  };
}

export function buildShareUrl(city, origin) {
  if (!city || typeof origin !== "string") return "";
  const params = cityToSearchParams(city);
  return `${origin}/?${params.toString()}`;
}
