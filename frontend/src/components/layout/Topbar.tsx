import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { getLayoutMeta } from '../../config/layoutMeta';

interface TopbarProps {
  onOpenSidebar?: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { title, searchPlaceholder } = getLayoutMeta(location.pathname);

  return (
    <header
      className="sticky top-0 z-30 flex items-center min-h-16 px-4 md:px-6 gap-3 md:gap-5"
      style={{
        background: 'var(--color-topbar)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <button type="button" className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--color-bg-subtle)]" onClick={onOpenSidebar}>
        <span className="material-symbols-outlined">menu</span>
      </button>

      <div className="hidden md:block min-w-[100px] max-w-[160px]">
        <p className="text-lg font-bold tracking-tight truncate" style={{ color: 'var(--color-text-on-surface)' }}>
          {title}
        </p>
      </div>

      <div className="flex-1 min-w-0 max-w-xl mx-auto">
        <div
          className="relative flex items-center h-10 rounded-xl px-3 gap-2 border"
          style={{ background: '#fff', borderColor: 'var(--color-border)' }}
        >
          <span className="material-symbols-outlined text-[20px] flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
            search
          </span>
          <input
            placeholder={searchPlaceholder}
            className="flex-1 min-w-0 bg-transparent text-sm border-none outline-none"
            style={{ color: 'var(--color-text-on-surface)' }}
            readOnly
            aria-readonly
          />
        </div>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        <button
          type="button"
          className="hidden sm:inline-flex items-center px-2 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
          onClick={() => window.open('https://github.com/AgentSmithClaw/ai-job-search-platform', '_blank', 'noopener,noreferrer')}
        >
          帮助
        </button>
        <button
          type="button"
          className="hidden sm:inline-flex items-center px-2 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
          onClick={() => window.open('https://github.com/AgentSmithClaw/ai-job-search-platform/issues', '_blank', 'noopener,noreferrer')}
        >
          反馈
        </button>

        <button
          type="button"
          className="relative w-10 h-10 flex items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
          aria-label="通知"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
        </button>

        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
          onClick={() => navigate('/settings')}
          aria-label="设置"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>

        <button
          type="button"
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ml-1 border-2 border-white shadow-sm"
          style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
          onClick={() => navigate('/settings')}
          aria-label="账户"
        >
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </button>
      </div>
    </header>
  );
}
