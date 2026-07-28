"use client";

export default function UnitToggle({ unit, onChange }) {
  return (
    <div
      role="group"
      aria-label="Temperature unit"
      className="inline-flex rounded-full border border-sky/40 bg-surface p-1 dark:border-white/10 dark:bg-dark-surface"
    >
      <button
        type="button"
        aria-pressed={unit === "c"}
        onClick={() => onChange("c")}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
          unit === "c"
            ? "bg-primary text-white shadow-sm"
            : "text-muted hover:text-text dark:hover:text-text-dark"
        }`}
      >
        °C
      </button>
      <button
        type="button"
        aria-pressed={unit === "f"}
        onClick={() => onChange("f")}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
          unit === "f"
            ? "bg-primary text-white shadow-sm"
            : "text-muted hover:text-text dark:hover:text-text-dark"
        }`}
      >
        °F
      </button>
    </div>
  );
}
