"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export default function SearchResults({
  id,
  open,
  results,
  loading,
  error,
  activeIndex,
  onHover,
  onSelect,
}) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-sky/30 bg-surface shadow-[var(--shadow-soft)] dark:border-white/10 dark:bg-dark-surface"
        >
          {loading && results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted-soft" role="status">
              {t("Searching cities…")}
            </p>
          ) : null}

          {!loading && error ? (
            <p className="px-4 py-4 text-sm text-accent" role="alert">
              {t(error)}
            </p>
          ) : null}

          {!loading && !error && results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted-soft" role="status">
              {t("No cities found")}
            </p>
          ) : null}

          {results.length > 0 ? (
            <ul id={id} role="listbox" aria-label="City search results" className="max-h-72 overflow-y-auto py-2">
              {results.map((city, index) => {
                const active = index === activeIndex;
                const subtitle = [city.admin1, city.country].filter(Boolean).join(", ");

                return (
                  <li key={city.id || `${city.latitude}-${city.longitude}-${index}`} role="presentation">
                    <button
                      type="button"
                      id={`${id}-option-${index}`}
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => onHover(index)}
                      onClick={() => onSelect(city)}
                      className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition ${
                        active
                          ? "bg-mint/70 dark:bg-primary/20"
                          : "hover:bg-mint/40 dark:hover:bg-white/5"
                      }`}
                    >
                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-primary dark:text-sky"
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-text dark:text-text-dark">
                          {city.name}
                        </span>
                        {subtitle ? (
                          <span className="block truncate text-xs text-muted-soft">
                            {subtitle}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
