
import { Button } from './Button';

interface EmptyStateProps {
  icon: string;          // material-symbols-outlined icon name
  title: string;
  description?: string;
  action?: {
    label: string;
    icon?: string;
    onClick: () => void;
  };
  /** For grid layouts — controls the column span */
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`rounded-xl p-10 flex flex-col items-center justify-center text-center ${className}`}
      style={{
        background: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
      }}
    >
      {/* Icon */}
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

      {/* Title */}
      <h4
        className="text-base font-bold mb-1.5"
        style={{ color: 'var(--color-on-surface)' }}
      >
        {title}
      </h4>

      {/* Description */}
      {description && (
        <p
          className="text-sm mb-6 max-w-xs"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <Button
          variant="primary"
          size="md"
          icon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
