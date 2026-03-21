interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

const colorClasses = {
  primary: 'bg-[var(--color-primary)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  error: 'bg-[var(--color-error)]',
};

const sizeClasses = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
};

export function ProgressBar({ value, max = 100, size = 'md', showLabel = false, color = 'primary' }: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-[var(--color-bg-subtle)] rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-semibold text-[var(--color-text-secondary)] w-10 text-right">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}

interface MatchScoreRingProps {
  score: number;
  size?: number;
}

export function MatchScoreRing({ score, size = 160 }: MatchScoreRingProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-primary)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-error)';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="12"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-[var(--color-text)]">{score}</span>
        <span className="text-xs text-[var(--color-text-tertiary)] font-medium">匹配度</span>
      </div>
    </div>
  );
}

interface Step {
  id: number;
  label: string;
  status?: 'pending' | 'active' | 'completed';
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep?: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => {
        const status = currentStep !== undefined
          ? idx < currentStep ? 'completed' : idx === currentStep ? 'active' : 'pending'
          : step.status || 'pending';

        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`
                flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold
                transition-all duration-200
                ${status === 'completed' ? 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border border-[var(--color-success)]/20' : ''}
                ${status === 'active' ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)] border border-[var(--color-primary)] font-bold' : ''}
                ${status === 'pending' ? 'bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)] border border-[var(--color-border)]' : ''}
              `}
            >
              <span
                className={`
                  inline-flex items-center justify-center w-5 h-5 rounded-full text-xs
                  ${status === 'completed' ? 'bg-[var(--color-success)] text-white' : ''}
                  ${status === 'active' ? 'bg-[var(--color-primary)] text-white' : ''}
                  ${status === 'pending' ? 'bg-[var(--color-border)] text-[var(--color-text-tertiary)]' : ''}
                `}
              >
                {status === 'completed' ? '✓' : idx + 1}
              </span>
              {step.label}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-6 h-px ${idx < (currentStep ?? -1) ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
