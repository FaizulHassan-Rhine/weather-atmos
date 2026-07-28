import { findCurrentHourIndex, formatHourLabel } from "@/lib/date";

export function getRainOutlook(weather) {
  const hourly = weather?.hourly ?? {};
  const times = hourly.time ?? [];
  const probability = hourly.precipitation_probability ?? [];
  const precipitation = hourly.precipitation ?? [];
  const timezone = weather?.timezone;
  if (!times.length) {
    return {
      currentProbability: null,
      nextRainLabel: "No hourly rain data",
      nextRainIsTime: false,
      expectedAmount: null,
      hourlyWindow: [],
    };
  }

  const nowIndex = findCurrentHourIndex(times, timezone);
  const currentProbability = probability[nowIndex] ?? null;

  let nextRainIndex = -1;
  for (let i = nowIndex; i < Math.min(times.length, nowIndex + 24); i += 1) {
    const chance = probability[i] ?? 0;
    const amount = precipitation[i] ?? 0;
    if (chance >= 40 || amount >= 0.2) {
      nextRainIndex = i;
      break;
    }
  }

  const expectedAmount = precipitation
    .slice(nowIndex, Math.min(times.length, nowIndex + 12))
    .reduce((sum, value) => sum + (value ?? 0), 0);

  const hourlyWindow = times.slice(nowIndex, Math.min(times.length, nowIndex + 12)).map((time, offset) => {
    const index = nowIndex + offset;
    return {
      time,
      label: formatHourLabel(time, timezone),
      chance: probability[index] ?? 0,
    };
  });

  return {
    currentProbability,
    nextRainLabel:
      nextRainIndex >= 0
        ? formatHourLabel(times[nextRainIndex], timezone)
        : "No significant rain expected",
    nextRainIsTime: nextRainIndex >= 0,
    expectedAmount,
    hourlyWindow,
  };
}
