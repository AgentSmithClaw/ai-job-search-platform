import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SIDEBAR_WIDTH, TOPBAR_HEIGHT, CONTENT_PX, CONTENT_MAX } from './layoutConstants';

interface AppShellProps {
  children: ReactNode;
  showSidebar?: boolean;
  showTopbar?: boolean;
  /** Extra className for the main content area */
  mainClassName?: string;
}

export function AppShell({
  children,
  showSidebar = true,
  showTopbar = true,
  mainClassName = '',
}: AppShellProps) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-base)' }}>
      {/* Fixed sidebar — always full height, left-aligned */}
      {showSidebar && (
        <Sidebar />
      )}

      {/* Content shell — offset left by sidebar, top by topbar */}
      <div
        className={`flex flex-col ${mainClassName}`}
        style={{
          marginLeft: SIDEBAR_WIDTH,
          minHeight: '100vh',
        }}
      >
        {/* Sticky topbar */}
        {showTopbar && <Topbar />}

        {/* Main scrollable content */}
        <main
          className={`flex-1 ${CONTENT_PX}`}
          style={{
            paddingTop: TOPBAR_HEIGHT,
          }}
        >
          <div className={`${CONTENT_MAX} mx-auto py-8`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
