/**
 * Magnitude → risk helpers and display formatters for earthquakes.
 */

export function getRiskInfo(magnitude) {
  const mag = Number(magnitude);

  if (Number.isNaN(mag)) {
    return { level: "Unknown", tone: "muted", label: "Unknown" };
  }
  if (mag < 3) {
    return { level: "Minor", tone: "good", label: "Minor" };
  }
  if (mag < 4) {
    return { level: "Light", tone: "fair", label: "Light" };
  }
  if (mag < 5) {
    return { level: "Moderate", tone: "moderate", label: "Moderate" };
  }
  if (mag < 6) {
    return { level: "Strong", tone: "poor", label: "Strong" };
  }
  if (mag < 7) {
    return { level: "Major", tone: "very-poor", label: "Major" };
  }
  return { level: "Great", tone: "extreme", label: "Great" };
}

export function getDepthCategory(depthKm) {
  const depth = Number(depthKm);
  if (Number.isNaN(depth)) return "Unknown";
  if (depth < 70) return "Shallow";
  if (depth < 300) return "Intermediate";
  return "Deep";
}

export function formatMagnitude(mag) {
  if (mag == null || Number.isNaN(Number(mag))) return "—";
  return Number(mag).toFixed(1);
}

export function formatDepth(depthKm) {
  if (depthKm == null || Number.isNaN(Number(depthKm))) return "—";
  return `${Math.round(Number(depthKm))} km`;
}

export function formatQuakeTime(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function markerRadius(magnitude) {
  const mag = Number(magnitude) || 1;
  return Math.max(6, Math.min(28, mag * 4));
}

export const RISK_TONE_CLASSES = {
  good: "bg-primary/15 text-primary dark:bg-primary/25 dark:text-sky",
  fair: "bg-secondary/15 text-secondary dark:bg-secondary/25 dark:text-sky",
  moderate: "bg-accent/25 text-[#9a6b3a] dark:text-accent",
  poor: "bg-accent/40 text-[#8a5528] dark:text-accent",
  "very-poor": "bg-red-500/15 text-red-700 dark:text-red-300",
  extreme: "bg-red-600/20 text-red-800 dark:text-red-200",
  muted: "bg-sky/20 text-muted",
};

export const RISK_MARKER_COLORS = {
  good: "#4F8F8B",
  fair: "#6F92B5",
  moderate: "#E7B98D",
  poor: "#D4925A",
  "very-poor": "#C45C4A",
  extreme: "#A33B2E",
  muted: "#718087",
};

/**
 * Build timeline buckets for charts (count + max magnitude per day/hour).
 */
export function buildTimeline(events, windowKey = "7d") {
  if (!events?.length) return [];

  const useHours = windowKey === "24h";
  const buckets = new Map();

  events.forEach((event) => {
    if (!event.time) return;
    const date = new Date(event.time);
    const key = useHours
      ? `${date.toISOString().slice(0, 13)}:00`
      : date.toISOString().slice(0, 10);

    const existing = buckets.get(key) || { label: key, count: 0, maxMag: 0 };
    existing.count += 1;
    existing.maxMag = Math.max(existing.maxMag, Number(event.mag) || 0);
    buckets.set(key, existing);
  });

  return [...buckets.values()]
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((item) => ({
      ...item,
      maxMag: Number(item.maxMag.toFixed(1)),
      label: useHours
        ? new Date(item.label).toLocaleTimeString("en-US", {
            hour: "numeric",
          })
        : new Date(item.label).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
    }));
}
