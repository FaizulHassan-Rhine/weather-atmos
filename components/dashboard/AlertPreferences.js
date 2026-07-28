"use client";

import { Bell, BellRing } from "lucide-react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useI18n } from "@/hooks/useI18n";

export default function AlertPreferences() {
  const { t } = useI18n();
  const [prefs, setPrefs] = useLocalStorage("atmos-alert-prefs", {
    enabled: false,
    rainSoon: true,
    poorAir: true,
    earthquakes: true,
    severeWeather: true,
  });

  const canUseNotifications =
    typeof window !== "undefined" && "Notification" in window;
  const permission =
    typeof Notification !== "undefined" ? Notification.permission : "unsupported";

  async function toggleEnabled(nextEnabled) {
    if (nextEnabled && canUseNotifications && permission === "default") {
      try {
        const result = await Notification.requestPermission();
        if (result !== "granted") {
          setPrefs((prev) => ({ ...prev, enabled: false }));
          return;
        }
      } catch {
        setPrefs((prev) => ({ ...prev, enabled: false }));
        return;
      }
    }

    setPrefs((prev) => ({ ...prev, enabled: nextEnabled }));
  }

  function toggleKey(key) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="mt-4 rounded-2xl border border-sky/25 bg-bg/60 p-4 dark:border-white/8 dark:bg-dark-bg/45">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text dark:text-text-dark">
            {t("Alert notifications")}
          </p>
          <p className="text-xs text-muted-soft">
            {t("Enable browser alerts for selected events")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleEnabled(!prefs.enabled)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            prefs.enabled
              ? "border-primary/40 bg-primary text-white"
              : "border-sky/40 bg-surface text-text dark:border-white/10 dark:bg-dark-surface dark:text-text-dark"
          }`}
        >
          {prefs.enabled ? <BellRing size={14} aria-hidden /> : <Bell size={14} aria-hidden />}
          {prefs.enabled ? t("Enabled") : t("Disabled")}
        </button>
      </div>

      {canUseNotifications && permission === "denied" ? (
        <p className="mb-2 text-xs text-accent">
          {t("Browser notifications are blocked. Enable them in browser settings.")}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[
          ["severeWeather", "Severe weather alerts"],
          ["rainSoon", "Rain expected soon"],
          ["poorAir", "Poor air quality"],
          ["earthquakes", "Nearby earthquake alerts"],
        ].map(([key, label]) => (
          <label
            key={key}
            className="inline-flex items-center gap-2 rounded-lg border border-sky/20 bg-surface/80 px-2.5 py-2 text-xs text-text dark:border-white/8 dark:bg-dark-surface/70 dark:text-text-dark"
          >
            <input
              type="checkbox"
              checked={Boolean(prefs[key])}
              disabled={!prefs.enabled}
              onChange={() => toggleKey(key)}
              className="h-3.5 w-3.5 rounded border-sky/50 text-primary focus:ring-primary"
            />
            {t(label)}
          </label>
        ))}
      </div>
    </div>
  );
}
