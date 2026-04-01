import { useState, type CSSProperties, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { FAB } from '../ui/FAB';
import { SIDEBAR_WIDTH, TOPBAR_HEIGHT, CONTENT_MAX } from './layoutConstants';

interface AppShellProps {
  children: ReactNode;
  showSidebar?: boolean;
  showTopbar?: boolean;
  mainClassName?: string;
}

export function AppShell({
  children,
  showSidebar = true,
  showTopbar = true,
  mainClassName = '',
}: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const shellStyle = {
    minHeight: '100vh',
    ['--sidebar-offset' as string]: showSidebar ? SIDEBAR_WIDTH : '0px',
  } as CSSProperties;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-base)' }}>
      {showSidebar && (
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`app-shell-main flex flex-col ${mainClassName}`}
        style={shellStyle}
      >
        {showTopbar && <Topbar onOpenSidebar={() => setMobileSidebarOpen(true)} />}

        <main
          className="flex-1 px-4 md:px-6 xl:px-8"
          style={{ paddingTop: TOPBAR_HEIGHT }}
        >
          <div className={`${CONTENT_MAX} mx-auto py-6 md:py-8`}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        .app-shell-main {
          margin-left: var(--sidebar-offset);
        }
        @media (max-width: 1023px) {
          .app-shell-main {
            margin-left: 0 !important;
          }
        }
      `}</style>

      {showSidebar && showTopbar ? <FAB href="/analyze" icon="add" /> : null}
    </div>
  );
}
