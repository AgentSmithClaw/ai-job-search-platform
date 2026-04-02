interface MatchScoreCardProps {
  score: number;
  trend?: number;
  description?: string;
}

export function MatchScoreCard({ score, trend = 0, description }: MatchScoreCardProps) {
  return (
    <div
      className="rounded-xl p-8 flex flex-col justify-between relative overflow-hidden"
      style={{ background: 'var(--color-surface-container)' }}
    >
      {/* Decorative circle top-right */}
      <div
        className="absolute rounded-full"
        style={{
          top: 0,
          right: 0,
          width: 128,
          height: 128,
          background: 'color-mix(in srgb, var(--color-primary) 5%, transparent)',
          marginRight: -64,
          marginTop: -64,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>
          Average Match Score
        </p>
        <div className="flex items-baseline gap-2 mt-4">
          <h3 className="text-7xl font-black tracking-tighter" style={{ color: 'var(--color-primary)' }}>
            {score}<span className="text-3xl">%</span>
          </h3>
          {trend !== 0 && (
            <span
              className="text-sm font-bold flex items-center gap-1 rounded px-2 py-0.5"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}
            >
              <span className="material-symbols-outlined text-xs">trending_up</span>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      </div>

      {description && (
        <p
          className="text-sm mt-8 max-w-[240px]"
          style={{ color: 'var(--color-on-surface-variant)', position: 'relative', zIndex: 1 }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
