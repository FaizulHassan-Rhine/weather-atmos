"use client";

import { getWeatherInfo } from "@/lib/weatherCodes";

export default function WeatherIcon({
  code,
  isDay = true,
  size = 28,
  className = "",
  label,
}) {
  const { Icon, label: conditionLabel } = getWeatherInfo(code, isDay);

  return (
    <Icon
      size={size}
      className={className}
      aria-hidden={label === false}
      aria-label={label === false ? undefined : label || conditionLabel}
      strokeWidth={1.6}
    />
  );
}
