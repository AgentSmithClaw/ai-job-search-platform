import type { ReactNode } from 'react';
import { ProgressBar } from '../../ui/Progress';

interface StatCardProps {
  iconName: string;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: string | number;
  description?: string;
  progressValue?: number;
  progressMax?: number;
  children?: ReactNode;
}

export function StatCard({
  iconName,
  iconBgColor,
  iconColor,
  label,
  value,
  description,
  progressValue,
  progressMax,
  children,
}: StatCardProps) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col"
      style={{ background: 'var(--color-surface-container-low)', minHeight: 180 }}
    >
      {/* Icon row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: iconBgColor }}
        >
          <span className="material-symbols-outlined text-xl" style={{ color: iconColor }}>
            {iconName}
          </span>
        </div>
      </div>

      {/* Label + value */}
      <p
        className="text-xs font-medium uppercase tracking-wider mb-1"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        {label}
      </p>
      <p
        className="text-4xl font-bold leading-none"
        style={{ color: 'var(--color-on-surface)' }}
      >
        {value}
      </p>

      {/* Progress bar */}
      {progressValue !== undefined && progressMax !== undefined && (
        <div className="mt-auto">
          <ProgressBar
            value={progressValue}
            max={progressMax}
            size="sm"
            color="primary"
            showLabel={false}
          />
          {description && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>
              {description}
            </p>
          )}
        </div>
      )}

      {children && (
        <div className="mt-4 flex flex-wrap gap-1.5">{children}</div>
      )}
    </div>
  );
}
