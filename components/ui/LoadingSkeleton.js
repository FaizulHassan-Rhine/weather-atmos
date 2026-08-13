"use client";

function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-sky/25 dark:bg-white/8 ${className}`}
    />
  );
}

export function CurrentWeatherSkeleton() {
  return (
    <div className="card-surface p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-4">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="h-4 w-56" />
          <SkeletonBlock className="h-16 w-36" />
          <SkeletonBlock className="h-4 w-48" />
          <SkeletonBlock className="h-4 w-64" />
        </div>
        <SkeletonBlock className="h-28 w-28 rounded-full" />
      </div>
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="card-surface space-y-4 p-4 sm:p-5">
          <SkeletonBlock className="h-9 w-9 rounded-xl" />
          <SkeletonBlock className="h-6 w-20" />
          <SkeletonBlock className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function HourlySkeleton() {
  return (
    <div className="card-surface p-5 sm:p-6">
      <SkeletonBlock className="mb-5 h-5 w-36" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex min-w-[4.5rem] flex-col items-center gap-3 rounded-2xl border border-sky/20 p-3 dark:border-white/8"
          >
            <SkeletonBlock className="h-3 w-10" />
            <SkeletonBlock className="h-8 w-8 rounded-full" />
            <SkeletonBlock className="h-4 w-8" />
            <SkeletonBlock className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RainOutlookSkeleton() {
  return (
    <div className="card-surface p-5 sm:p-6">
      <SkeletonBlock className="mb-4 h-5 w-36" />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
      <SkeletonBlock className="h-20 w-full rounded-2xl" />
    </div>
  );
}

export function WeeklySkeleton() {
  return (
    <div className="card-surface space-y-3 p-5 sm:p-6">
      <SkeletonBlock className="mb-2 h-5 w-40" />
      {Array.from({ length: 7 }).map((_, index) => (
        <SkeletonBlock key={index} className="h-14 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function UvSkeleton() {
  return (
    <div className="card-surface p-5 sm:p-6">
      <SkeletonBlock className="mb-4 h-5 w-28" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function AstronomySkeleton() {
  return (
    <div className="card-surface p-5 sm:p-6">
      <SkeletonBlock className="mb-4 h-5 w-28" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <SkeletonBlock className="h-52 w-full rounded-2xl" />
        <SkeletonBlock className="h-52 w-full rounded-2xl" />
      </div>
      <SkeletonBlock className="mt-4 h-16 w-full rounded-2xl" />
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="card-surface overflow-hidden">
      <div className="border-b border-sky/20 px-5 py-4 dark:border-white/8">
        <SkeletonBlock className="h-5 w-32" />
      </div>
      <SkeletonBlock className="h-64 w-full rounded-none sm:h-80" />
    </div>
  );
}

export default function LoadingSkeleton({ variant = "current" }) {
  switch (variant) {
    case "metrics":
      return <MetricsSkeleton />;
    case "hourly":
      return <HourlySkeleton />;
    case "rain":
      return <RainOutlookSkeleton />;
    case "weekly":
      return <WeeklySkeleton />;
    case "uv":
      return <UvSkeleton />;
    case "astronomy":
      return <AstronomySkeleton />;
    case "map":
      return <MapSkeleton />;
    default:
      return <CurrentWeatherSkeleton />;
  }
}
