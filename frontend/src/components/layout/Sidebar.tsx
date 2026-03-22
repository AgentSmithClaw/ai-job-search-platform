import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';

const MAIN_NAV = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/history', label: 'Analysis', icon: 'analytics' },
  { to: '/applications', label: 'Applications', icon: 'assignment' },
  { to: '/tasks', label: 'Learning', icon: 'school' },
  { to: '/interview', label: 'Interviews', icon: 'interpreter_mode' },
];

const BOTTOM_NAV = [
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col z-40"
      style={{ background: 'var(--color-surface-container-highest)' }}
    >
      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-primary)' }}
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ color: 'var(--color-on-primary)' }}
            >
              trending_up
            </span>
          </div>
          <div>
            <p
              className="text-base font-bold leading-none"
              style={{ color: 'var(--color-on-surface)' }}
            >
              GapPilot
            </p>
            <p
              className="text-[10px] font-medium mt-0.5"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              Career Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div className="mx-6" style={{ height: 1, background: 'var(--color-outline-variant)' }} />

      {/* ── Main Nav ─────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 pt-4 pb-2 overflow-y-auto">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-3"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          Main
        </p>
        <ul className="space-y-1">
          {MAIN_NAV.map(({ to, label, icon }) => {
            const isActive =
              to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  className={[
                    'flex items-center gap-3 h-11 px-3 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'text-[var(--color-primary)] bg-[var(--color-surface-container-low)] relative'
                      : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]',
                  ].join(' ')}
                  style={isActive ? { borderLeft: '3px solid var(--color-primary)' } : {}}
                >
                  <span
                    className="material-symbols-outlined text-xl flex-shrink-0"
                    style={isActive ? { color: 'var(--color-primary)' } : {}}
                  >
                    {icon}
                  </span>
                  {label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Bottom nav — separated */}
        <div className="mt-6">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-3"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            System
          </p>
          <ul className="space-y-1">
            {BOTTOM_NAV.map(({ to, label, icon }) => {
              const isActive = location.pathname.startsWith(to);
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={[
                      'flex items-center gap-3 h-11 px-3 rounded-lg text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'text-[var(--color-primary)] bg-[var(--color-surface-container-low)]'
                        : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]',
                    ].join(' ')}
                  >
                    <span className="material-symbols-outlined text-xl flex-shrink-0">{icon}</span>
                    {label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* ── User Profile ─────────────────────────────────────────── */}
      <div
        className="px-3 pb-4 pt-2"
        style={{ borderTop: '1px solid var(--color-outline-variant)' }}
      >
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'var(--color-surface-container-low)' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              background: 'var(--color-primary-fixed)',
              color: 'var(--color-on-primary-fixed-variant)',
            }}
          >
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--color-on-surface)' }}
            >
              {user?.name || 'User'}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              {user?.email || 'Free Plan'}
            </p>
          </div>
          <span
            className="material-symbols-outlined text-base flex-shrink-0"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            chevron_right
          </span>
        </div>
      </div>
    </aside>
  );
}
