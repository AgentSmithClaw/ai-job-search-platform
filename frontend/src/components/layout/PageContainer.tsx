import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface PageContainerProps {
  children: ReactNode;
  showSidebar?: boolean;
  showTopbar?: boolean;
  sidebar?: ReactNode;
}

export function PageContainer({
  children,
  showSidebar = true,
  showTopbar = true,
  sidebar,
}: PageContainerProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      {showSidebar && (sidebar || <Sidebar />)}
      {showTopbar && <Topbar />}
      <main className="pt-16 min-h-screen">
        <div className="px-8 py-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-[var(--color-text)] tracking-tight leading-tight">{title}</h1>
        {description && (
          <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
