"use client";

import { CloudSun, LocateFixed, LoaderCircle } from "lucide-react";
import CitySearch from "@/components/search/CitySearch";
import ThemeToggle from "@/components/ui/ThemeToggle";
import UnitToggle from "@/components/ui/UnitToggle";
import FavoriteCities from "@/components/ui/FavoriteCities";
import LanguageToggle from "@/components/ui/LanguageToggle";
import ShareCityButton from "@/components/ui/ShareCityButton";
import TabNav from "@/components/ui/TabNav";
import { useI18n } from "@/hooks/useI18n";

export default function Header({
  theme,
  onToggleTheme,
  unit,
  onUnitChange,
  onSelectCity,
  onSelectCityFromSearch,
  onUseLocation,
  locating,
  favorites,
  currentCity,
  isFavorite,
  onToggleFavorite,
  onRemoveFavorite,
  language,
  onLanguageChange,
  view,
  onViewChange,
  showSearch = true,
  recentSearches = [],
  onSelectRecent,
  onRemoveRecent,
  onClearRecent,
}) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-sky/25 bg-bg/85 backdrop-blur-md dark:border-white/8 dark:bg-dark-bg/85">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
              <CloudSun size={22} strokeWidth={1.7} aria-hidden />
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight text-text dark:text-text-dark">
                Atmos
              </p>
              <p className="text-xs text-muted-soft">
                {t("Calm environmental insights")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <LanguageToggle language={language} onChange={onLanguageChange} />
            {view !== "earthquakes" ? (
              <UnitToggle unit={unit} onChange={onUnitChange} />
            ) : null}
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <ShareCityButton city={currentCity} />
            <FavoriteCities
              favorites={favorites}
              currentCity={currentCity}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectCity}
              onRemove={onRemoveFavorite}
            />
          </div>
        </div>

        <TabNav view={view} onChange={onViewChange} />

        {showSearch ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <CitySearch
                onSelect={onSelectCityFromSearch || onSelectCity}
                language={language}
                recentSearches={recentSearches}
                onSelectRecent={onSelectRecent}
                onRemoveRecent={onRemoveRecent}
                onClearRecent={onClearRecent}
              />
            </div>
            <button
              type="button"
              onClick={onUseLocation}
              disabled={locating}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-sky/40 bg-surface px-4 text-sm font-medium text-text transition hover:border-primary/50 hover:text-primary disabled:cursor-wait disabled:opacity-70 dark:border-white/10 dark:bg-dark-surface dark:text-text-dark dark:hover:text-sky"
            >
              {locating ? (
                <LoaderCircle size={16} className="animate-spin" aria-hidden />
              ) : (
                <LocateFixed size={16} aria-hidden />
              )}
              {t("Use my location")}
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
