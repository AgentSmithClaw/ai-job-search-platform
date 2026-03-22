import { useNavigate } from 'react-router-dom';

export function Topbar() {
  const navigate = useNavigate();

  return (
    <header
      className="fixed top-0 right-0 h-16 flex items-center justify-between px-8 z-30"
      style={{
        left: '256px',
        background: 'rgba(252,248,255,0.8)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--color-outline-variant)',
      }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>search</span>
        <input
          placeholder="Search analyses, roles, or skills..."
          className="w-full rounded-lg py-2 pl-10 pr-4 text-sm border-none"
          style={{ background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)' }}
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-6 ml-auto">
        <button style={{ color: 'var(--color-on-surface-variant)' }} className="relative">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full" style={{ background: 'var(--color-error)', border: '2px solid var(--color-bg-surface)' }} />
        </button>
        <button style={{ color: 'var(--color-on-surface-variant)' }} onClick={() => navigate('/settings')}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>settings</span>
        </button>
        <div className="h-8 w-px" style={{ background: 'var(--color-outline-variant)' }} />
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: 'var(--color-primary-container)', color: 'var(--color-on-primary)' }}
          onClick={() => navigate('/analyze')}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Analysis
        </button>
      </div>
    </header>
  );
}
