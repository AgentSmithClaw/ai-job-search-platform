import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

const MAIN_NAV = [
  { to: '/dashboard', label: '控制台', icon: 'dashboard' },
  { to: '/resume', label: '简历中心', icon: 'description' },
  { to: '/applications', label: '职位追踪', icon: 'work' },
  { to: '/interview', label: '面试准备', icon: 'interpreter_mode' },
  { to: '/billing', label: '账单管理', icon: 'credit_card' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
    onCloseMobile?.();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/25 backdrop-blur-sm transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onCloseMobile}
      />
      <aside
        className={`fixed left-0 top-0 bottom-0 w-[280px] flex flex-col z-50 transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{
          background: '#ffffff',
          borderRight: '1px solid var(--color-border)',
          boxShadow: '4px 0 24px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--gradient-hero)' }}
              >
                <span className="material-symbols-outlined text-xl" style={{ color: '#fff' }}>
                  rocket_launch
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold leading-tight truncate" style={{ color: 'var(--color-text-on-surface)' }}>
                  GapPilot AI
                </p>
                <p className="text-[11px] font-medium mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  职业导航
                </p>
              </div>
            </div>
            <button type="button" className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-bg-subtle)]" onClick={onCloseMobile}>
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 pt-2 pb-4 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
            菜单
          </p>
          <ul className="space-y-0.5">
            {MAIN_NAV.map(({ to, label, icon }) => {
              const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={onCloseMobile}
                    className={[
                      'flex items-center gap-3 h-11 px-3 rounded-xl text-sm font-semibold transition-colors',
                      isActive
                        ? 'text-[var(--color-primary)] bg-[var(--color-primary-subtle)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-on-surface)]',
                    ].join(' ')}
                  >
                    <span
                      className="material-symbols-outlined text-[22px] flex-shrink-0"
                      style={isActive ? { fontVariationSettings: '"FILL" 1' } : undefined}
                    >
                      {icon}
                    </span>
                    {label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 pb-3">
          <div
            className="rounded-2xl p-4 mb-3"
            style={{
              background: 'linear-gradient(145deg, #e8f1ff 0%, #f0f6ff 100%)',
              border: '1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)',
            }}
          >
            <p className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
              专业版
            </p>
            <p className="text-[11px] mt-1 leading-snug" style={{ color: 'var(--color-text-secondary)' }}>
              解锁更多 AI 额度与高级报告导出
            </p>
            <button
              type="button"
              onClick={() => {
                navigate('/billing');
                onCloseMobile?.();
              }}
              className="mt-3 w-full h-9 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--gradient-hero)' }}
            >
              升级至专业版
            </button>
          </div>

          <div className="flex flex-col gap-0.5 border-t border-[var(--color-border)] pt-3">
            <NavLink
              to="/settings"
              onClick={onCloseMobile}
              className="flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              设置
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] w-full text-left"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              退出登录
            </button>
          </div>
        </div>

        <div className="px-4 pb-4 pt-0 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
            >
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-on-surface)' }}>
                {user?.name || '用户'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                积分 {user?.credits ?? 0}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
