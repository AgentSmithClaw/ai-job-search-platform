interface MetricCardProps {
  /** Primary metric value — large display number */
  value: number;
  /** Optional unit suffix, e.g. '%' */
  unit?: string;
  /** Label above the value */
  label: string;
  /** Optional trend indicator, e.g. +12 */
  trend?: number;
  /** Optional description text below */
  description?: string;
  /** For layout — card fills the column */
  className?: string;
}

export function MetricCard({ value, unit = '', label, trend, description, className = '' }: MetricCardProps) {
  return (
    <div
      className={`rounded-xl p-8 flex flex-col justify-between relative overflow-hidden ${className}`}
      style={{ background: 'var(--color-surface-container)' }}
    >
      {/* Decorative circle top-right */}
      <div
        className="absolute rounded-full"
        style={{
          top: 0, right: 0,
          width: 128, height: 128,
          background: 'rgba(53,37,205,0.05)',
          marginRight: -64, marginTop: -64,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          {label}
        </p>
        <div className="flex items-baseline gap-2 mt-3">
          <h3
            className="text-6xl font-black tracking-tighter"
            style={{ color: 'var(--color-primary)' }}
          >
            {value}{unit}
          </h3>
          {trend !== undefined && trend !== 0 && (
            <span
              className="text-xs font-bold flex items-center gap-0.5 rounded px-2 py-0.5"
              style={{ background: 'rgba(53,37,205,0.1)', color: 'var(--color-primary)' }}
            >
              <span className="material-symbols-outlined text-xs">trending_up</span>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      </div>

      {description && (
        <p
          className="text-sm mt-6 max-w-[240px]"
          style={{ color: 'var(--color-on-surface-variant)', position: 'relative', zIndex: 1 }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
