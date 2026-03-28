import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

interface TopbarProps {
  onOpenSidebar?: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <header
      className="sticky top-0 z-30 flex items-center h-16 px-4 md:px-6 gap-3 md:gap-4"
      style={{
        background: 'var(--color-topbar)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
      }}
    >
      <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl" onClick={onOpenSidebar}>
        <span className="material-symbols-outlined">menu</span>
      </button>

      <div className="flex-1 min-w-0 md:max-w-md">
        <div className="relative flex items-center h-10 rounded-xl px-4 gap-3" style={{ background: 'var(--color-surface-container-low)' }}>
          <span className="material-symbols-outlined text-xl flex-shrink-0" style={{ color: 'var(--color-on-surface-variant)' }}>
            search
          </span>
          <input
            placeholder="搜索报告、岗位或技能"
            className="flex-1 min-w-0 bg-transparent text-sm border-none outline-none"
            style={{ color: 'var(--color-on-surface)' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <button
          className="relative w-10 h-10 hidden sm:flex items-center justify-center rounded-xl transition-colors hover:bg-[var(--color-surface-container-low)]"
          style={{ color: 'var(--color-on-surface-variant)' }}
          aria-label="通知"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: 'var(--color-error)' }} />
        </button>

        <button
          className="w-10 h-10 hidden sm:flex items-center justify-center rounded-xl transition-colors hover:bg-[var(--color-surface-container-low)]"
          style={{ color: 'var(--color-on-surface-variant)' }}
          onClick={() => navigate('/settings')}
          aria-label="设置"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>

        <div className="hidden lg:flex items-center gap-2 rounded-xl px-3 h-10" style={{ background: 'var(--color-surface-container-low)' }}>
          <span className="material-symbols-outlined text-base" style={{ color: 'var(--color-primary)' }}>bolt</span>
          <div className="leading-none">
            <p className="text-[10px] uppercase font-semibold tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
              点数
            </p>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {user?.credits ?? 0}
            </p>
          </div>
        </div>

        <button
          className="hidden md:flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-all hover:opacity-85"
          style={{ background: 'var(--gradient-hero)', color: 'var(--color-on-primary)' }}
          onClick={() => navigate('/analyze')}
        >
          <span className="material-symbols-outlined text-base">add</span>
          新建分析
        </button>

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer"
          style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-on-primary-fixed-variant)' }}
          onClick={() => navigate('/settings')}
          aria-label="用户菜单"
        >
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
