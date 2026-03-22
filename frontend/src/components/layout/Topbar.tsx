import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';


export function Topbar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-8 h-16"
      style={{
        background: 'rgba(252,248,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-outline-variant)',
      }}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            search
          </span>
          <input
            placeholder="Search analyses, roles, or skills..."
            className="w-full rounded-lg py-2 pl-10 pr-4 text-sm border-none focus:ring-2"
            style={{
              background: 'var(--color-surface-container-low)',
              color: 'var(--color-on-surface)',
            }}
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-surface-container-low)]"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: 'var(--color-error)' }}
          />
        </button>

        {/* Settings */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-surface-container-low)]"
          style={{ color: 'var(--color-on-surface-variant)' }}
          onClick={() => navigate('/settings')}
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>

        <div className="w-px h-6" style={{ background: 'var(--color-outline-variant)' }} />

        {/* New Analysis CTA */}
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-primary-container)', color: 'var(--color-on-primary)' }}
          onClick={() => navigate('/analyze')}
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Analysis
        </button>

        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-on-primary-fixed-variant)' }}
        >
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
