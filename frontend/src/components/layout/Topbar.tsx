import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

export function Topbar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <header
      className="sticky top-0 z-30 flex items-center h-16 px-6 gap-4"
      style={{
        background: 'rgba(252,248,255,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-outline-variant)',
      }}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div
          className="relative flex items-center h-10 rounded-xl px-4 gap-3"
          style={{ background: 'var(--color-surface-container-low)' }}
        >
          <span
            className="material-symbols-outlined text-xl flex-shrink-0"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            search
          </span>
          <input
            placeholder="Search analyses, roles, skills..."
            className="flex-1 bg-transparent text-sm border-none outline-none"
            style={{ color: 'var(--color-on-surface)' }}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <button
          className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-colors hover:bg-[var(--color-surface-container-low)]"
          style={{ color: 'var(--color-on-surface-variant)' }}
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: 'var(--color-error)' }}
          />
        </button>

        {/* Settings */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors hover:bg-[var(--color-surface-container-low)]"
          style={{ color: 'var(--color-on-surface-variant)' }}
          onClick={() => navigate('/settings')}
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>

        {/* Divider */}
        <div
          className="w-px h-7 mx-2"
          style={{ background: 'var(--color-outline-variant)' }}
        />

        {/* New Analysis — primary CTA */}
        <button
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-all hover:opacity-85"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
          }}
          onClick={() => navigate('/analyze')}
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Analysis
        </button>

        {/* User avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ml-2 cursor-pointer"
          style={{
            background: 'var(--color-primary-fixed)',
            color: 'var(--color-on-primary-fixed-variant)',
          }}
          onClick={() => navigate('/settings')}
          aria-label="User menu"
        >
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
