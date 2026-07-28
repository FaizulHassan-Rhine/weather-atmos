"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import useCitySearch from "@/hooks/useCitySearch";
import { useI18n } from "@/hooks/useI18n";
import RecentSearches from "./RecentSearches";
import SearchResults from "./SearchResults";

export default function CitySearch({
  onSelect,
  language = "en",
  recentSearches = [],
  onSelectRecent,
  onRemoveRecent,
  onClearRecent,
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();
  const { results, loading, error } = useCitySearch(query, language);

  const showPanel = open && query.trim().length >= 2;

  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [results]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(city) {
    onSelect(city);
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  }

  function handleKeyDown(event) {
    if (!showPanel) {
      if (event.key === "ArrowDown" && query.trim().length >= 2) {
        setOpen(true);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => {
        if (results.length === 0) return -1;
        return prev < results.length - 1 ? prev + 1 : 0;
      });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => {
        if (results.length === 0) return -1;
        return prev <= 0 ? results.length - 1 : prev - 1;
      });
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor="city-search" className="sr-only">
        {t("Search for a city")}
      </label>
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          ref={inputRef}
          id="city-search"
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          autoComplete="off"
          placeholder={t("Search for a city…")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-11 w-full rounded-xl border border-sky/40 bg-surface pl-10 pr-10 text-sm text-text shadow-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-dark-surface dark:text-text-dark dark:focus:border-primary"
        />
        {loading ? (
          <LoaderCircle
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-primary"
            aria-hidden
          />
        ) : null}
      </div>

      <SearchResults
        id={listboxId}
        open={showPanel}
        results={results}
        loading={loading}
        error={error}
        activeIndex={activeIndex}
        onHover={setActiveIndex}
        onSelect={handleSelect}
      />
      {!query.trim() && !showPanel ? (
        <RecentSearches
          items={recentSearches}
          onSelect={(city) => {
            onSelectRecent?.(city);
            setQuery("");
            setOpen(false);
          }}
          onRemove={onRemoveRecent}
          onClear={onClearRecent}
        />
      ) : null}
    </div>
  );
}
