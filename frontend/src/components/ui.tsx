import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  CreditCard,
  FileSearch,
  Home,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow ? (
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-600 sm:text-xs">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[2.75rem]">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{description}</p> : null}
    </div>
  );
}

export function HomeSection({
  children,
  className = '',
  ...props
}: ComponentPropsWithoutRef<'section'>) {
  return (
    <section className={`px-6 py-18 sm:px-8 sm:py-24 lg:px-10 lg:py-28 ${className}`} {...props}>
      {children}
    </section>
  );
}

export function DashboardCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`dashboard-panel glass-card rounded-[26px] ${className}`}>{children}</div>;
}

export function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <DashboardCard className="p-5 sm:p-6">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">{value}</div>
      {hint ? <div className="mt-3 text-sm text-slate-500">{hint}</div> : null}
    </DashboardCard>
  );
}

const navItems = [
  { label: '控制台', href: '/dashboard', icon: Home },
  { label: '匹配分析', href: '/analysis/new', icon: FileSearch },
  { label: '投递管理', href: '/applications', icon: BriefcaseBusiness },
  { label: '面试准备', href: '/applications', icon: BrainCircuit },
  { label: '设置', href: '/dashboard', icon: Settings },
  { label: '账单', href: '/billing', icon: CreditCard },
];

export function DashboardLayout({
  title,
  subtitle,
  action,
  activePath,
  children,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
  activePath: string;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-shell min-h-screen text-slate-100">
      <div className="mx-auto max-w-[1520px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid gap-4 lg:grid-cols-[272px_minmax(0,1fr)] xl:gap-6">
          <aside className="dashboard-panel glass-card rounded-[28px] p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-lg font-bold text-white pill-glow">
                G
              </div>
              <div>
                <div className="text-lg font-semibold text-white">GapPilot</div>
                <div className="text-xs text-slate-400">AI 职业管家</div>
              </div>
            </div>

            <div className="dashboard-soft mt-8 rounded-[22px] p-4">
              <div className="text-sm font-semibold text-white">Alex Rivera</div>
              <div className="mt-1 text-xs text-indigo-200">专业版方案</div>
            </div>

            <nav className="mt-8 space-y-2 text-sm">
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = activePath === href;
                return (
                  <Link
                    key={href + label}
                    to={href}
                    className={`flex items-center justify-between rounded-[20px] px-4 py-3 transition ${
                      active ? 'bg-indigo-500 text-white shadow-[0_20px_40px_rgba(79,70,229,0.24)]' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                    {active ? <Sparkles className="h-4 w-4" /> : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 rounded-[24px] bg-gradient-to-br from-indigo-500/28 to-cyan-500/18 p-5">
              <div className="text-sm font-semibold text-white">GapPilot AI</div>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                根据你最近的高匹配职位，建议优先补齐 React / Design Tokens / 系统设计表达，再推进面试准备。
              </p>
              <Link
                to="/analysis/new"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950"
              >
                生成策略 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>

          <main className="space-y-4 xl:space-y-6">
            <DashboardCard className="p-5 sm:p-6 lg:p-7">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm text-slate-400">欢迎回来, Alex.</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[2.6rem]">{title}</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{subtitle}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row xl:min-w-[420px] xl:justify-end">
                  <label className="dashboard-soft flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm text-slate-300">
                    <Search className="h-4 w-4 text-slate-500" />
                    <input
                      className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      placeholder="搜索申请、技能、报告或账单..."
                    />
                  </label>
                  {action}
                </div>
              </div>
            </DashboardCard>

            {children}
          </main>
        </div>

        <footer className="mt-6 px-2 pb-3 text-center text-sm text-slate-500">
          GapPilot AI © 2024 GapPilot AI. 精准智能助力职业发展。隐私政策 · 服务条款 · 邮件订阅 · 联系我们
        </footer>
      </div>
    </div>
  );
}
