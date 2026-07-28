export function getUvRisk(value) {
  if (value == null || Number.isNaN(value)) {
    return { value: null, level: "Unknown", advice: "UV data unavailable.", safeMinutes: null };
  }

  const rounded = Math.round(value * 10) / 10;
  if (rounded >= 11) {
    return {
      value: rounded,
      level: "Extreme",
      advice: "Avoid midday sun, use SPF 50+, and seek full shade.",
      safeMinutes: 10,
    };
  }
  if (rounded >= 8) {
    return {
      value: rounded,
      level: "Very high",
      advice: "Limit direct sun exposure and reapply sunscreen often.",
      safeMinutes: 20,
    };
  }
  if (rounded >= 6) {
    return {
      value: rounded,
      level: "High",
      advice: "Use SPF 30+, a hat, and reduce midday exposure.",
      safeMinutes: 35,
    };
  }
  if (rounded >= 3) {
    return {
      value: rounded,
      level: "Moderate",
      advice: "Use sunscreen for longer outdoor sessions.",
      safeMinutes: 60,
    };
  }
  return {
    value: rounded,
    level: "Low",
    advice: "Low risk, but sun protection is still useful outdoors.",
    safeMinutes: 120,
  };
}

export function getUvPeakWindow(hourly = {}, timezone) {
  const times = hourly.time ?? [];
  const uv = hourly.uv_index ?? [];
  if (!times.length || !uv.length) return null;

  let peakIndex = -1;
  let peak = -Infinity;
  for (let i = 0; i < uv.length; i += 1) {
    const value = uv[i];
    if (value != null && !Number.isNaN(value) && value > peak) {
      peak = value;
      peakIndex = i;
    }
  }
  if (peakIndex < 0) return null;

  const from = formatHour(times[Math.max(0, peakIndex - 1)], timezone);
  const to = formatHour(times[Math.min(times.length - 1, peakIndex + 1)], timezone);
  return { from, to, peak: Math.round(peak * 10) / 10 };
}

function formatHour(iso, timezone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone || undefined,
    }).format(new Date(iso));
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  }
}
