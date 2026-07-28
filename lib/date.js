/**
 * Format helpers that respect the forecast timezone when provided.
 */

export function formatLocalDateTime(timezone) {
  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };

  try {
    return new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: timezone || undefined,
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-US", options).format(new Date());
  }
}

export function formatHourLabel(isoString, timezone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: true,
      timeZone: timezone || undefined,
    }).format(new Date(isoString));
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: true,
    }).format(new Date(isoString));
  }
}

export function formatDayName(isoString, timezone, options = {}) {
  const { short = false } = options;

  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: short ? "short" : "long",
      timeZone: timezone || undefined,
    }).format(new Date(isoString));
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      weekday: short ? "short" : "long",
    }).format(new Date(isoString));
  }
}

export function formatSunTime(isoString, timezone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone || undefined,
    }).format(new Date(isoString));
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(isoString));
  }
}

/**
 * Find the index of the hourly slot closest to "now" in the given timezone.
 */
export function findCurrentHourIndex(hourlyTimes, timezone) {
  if (!hourlyTimes?.length) return 0;

  const now = new Date();
  let bestIndex = 0;
  let bestDiff = Infinity;

  hourlyTimes.forEach((time, index) => {
    const diff = Math.abs(new Date(time).getTime() - now.getTime());
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = index;
    }
  });

  // Prefer not to jump far ahead when timezone parsing is imperfect
  void timezone;
  return bestIndex;
}
