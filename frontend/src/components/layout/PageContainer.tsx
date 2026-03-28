import type { ReactNode } from 'react';
import { AppShell } from './AppShell';

interface PageContainerProps {
  children: ReactNode;
  showSidebar?: boolean;
  showTopbar?: boolean;
  className?: string;
}

export function PageContainer({ children, showSidebar = true, showTopbar = true, className = '' }: PageContainerProps) {
  return (
    <AppShell showSidebar={showSidebar} showTopbar={showTopbar} mainClassName={className}>
      {children}
    </AppShell>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  titleSize?: string;
}

export function PageHeader({ title, description, action, titleSize = 'text-2xl' }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4 md:gap-6">
      <div className="flex-1 min-w-0">
        <p className="editorial-kicker mb-2">GapPilot 工作区</p>
        <h1 className={`font-bold tracking-tight text-[var(--color-on-surface)] ${titleSize}`}>
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)] max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0 w-full md:w-auto">{action}</div>}
    </div>
  );
}
