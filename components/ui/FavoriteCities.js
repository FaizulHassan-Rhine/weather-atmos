"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Star, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";

export default function FavoriteCities({
  favorites,
  currentCity,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onRemove,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const favorited = isFavorite(currentCity);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => currentCity && onToggleFavorite(currentCity)}
          disabled={!currentCity}
          aria-label={favorited ? t("Remove current city from favorites") : t("Add current city to favorites")}
          aria-pressed={favorited}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky/40 bg-surface text-text transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-dark-surface dark:text-text-dark dark:hover:text-sky"
        >
          <Heart
            size={18}
            strokeWidth={1.75}
            className={favorited ? "fill-accent text-accent" : ""}
          />
        </button>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={t("Favorite cities")}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-sky/40 bg-surface px-3 text-sm font-medium text-text transition hover:border-primary/40 dark:border-white/10 dark:bg-dark-surface dark:text-text-dark"
        >
          <Star size={16} strokeWidth={1.75} className="text-accent" />
          <span className="hidden sm:inline">{t("Favorites")}</span>
          <span className="rounded-md bg-mint/80 px-1.5 py-0.5 text-xs text-primary dark:bg-primary/20 dark:text-sky">
            {favorites.length}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-40 mt-2 w-72 overflow-hidden rounded-2xl border border-sky/30 bg-surface shadow-[var(--shadow-soft)] dark:border-white/10 dark:bg-dark-surface"
            role="listbox"
            aria-label={t("Favorite cities")}
          >
            {favorites.length === 0 ? (
              <p className="px-4 py-5 text-sm text-muted-soft">
                {t("No favorites yet. Tap the heart to save a city.")}
              </p>
            ) : (
              <ul className="max-h-72 overflow-y-auto py-2">
                {favorites.map((city) => (
                  <li key={city.id || `${city.latitude}-${city.longitude}`} className="flex items-center gap-1 px-2">
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      onClick={() => {
                        onSelect(city);
                        setOpen(false);
                      }}
                      className="flex min-w-0 flex-1 flex-col rounded-xl px-3 py-2.5 text-left transition hover:bg-mint/50 dark:hover:bg-white/5"
                    >
                      <span className="truncate text-sm font-medium text-text dark:text-text-dark">
                        {city.name}
                      </span>
                      <span className="truncate text-xs text-muted-soft">
                        {[city.admin1, city.country].filter(Boolean).join(", ")}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${city.name} from favorites`}
                      onClick={() => onRemove(city)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-sky/20 hover:text-text dark:hover:bg-white/10 dark:hover:text-text-dark"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
