"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SEARCH_LANGUAGES } from "@/lib/openMeteo";
import { useI18n } from "@/hooks/useI18n";

export default function LanguageToggle({ language, onChange }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const listboxId = useId();
  const { translating, t } = useI18n();

  const selected =
    SEARCH_LANGUAGES.find((item) => item.code === language) ??
    SEARCH_LANGUAGES[0];

  useEffect(() => {
    if (translating) setOpen(false);
  }, [translating]);

  useEffect(() => {
    if (!open) return undefined;

    const index = SEARCH_LANGUAGES.findIndex((item) => item.code === language);
    setActiveIndex(index >= 0 ? index : 0);

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, language]);

  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) return;
    const option = listRef.current.querySelector(
      `[data-index="${activeIndex}"]`
    );
    option?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function selectLanguage(code) {
    onChange(code);
    setOpen(false);
  }

  function handleTriggerKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function handleListKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev < SEARCH_LANGUAGES.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? SEARCH_LANGUAGES.length - 1 : prev - 1
      );
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(SEARCH_LANGUAGES.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (activeIndex >= 0) {
        selectLanguage(SEARCH_LANGUAGES[activeIndex].code);
      }
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={t("City search language")}
        disabled={translating}
        onClick={() => !translating && setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-sky/40 bg-surface px-3 text-sm font-medium text-text transition hover:border-primary/40 hover:text-primary disabled:cursor-wait disabled:opacity-70 dark:border-white/10 dark:bg-dark-surface dark:text-text-dark dark:hover:text-sky"
      >
        <Languages size={15} className="shrink-0 text-primary dark:text-sky" aria-hidden />
        <span className="max-w-[5.5rem] truncate sm:max-w-[7rem]">
          {selected.label}
        </span>
        <ChevronDown
          size={14}
          aria-hidden
          className={`shrink-0 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={t("City search language")}
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-2 max-h-72 min-w-[11.5rem] overflow-y-auto rounded-2xl border border-sky/30 bg-surface py-1.5 shadow-[var(--shadow-soft)] outline-none dark:border-white/10 dark:bg-dark-surface"
          >
            {SEARCH_LANGUAGES.map((item, index) => {
              const isSelected = item.code === selected.code;
              const isActive = index === activeIndex;

              return (
                <li key={item.code} role="presentation">
                  <button
                    type="button"
                    role="option"
                    data-index={index}
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectLanguage(item.code)}
                    className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition ${
                      isActive
                        ? "bg-primary text-white"
                        : isSelected
                          ? "bg-mint/60 text-text dark:bg-primary/20 dark:text-text-dark"
                          : "text-text hover:bg-mint/40 dark:text-text-dark dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="font-medium">{item.label}</span>
                    {isSelected ? (
                      <Check
                        size={14}
                        aria-hidden
                        className={isActive ? "text-white" : "text-primary dark:text-sky"}
                      />
                    ) : (
                      <span className="w-3.5" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
