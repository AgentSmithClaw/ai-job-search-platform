export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-shimmer rounded-[var(--radius-md)] ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)]/50 rounded-[var(--radius-lg)] p-5 space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
}
