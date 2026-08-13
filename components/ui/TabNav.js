"use client";

import { CloudSun, Tornado, Wind } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const TABS = [
  { id: "weather", label: "Weather", Icon: CloudSun },
  { id: "disasters", label: "Disasters", Icon: Tornado },
  { id: "air", label: "Air Quality", Icon: Wind },
];

export default function TabNav({ view, onChange }) {
  const { t } = useI18n();

  return (
    <nav
      aria-label={t("Dashboards")}
      className="inline-flex w-full max-w-full overflow-x-auto rounded-full border border-sky/40 bg-surface p-1 dark:border-white/10 dark:bg-dark-surface sm:w-auto"
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = view === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition ${
              active
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-text dark:hover:text-text-dark"
            }`}
          >
            <Icon size={16} aria-hidden strokeWidth={1.75} />
            <span>{t(label)}</span>
          </button>
        );
      })}
    </nav>
  );
}
