"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Atmos-styled custom dropdown.
 * @param {{
 *   value: string|number|null,
 *   onChange: (value: any) => void,
 *   options: Array<{ value: any, label: string }>,
 *   ariaLabel?: string,
 *   className?: string,
 *   disabled?: boolean,
 *   fullWidth?: boolean,
 * }} props
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  ariaLabel = "Select option",
  className = "",
  disabled = false,
  fullWidth = true,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const listboxId = useId();

  const selectedIndex = options.findIndex(
    (item) => String(item.value) === String(value)
  );
  const selected =
    selectedIndex >= 0 ? options[selectedIndex] : options[0] || null;

  useEffect(() => {
    if (!open) return undefined;

    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) return;
    const option = listRef.current.querySelector(
      `[data-index="${activeIndex}"]`
    );
    option?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function selectValue(nextValue) {
    onChange(nextValue);
    setOpen(false);
  }

  function handleTriggerKeyDown(event) {
    if (disabled) return;
    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
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
        prev < options.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? options.length - 1 : prev - 1
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
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (activeIndex >= 0 && options[activeIndex]) {
        selectValue(options[activeIndex].value);
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? "w-full" : "inline-block"} ${className}`}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className={`inline-flex h-10 items-center justify-between gap-2 rounded-xl border border-sky/40 bg-surface px-3 text-sm font-medium text-text transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-dark-surface dark:text-text-dark ${
          fullWidth ? "w-full" : ""
        }`}
      >
        <span className="truncate">{selected?.label ?? "—"}</span>
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
            aria-label={ariaLabel}
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-sky/30 bg-surface py-1.5 shadow-[var(--shadow-soft)] outline-none dark:border-white/10 dark:bg-dark-surface"
          >
            {options.map((item, index) => {
              const isSelected =
                String(item.value) === String(selected?.value);
              const isActive = index === activeIndex;

              return (
                <li key={`${String(item.value)}-${index}`} role="presentation">
                  <button
                    type="button"
                    role="option"
                    data-index={index}
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectValue(item.value)}
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
                        className={
                          isActive
                            ? "text-white"
                            : "text-primary dark:text-sky"
                        }
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
