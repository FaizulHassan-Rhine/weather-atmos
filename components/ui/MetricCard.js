"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  className = "",
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.2 }}
      className={`card-surface flex flex-col gap-3 p-4 sm:p-5 ${className}`}
    >
      <div className="flex items-center gap-2 text-muted-soft">
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint/70 text-primary dark:bg-primary/20 dark:text-sky">
            <Icon size={18} strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div>
        <p className="text-xl font-semibold tracking-tight text-text dark:text-text-dark sm:text-2xl">
          {value}
        </p>
        {detail ? (
          <p className="mt-1 text-sm text-muted-soft">{detail}</p>
        ) : null}
      </div>
    </motion.div>
  );
}
