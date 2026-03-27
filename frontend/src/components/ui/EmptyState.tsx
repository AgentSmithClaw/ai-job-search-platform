import { Button } from './Button';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    icon?: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] p-10 flex flex-col items-center justify-center text-center ${className}`}
      style={{
        background: 'color-mix(in srgb, var(--color-surface-container-lowest) 90%, transparent)',
        border: '1px solid color-mix(in srgb, var(--color-outline-variant) 35%, transparent)',
      }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--color-surface-container-low)' }}
      >
        <span
          className="material-symbols-outlined text-3xl"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          {icon}
        </span>
      </div>

      <h4 className="text-base font-bold mb-1.5" style={{ color: 'var(--color-on-surface)' }}>
        {title}
      </h4>

      {description && (
        <p className="text-sm mb-6 max-w-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          {description}
        </p>
      )}

      {action && (
        <Button variant="primary" size="md" icon={action.icon} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
