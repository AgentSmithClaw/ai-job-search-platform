import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-base)' }}>
      {showSidebar && (
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`flex flex-col ${mainClassName}`}
        style={{
          minHeight: '100vh',
          marginLeft: showSidebar ? SIDEBAR_WIDTH : 0,
        }}
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
        @media (max-width: 1023px) {
          main {
            margin-left: 0 !important;
          }
          div[style*="margin-left: ${SIDEBAR_WIDTH}px"] {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
