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
      className="rounded-xl p-6 flex flex-col min-h-[160px]"
      style={{ background: 'var(--color-surface-container-low)' }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
        style={{ background: iconBgColor }}
      >
        <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: 20 }}>{iconName}</span>
      </div>
      <p
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold mt-1"
        style={{ color: 'var(--color-on-surface)' }}
      >
        {value}
      </p>

      {progressValue !== undefined && progressMax !== undefined && (
        <div className="mt-4">
          <ProgressBar value={progressValue} max={progressMax} size="sm" color="primary" />
        </div>
      )}

      {description && (
        <p className="text-[10px] mt-2 font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
          {description}
        </p>
      )}

      {children && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
