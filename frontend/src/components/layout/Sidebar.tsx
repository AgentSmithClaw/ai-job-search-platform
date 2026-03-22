import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/history', label: 'Analysis', icon: 'analytics' },
  { to: '/applications', label: 'Applications', icon: 'assignment' },
  { to: '/tasks', label: 'Learning', icon: 'school' },
  { to: '/interview', label: 'Interviews', icon: 'interpreter_mode' },
];

const bottomNavItems = [
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

function navClass(isActive: boolean) {
  const base = 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all';
  if (isActive) return base + ' text-[var(--color-primary)] bg-[var(--color-surface-container-lowest)] shadow-sm';
  return base + ' text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]';
}

export function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40 overflow-y-auto" style={{ background: 'var(--color-surface-container-highest)' }}>
      {/* Logo */}
      <div className="px-6 py-6 mb-2">
        <h1 className="text-xl font-black tracking-tighter" style={{ color: 'var(--color-on-surface)' }}>Precision Curator</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>Elite Analysis</p>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map(({ to, label, icon }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={navClass(isActive)}
              style={isActive ? { margin: '0 8px' } : {}}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="px-2 py-4 border-t space-y-0.5" style={{ borderColor: 'var(--color-outline-variant)' }}>
        {bottomNavItems.map(({ to, label, icon }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={navClass(isActive)}
              style={isActive ? { margin: '0 8px' } : {}}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
              {label}
            </NavLink>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--color-outline-variant)' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-surface-container-low)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-on-primary-fixed-variant)' }}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate" style={{ color: 'var(--color-on-surface)' }}>{user?.name || 'User'}</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--color-on-surface-variant)' }}>Premium Curator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
