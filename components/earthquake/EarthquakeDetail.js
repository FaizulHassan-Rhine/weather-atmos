"use client";

import { ExternalLink } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import {
  formatDepth,
  formatMagnitude,
  formatQuakeTime,
  getDepthCategory,
} from "@/lib/earthquake";
import RiskIndicator from "./RiskIndicator";

export default function EarthquakeDetail({ event }) {
  const { t } = useI18n();

  if (!event) {
    return (
      <section className="card-surface p-5 sm:p-6" aria-label={t("Event details")}>
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("Event details")}
        </h2>
        <p className="mt-2 text-sm text-muted-soft">
          {t("Select an earthquake to view details.")}
        </p>
      </section>
    );
  }

  return (
    <section className="card-surface p-5 sm:p-6" aria-label={t("Event details")}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text dark:text-text-dark">
            {t("Event details")}
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-soft">{event.place}</p>
        </div>
        <RiskIndicator magnitude={event.mag} />
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
        <div className="rounded-2xl bg-bg/70 p-3 dark:bg-dark-bg/50">
          <dt className="text-xs text-muted-soft">{t("Time")}</dt>
          <dd className="mt-1 text-sm font-semibold text-text dark:text-text-dark">
            {formatQuakeTime(event.time)}
          </dd>
        </div>
      </dl>

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
          {t("View on USGS")}
          <ExternalLink size={14} aria-hidden />
        </a>
      ) : null}
    </section>
  );
}
