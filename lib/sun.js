function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function getDaylightProgress({ sunrise, sunset, now = new Date() }) {
  const sunriseDate = toDate(sunrise);
  const sunsetDate = toDate(sunset);
  if (!sunriseDate || !sunsetDate) {
    return { percent: 0, isDaylight: false };
  }

  const total = sunsetDate.getTime() - sunriseDate.getTime();
  if (total <= 0) return { percent: 0, isDaylight: false };

  const elapsed = now.getTime() - sunriseDate.getTime();
  const percent = clamp((elapsed / total) * 100, 0, 100);
  const isDaylight = elapsed >= 0 && elapsed <= total;
  return { percent, isDaylight };
}

// Estimate civil twilight using solar geometry and latitude.
export function estimateCivilTwilight({ sunrise, sunset, latitude }) {
  const sunriseDate = toDate(sunrise);
  const sunsetDate = toDate(sunset);
  if (!sunriseDate || !sunsetDate || latitude == null || Number.isNaN(latitude)) {
    return { dawn: null, dusk: null };
  }

  const dayOfYear = Math.floor(
    (Date.UTC(
      sunriseDate.getUTCFullYear(),
      sunriseDate.getUTCMonth(),
      sunriseDate.getUTCDate()
    ) -
      Date.UTC(sunriseDate.getUTCFullYear(), 0, 0)) /
      86400000
  );

  const latRad = (latitude * Math.PI) / 180;
  const decl = ((23.44 * Math.PI) / 180) * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));
  const zenithSunrise = (90.833 * Math.PI) / 180;
  const zenithCivil = (96 * Math.PI) / 180;

  const cosH = (Math.cos(zenithSunrise) - Math.sin(latRad) * Math.sin(decl)) /
    (Math.cos(latRad) * Math.cos(decl));
  const cosCivil = (Math.cos(zenithCivil) - Math.sin(latRad) * Math.sin(decl)) /
    (Math.cos(latRad) * Math.cos(decl));

  if (Math.abs(cosH) > 1 || Math.abs(cosCivil) > 1) {
    return { dawn: null, dusk: null };
  }

  const hSunrise = Math.acos(cosH);
  const hCivil = Math.acos(cosCivil);
  const deltaHours = ((hCivil - hSunrise) * 180) / (Math.PI * 15);
  const deltaMs = Math.max(0, deltaHours * 3600000);

  return {
    dawn: new Date(sunriseDate.getTime() - deltaMs).toISOString(),
    dusk: new Date(sunsetDate.getTime() + deltaMs).toISOString(),
  };
}
