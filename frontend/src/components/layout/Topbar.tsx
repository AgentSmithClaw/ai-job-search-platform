import { Moon, Sun, Bell, LogOut } from 'lucide-react';
import { useAuthStore, useThemeStore } from '../../store';

export function Topbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/auth';
  };

  return (
    <header className="fixed top-0 left-56 right-0 h-12 bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-5 z-30">
      <div className="flex items-center gap-2">
        {/* Breadcrumb / page title area — left empty, page header in content */}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)] transition-colors"
          title={theme === 'light' ? '深色模式' : '浅色模式'}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        <button
          className="p-2 rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)] transition-colors relative"
          title="通知"
        >
          <Bell size={14} />
        </button>

        {user && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[var(--color-border)]">
            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)] hidden sm:inline">{user.name}</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="p-2 rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-error-subtle)] hover:text-[var(--color-error)] transition-colors"
          title="退出登录"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
