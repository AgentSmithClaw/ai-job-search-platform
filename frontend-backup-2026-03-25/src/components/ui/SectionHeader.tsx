import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Title heading level. Default 'text-xl' for section titles. */
  titleSize?: string;
  className?: string;
}

/**
 * Standard section header: title + optional description + optional action.
 * Used inside page sections, not for page-level PageHeader.
 */
export function SectionHeader({
  title,
  description,
  action,
  titleSize = 'text-xl',
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-6 ${className}`}>
      <div className="flex-1 min-w-0">
        <h3
          className={`font-bold tracking-tight text-[var(--color-on-surface)] ${titleSize}`}
        >
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
