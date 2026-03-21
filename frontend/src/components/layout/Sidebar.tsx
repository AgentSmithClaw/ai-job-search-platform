import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  GraduationCap,
  Mic,
  Briefcase,
  Settings,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../store';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '工作台' },
  { to: '/history', icon: History, label: '分析记录' },
  { to: '/applications', icon: Briefcase, label: '投递追踪' },
  { to: '/tasks', icon: GraduationCap, label: '学习任务' },
  { to: '/interview', icon: Mic, label: '面试准备' },
];

const bottomNavItems = [
  { to: '/settings', icon: Settings, label: '设置' },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
            <Zap size={13} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-semibold text-[13px] text-[var(--color-text)] tracking-tight">GapPilot</span>
            <p className="text-[11px] text-[var(--color-text-tertiary)] leading-none">求职差距分析</p>
          </div>
        </div>
      </div>

      {/* Credits */}
      {user && (
        <div className="mx-3 mt-3 mb-1 px-3 py-2 bg-[var(--color-bg-subtle)] rounded-[var(--radius-md)] border border-[var(--color-border)] flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">剩余额度</span>
          <span className="text-[13px] font-bold text-[var(--color-primary)]">{user.credits}</span>
        </div>
      )}

      {/* Main Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        <p className="px-2 pt-2 pb-1 text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">导航</p>
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`
                flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-md)] text-[13px] font-medium
                transition-all duration-100 group
                ${isActive
                  ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]'}
              `}
            >
              <Icon
                size={15}
                className={`flex-shrink-0 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="px-2 py-2 border-t border-[var(--color-border)] space-y-0.5">
        {bottomNavItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`
                flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-md)] text-[13px] font-medium
                transition-all duration-100 group
                ${isActive
                  ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]'}
              `}
            >
              <Icon
                size={15}
                className={`flex-shrink-0 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {label}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
