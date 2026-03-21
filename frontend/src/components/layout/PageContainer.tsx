import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface PageContainerProps {
  children: ReactNode;
  showSidebar?: boolean;
  showTopbar?: boolean;
  sidebar?: ReactNode;
}

export function PageContainer({ children, showSidebar = true, showTopbar = true, sidebar }: PageContainerProps) {
  return (
    <div style={{ minHeight: '100vh', background: '#f0ecf9' }}>
      {showSidebar && (sidebar || <Sidebar />)}
      {showTopbar && <Topbar />}
      <main style={{ paddingTop: '64px', minHeight: '100vh' }}>
        <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
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
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: '15px', fontWeight: 600, color: '#1b1b24', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{title}</h1>
        {description && <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{description}</p>}
      </div>
      {action && <div style={{ marginLeft: '16px', flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
