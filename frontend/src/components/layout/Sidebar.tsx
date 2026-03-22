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

function navItemClass(isActive: boolean) {
  const base = 'flex items-center gap-3 h-9 px-3 rounded-lg text-sm font-medium transition-colors';
  if (isActive) {
    return `${base} text-[var(--color-primary)] bg-[var(--color-surface-container-low)]`;
  }
  return `${base} text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]`;
}

export function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40 overflow-y-auto"
      style={{ background: 'var(--color-surface-container-highest)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 mb-1">
        <h1
          className="text-lg font-bold tracking-tight"
          style={{ color: 'var(--color-on-surface)' }}
        >
          GapPilot
        </h1>
        <p
          className="text-[9px] font-medium uppercase tracking-widest mt-0.5"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          Career Intelligence
        </p>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {MAIN_NAV.map(({ to, label, icon }) => {
          const isActive =
            to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} className={navItemClass(isActive)}>
              <span className="material-symbols-outlined text-xl flex-shrink-0">{icon}</span>
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div
        className="px-3 pt-3 pb-2 border-t space-y-0.5"
        style={{ borderColor: 'var(--color-outline-variant)' }}
      >
        {BOTTOM_NAV.map(({ to, label, icon }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} className={navItemClass(isActive)}>
              <span className="material-symbols-outlined text-xl flex-shrink-0">{icon}</span>
              {label}
            </NavLink>
          );
        })}
      </div>

      {/* User Profile */}
      <div
        className="px-4 py-4 border-t"
        style={{ borderColor: 'var(--color-outline-variant)' }}
      >
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'var(--color-surface-container-low)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{
              background: 'var(--color-primary-fixed)',
              color: 'var(--color-on-primary-fixed-variant)',
            }}
          >
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--color-on-surface)' }}
            >
              {user?.name || 'User'}
            </p>
            <p
              className="text-[10px] truncate"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              Premium Plan
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
