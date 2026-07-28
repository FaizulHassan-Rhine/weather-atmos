"use client";

import { useI18n } from "@/hooks/useI18n";
import {
  formatDepth,
  formatMagnitude,
  formatQuakeTime,
} from "@/lib/earthquake";
import RiskIndicator from "./RiskIndicator";

export default function EarthquakeList({
  events,
  selectedId,
  onSelect,
  loading,
}) {
  const { t } = useI18n();

  if (loading && !events?.length) {
    return (
      <div className="card-surface space-y-3 p-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-2xl bg-sky/20 dark:bg-white/8"
          />
        ))}
      </div>
    );
  }

  return (
    <section
      className="card-surface overflow-hidden"
      aria-label={t("Recent earthquakes")}
    >
      <div className="border-b border-sky/20 px-5 py-4 dark:border-white/8">
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("Recent earthquakes")}
        </h2>
        <p className="text-sm text-muted-soft">
          {events?.length ?? 0} {t("events")}
        </p>
      </div>

      {!events?.length ? (
        <p className="px-5 py-8 text-sm text-muted-soft">
          {t("No earthquakes match these filters.")}
        </p>
      ) : (
        <ul className="max-h-[28rem] divide-y divide-sky/15 overflow-y-auto dark:divide-white/8">
          {events.map((event) => {
            const active = event.id === selectedId;
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onSelect(event)}
                  className={`flex w-full items-start gap-3 px-5 py-3.5 text-left transition ${
                    active
                      ? "bg-mint/60 dark:bg-primary/20"
                      : "hover:bg-mint/30 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky">
                    <span className="text-sm font-semibold">
                      {formatMagnitude(event.mag)}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-text dark:text-text-dark">
                      {event.place}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-soft">
                      <RiskIndicator magnitude={event.mag} />
                      <span>{formatDepth(event.depth)}</span>
                      <span>{formatQuakeTime(event.time)}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
