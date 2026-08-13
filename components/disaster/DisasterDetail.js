"use client";

import { ExternalLink } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import {
  DISASTER_COLORS,
  formatEventTime,
  formatSeverity,
  sourceLabel,
  typeLabel,
  SEVERITY_TONE_CLASSES,
} from "@/lib/disasters";
import {
  formatDepth,
  formatMagnitude,
  getDepthCategory,
} from "@/lib/earthquake";
import RiskIndicator from "@/components/earthquake/RiskIndicator";

export default function DisasterDetail({ event }) {
  const { t } = useI18n();

  if (!event) {
    return (
      <section className="card-surface p-5 sm:p-6" aria-label={t("Event details")}>
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("Event details")}
        </h2>
        <p className="mt-2 text-sm text-muted-soft">
          {t("Select an event to view details.")}
        </p>
      </section>
    );
  }

  const tone =
    SEVERITY_TONE_CLASSES[event.severity] || SEVERITY_TONE_CLASSES.muted;
  const sourceHrefLabel =
    event.source === "usgs"
      ? "View on USGS"
      : event.source === "eonet"
        ? "View on NASA EONET"
        : "View on NOAA";

  return (
    <section className="card-surface p-5 sm:p-6" aria-label={t("Event details")}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text dark:text-text-dark">
            {t("Event details")}
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-soft">{event.title}</p>
        </div>
        {event.type === "earthquake" ? (
          <RiskIndicator magnitude={event.mag} />
        ) : (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
            {t(formatSeverity(event.severity))}
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-bg/70 p-3 dark:bg-dark-bg/50">
          <dt className="text-xs text-muted-soft">{t("Type")}</dt>
          <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-text dark:text-text-dark">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor:
                  DISASTER_COLORS[event.type] || DISASTER_COLORS.emergency,
              }}
              aria-hidden
            />
            {t(typeLabel(event.type))}
          </dd>
        </div>
        <div className="rounded-2xl bg-bg/70 p-3 dark:bg-dark-bg/50">
          <dt className="text-xs text-muted-soft">{t("Source")}</dt>
          <dd className="mt-1 text-sm font-semibold text-text dark:text-text-dark">
            {t(sourceLabel(event.source))}
          </dd>
        </div>
        <div className="rounded-2xl bg-bg/70 p-3 dark:bg-dark-bg/50">
          <dt className="text-xs text-muted-soft">{t("Time")}</dt>
          <dd className="mt-1 text-sm font-semibold text-text dark:text-text-dark">
            {formatEventTime(event.time)}
          </dd>
        </div>

        {event.type === "earthquake" ? (
          <>
            <div className="rounded-2xl bg-bg/70 p-3 dark:bg-dark-bg/50">
              <dt className="text-xs text-muted-soft">{t("Magnitude")}</dt>
              <dd className="mt-1 text-xl font-semibold text-text dark:text-text-dark">
                {formatMagnitude(event.mag)}
              </dd>
            </div>
            <div className="rounded-2xl bg-bg/70 p-3 dark:bg-dark-bg/50">
              <dt className="text-xs text-muted-soft">{t("Depth")}</dt>
              <dd className="mt-1 text-xl font-semibold text-text dark:text-text-dark">
                {formatDepth(event.depth)}
              </dd>
              <dd className="text-xs text-muted-soft">
                {t(getDepthCategory(event.depth))}
              </dd>
            </div>
          </>
        ) : null}

        {event.category && event.type !== "earthquake" ? (
          <div className="rounded-2xl bg-bg/70 p-3 dark:bg-dark-bg/50">
            <dt className="text-xs text-muted-soft">{t("Category")}</dt>
            <dd className="mt-1 text-sm font-semibold text-text dark:text-text-dark">
              {event.category}
            </dd>
          </div>
        ) : null}

        {event.magnitudeValue != null ? (
          <div className="rounded-2xl bg-bg/70 p-3 dark:bg-dark-bg/50">
            <dt className="text-xs text-muted-soft">{t("Intensity")}</dt>
            <dd className="mt-1 text-xl font-semibold text-text dark:text-text-dark">
              {event.magnitudeValue}
              {event.magnitudeUnit ? (
                <span className="ml-1 text-sm font-medium text-muted-soft">
                  {event.magnitudeUnit}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}

        {event.pressure ? (
          <div className="rounded-2xl bg-bg/70 p-3 dark:bg-dark-bg/50">
            <dt className="text-xs text-muted-soft">{t("Pressure")}</dt>
            <dd className="mt-1 text-sm font-semibold text-text dark:text-text-dark">
              {event.pressure}
            </dd>
          </div>
        ) : null}
      </dl>

      {event.place && event.place !== event.title ? (
        <p className="mt-4 text-sm text-muted-soft">{event.place}</p>
      ) : null}

      {event.description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-soft">
          {event.description}
        </p>
      ) : null}

      {event.tsunami ? (
        <p className="mt-4 rounded-2xl border border-accent/40 bg-accent/15 px-3 py-2 text-sm text-text dark:text-text-dark">
          {t("Tsunami warning flag reported for this event.")}
        </p>
      ) : null}

      {event.url ? (
        <a
          href={event.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:underline dark:text-sky"
        >
          {t(sourceHrefLabel)}
          <ExternalLink size={14} aria-hidden />
        </a>
      ) : null}
    </section>
  );
}
