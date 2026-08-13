"use client";

import { Activity, CloudLightning, Droplets, Flame, Siren } from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import { useI18n } from "@/hooks/useI18n";
import { DISASTER_TYPES, countByType, isAllDisasterTypes } from "@/lib/disasters";

const ICONS = {
  earthquake: Activity,
  storm: CloudLightning,
  wildfire: Flame,
  flood: Droplets,
  emergency: Siren,
};

export default function DisasterStats({ events, activeTypes, onToggleType }) {
  const { t } = useI18n();
  const counts = countByType(events);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {DISASTER_TYPES.map((item) => {
        const active =
          isAllDisasterTypes(activeTypes) || activeTypes.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => onToggleType?.(item.id)}
            className={`text-left transition ${
              active ? "opacity-100" : "opacity-50"
            }`}
          >
            <MetricCard
              icon={ICONS[item.id]}
              label={t(item.label)}
              value={counts[item.id] ?? 0}
              detail={t(item.source)}
            />
          </button>
        );
      })}
    </div>
  );
}
