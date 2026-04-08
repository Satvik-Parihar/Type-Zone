/**
 * Loading Skeleton Components
 * Placeholder UI while data is loading
 */

export function SkeletonLoader({ width = 'w-full', height = 'h-4', rounded = 'rounded-md', className = '' }) {
  return (
    <div className={`${width} ${height} ${rounded} bg-[var(--color-card)] animate-pulse ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[var(--color-card)] rounded-xl p-6 animate-pulse border border-[var(--color-border)]/50">
      <SkeletonLoader height="h-6" className="mb-4 w-1/2" />
      <SkeletonLoader height="h-4" className="mb-3 w-full" />
      <SkeletonLoader height="h-4" className="mb-3 w-5/6" />
      <SkeletonLoader height="h-4" className="w-4/6" />
    </div>
  );
}

export function SkeletonGrid({ columns = 3, count = 6 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          {[...Array(columns)].map((_, j) => (
            <SkeletonLoader key={j} width="w-full" height="h-3" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonTypingPanel() {
  return (
    <div className="min-h-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/50 p-6 space-y-3">
      <SkeletonLoader height="h-8" className="w-5/6" />
      <SkeletonLoader height="h-8" className="w-full" />
      <SkeletonLoader height="h-8" className="w-4/5" />
    </div>
  );
}
