"use client";

import { AlertCircle, MapPinOff, RefreshCw, SearchX } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const VARIANTS = {
  weather: {
    Icon: AlertCircle,
    title: "Unable to load weather",
    description: "Something went wrong while fetching the forecast.",
  },
  search: {
    Icon: SearchX,
    title: "City not found",
    description: "Try a different spelling or nearby city name.",
  },
  geolocation: {
    Icon: MapPinOff,
    title: "Location unavailable",
    description: "We couldn’t access your current location.",
  },
  maps: {
    Icon: AlertCircle,
    title: "Map unavailable",
    description: "Google Maps could not be loaded for this location.",
  },
  mapsKey: {
    Icon: AlertCircle,
    title: "Maps API key missing",
    description:
      "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file to enable the map.",
  },
  empty: {
    Icon: SearchX,
    title: "No weather yet",
    description: "Search for a city to see the forecast.",
  },
};

export default function ErrorState({
  variant = "weather",
  title,
  description,
  onRetry,
  retryLabel = "Try again",
  className = "",
}) {
  const { t } = useI18n();
  const preset = VARIANTS[variant] ?? VARIANTS.weather;
  const Icon = preset.Icon;

  return (
    <div
      role="alert"
      className={`card-surface flex flex-col items-start gap-4 p-6 sm:p-8 ${className}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/25 text-accent dark:bg-accent/15">
        <Icon size={22} strokeWidth={1.75} aria-hidden />
      </span>
      <div>
        <h3 className="text-lg font-semibold text-text dark:text-text-dark">
          {t(title || preset.title)}
        </h3>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-soft">
          {t(description || preset.description)}
        </p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 focus-visible:outline-primary"
        >
          <RefreshCw size={16} aria-hidden />
          {t(retryLabel)}
        </button>
      ) : null}
    </div>
  );
}
