"use client";

import CustomSelect from "@/components/ui/CustomSelect";
import { useI18n } from "@/hooks/useI18n";

const WINDOWS = [
  { id: "24h", label: "24h" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
];

const MAG_OPTIONS = [1, 2.5, 4, 5, 6];
const DEPTH_OPTIONS = [
  { value: null, label: "Any depth" },
  { value: 70, label: "≤ 70 km" },
  { value: 300, label: "≤ 300 km" },
];
const RADIUS_OPTIONS = [
  { value: null, label: "Worldwide" },
  { value: 500, label: "500 km" },
  { value: 1000, label: "1000 km" },
  { value: 2000, label: "2000 km" },
];

export default function EarthquakeFilters({ filters, onChange, locationName }) {
  const { t } = useI18n();

  function update(patch) {
    onChange({ ...filters, ...patch });
  }

  const magnitudeOptions = MAG_OPTIONS.map((mag) => ({
    value: mag,
    label: `M ${mag}+`,
  }));

  const depthOptions = DEPTH_OPTIONS.map((item) => ({
    value: item.value,
    label: t(item.label),
  }));

  const radiusOptions = RADIUS_OPTIONS.map((item) => ({
    value: item.value,
    label: t(item.label),
  }));

  return (
    <section
      className="card-surface space-y-4 p-5 sm:p-6"
      aria-label={t("Earthquake filters")}
    >
      <div>
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("Earthquake filters")}
        </h2>
        <p className="text-sm text-muted-soft">
          {locationName
            ? `${t("Monitoring near")} ${locationName}`
            : t("Filter recent seismic activity")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="block text-sm">
          <span className="mb-1.5 block font-medium text-muted-soft">
            {t("Time window")}
          </span>
          <div className="inline-flex w-full rounded-full border border-sky/40 bg-bg/70 p-1 dark:border-white/10 dark:bg-dark-bg/60">
            {WINDOWS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filters.window === item.id}
                onClick={() => update({ window: item.id })}
                className={`flex-1 rounded-full px-2 py-1.5 text-xs font-medium transition sm:text-sm ${
                  filters.window === item.id
                    ? "bg-primary text-white"
                    : "text-muted hover:text-text dark:hover:text-text-dark"
                }`}
              >
                {t(item.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="block text-sm">
          <span className="mb-1.5 block font-medium text-muted-soft">
            {t("Min magnitude")}
          </span>
          <CustomSelect
            value={filters.minMagnitude}
            onChange={(value) => update({ minMagnitude: Number(value) })}
            options={magnitudeOptions}
            ariaLabel={t("Min magnitude")}
          />
        </div>

        <div className="block text-sm">
          <span className="mb-1.5 block font-medium text-muted-soft">
            {t("Max depth")}
          </span>
          <CustomSelect
            value={filters.maxDepth}
            onChange={(value) => update({ maxDepth: value })}
            options={depthOptions}
            ariaLabel={t("Max depth")}
          />
        </div>

        <div className="block text-sm">
          <span className="mb-1.5 block font-medium text-muted-soft">
            {t("Region radius")}
          </span>
          <CustomSelect
            value={filters.radiusKm}
            onChange={(value) => update({ radiusKm: value })}
            options={radiusOptions}
            ariaLabel={t("Region radius")}
          />
        </div>
      </div>
    </section>
  );
}
