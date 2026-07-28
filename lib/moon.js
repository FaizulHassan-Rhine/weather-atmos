/**
 * Approximate moon phase from Julian date (no external API).
 * Returns illumination 0–1 and a friendly label.
 */
export function getMoonPhase(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day =
    date.getDate() +
    date.getHours() / 24 +
    date.getMinutes() / 1440 +
    date.getSeconds() / 86400;

  let y = year;
  let m = month;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5;

  // Synodic month reference: known new moon around 2451549.5 (2000-01-06)
  const daysSinceNew = jd - 2451549.5;
  const synodic = 29.53058867;
  const phase = ((daysSinceNew % synodic) + synodic) % synodic;
  const fraction = phase / synodic;
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;

  let label = "New moon";
  let emojiHint = "new";

  if (fraction < 0.03 || fraction > 0.97) {
    label = "New moon";
    emojiHint = "new";
  } else if (fraction < 0.22) {
    label = "Waxing crescent";
    emojiHint = "waxing-crescent";
  } else if (fraction < 0.28) {
    label = "First quarter";
    emojiHint = "first-quarter";
  } else if (fraction < 0.47) {
    label = "Waxing gibbous";
    emojiHint = "waxing-gibbous";
  } else if (fraction < 0.53) {
    label = "Full moon";
    emojiHint = "full";
  } else if (fraction < 0.72) {
    label = "Waning gibbous";
    emojiHint = "waning-gibbous";
  } else if (fraction < 0.78) {
    label = "Last quarter";
    emojiHint = "last-quarter";
  } else {
    label = "Waning crescent";
    emojiHint = "waning-crescent";
  }

  return {
    label,
    emojiHint,
    illumination,
    illuminationPercent: Math.round(illumination * 100),
    fraction,
  };
}

export function getMoonMessage(moon, isDay) {
  if (isDay) {
    return `Tonight’s sky: ${moon.label} (${moon.illuminationPercent}% lit).`;
  }

  if (moon.label === "Full moon") {
    return "A full moon brightens the night — clear skies will feel luminous.";
  }
  if (moon.label === "New moon") {
    return "A new moon night — darker skies favor stargazing if clouds stay away.";
  }
  if (moon.illuminationPercent >= 70) {
    return `${moon.label} overhead — expect a softly lit evening outdoors.`;
  }
  return `${moon.label} tonight — a calm, quieter night sky.`;
}

export function getMoonTimes({ sunrise, sunset }) {
  if (!sunrise || !sunset) {
    return { moonrise: null, moonset: null };
  }

  const sunriseDate = new Date(sunrise);
  const sunsetDate = new Date(sunset);
  if (Number.isNaN(sunriseDate.getTime()) || Number.isNaN(sunsetDate.getTime())) {
    return { moonrise: null, moonset: null };
  }

  const moonrise = new Date(sunsetDate.getTime() + 45 * 60 * 1000).toISOString();
  const moonset = new Date(sunriseDate.getTime() + 11 * 60 * 60 * 1000).toISOString();
  return { moonrise, moonset };
}

export function getNextMajorMoonDates(date = new Date()) {
  const current = getMoonPhase(date);
  const synodicDays = 29.53058867;
  const fullTarget = 0.5;
  const newTarget = 0;

  const toForwardDays = (target) => {
    const currentFraction = current.fraction;
    let diff = target - currentFraction;
    if (diff <= 0) diff += 1;
    return diff * synodicDays;
  };

  const nextFull = new Date(date.getTime() + toForwardDays(fullTarget) * 86400000);
  const nextNew = new Date(date.getTime() + toForwardDays(newTarget) * 86400000);

  return {
    nextFullMoon: nextFull.toISOString(),
    nextNewMoon: nextNew.toISOString(),
  };
}
