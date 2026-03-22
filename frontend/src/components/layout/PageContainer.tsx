import type { ReactNode } from 'react';
import { AppShell } from './AppShell';

interface PageContainerProps {
  children: ReactNode;
  showSidebar?: boolean;
  showTopbar?: boolean;
  /** Extra className passed to the main content wrapper */
  className?: string;
}

/**
 * Standard page wrapper using AppShell.
 * Provides: fixed sidebar, sticky topbar, centered content column.
 *
 * Usage:
 *   <PageContainer>...</PageContainer>
 */
export function PageContainer({ children, showSidebar = true, showTopbar = true, className = '' }: PageContainerProps) {
  return (
    <AppShell showSidebar={showSidebar} showTopbar={showTopbar} mainClassName={className}>
      {children}
    </AppShell>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** H1 text size. Default 'text-2xl' for inner pages. */
  titleSize?: string;
}

export function PageHeader({ title, description, action, titleSize = 'text-2xl' }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div className="flex-1 min-w-0">
        <h1 className={`font-bold tracking-tight text-[var(--color-on-surface)] ${titleSize}`}>
          {title}
        </h1>
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
