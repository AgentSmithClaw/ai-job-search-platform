import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  CreditCard,
  FilePlus2,
  LoaderCircle,
  Target,
  Upload,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardCard, DashboardLayout, MetricCard } from '../components/ui';
import { apiGet, getAccessToken } from '../lib/api';

type DashboardResponse = {
  user: {
    id: number;
    email: string;
    name: string;
    access_token: string;
    credits: number;
  };
  stats: {
    total_analyses: number;
    analyses_this_week: number;
    total_applications: number;
    application_by_status: Record<string, number>;
    total_tasks: number;
    task_by_status: Record<string, number>;
    total_spent_cny: number;
    average_match_score: number;
  };
};

type SessionsResponse = {
  items: Array<{
    id: number;
    created_at: string;
    target_role: string;
    match_score: number;
    summary: string;
    credits_used: number;
  }>;
  total: number;
  offset: number;
  limit: number;
};

type Application = {
  id: number;
  company_name: string;
  target_role: string;
  status: string;
  created_at: string;
};

const quickActions = [
  { icon: FilePlus2, label: '新建分析', href: '/analysis/new' },
  { icon: Upload, label: '上传简历', href: '/analysis/new' },
  { icon: CreditCard, label: '购买积分', href: '/billing' },
  { icon: CheckCircle2, label: '管理投递', href: '/applications' },
];

const statusLabels: Record<string, string> = {
  interested: '待跟进',
  applied: '已投递',
  interview: '面试中',
  offer: 'Offer',
  rejected: '未通过',
};

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  if (diffHours < 1) return '刚刚';
  if (diffHours < 24) return `${diffHours} 小时前`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} 天前`;
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [sessions, setSessions] = useState<SessionsResponse['items']>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  const accessToken = getAccessToken();

  useEffect(() => {
    async function load() {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const [dashboardData, sessionsData, applicationsData] = await Promise.all([
          apiGet<DashboardResponse>('/api/dashboard', { access_token: accessToken }),
          apiGet<SessionsResponse>('/api/sessions', { access_token: accessToken, limit: 3 }),
          apiGet<Application[]>('/api/applications', { access_token: accessToken }),
        ]);
        setDashboard(dashboardData);
        setSessions(sessionsData.items);
        setApplications(applicationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载 Dashboard 数据失败');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [accessToken]);

  const pipeline = useMemo(() => {
    const statusMap = dashboard?.stats.application_by_status ?? {};
    return [
      ['总计', dashboard?.stats.total_applications ?? 0],
      ['面试中', statusMap.interview ?? 0],
      ['已投递', statusMap.applied ?? 0],
      ['Offer', statusMap.offer ?? 0],
    ];
  }, [dashboard]);

  const statCards = useMemo(() => {
    if (!dashboard) {
      return [
        { label: '总分析数', value: '—', hint: '等待数据' },
        { label: '待办任务', value: '—', hint: '等待数据' },
        { label: '已投递职位', value: '—', hint: '等待数据' },
        { label: '剩余积分', value: '—', hint: '等待数据' },
      ];
    }

    return [
      { label: '总分析数', value: String(dashboard.stats.total_analyses), hint: `本周新增 ${dashboard.stats.analyses_this_week} 次分析` },
      { label: '待办任务', value: String(dashboard.stats.total_tasks), hint: '学习任务与行动项总数' },
      { label: '已投递职位', value: String(dashboard.stats.total_applications), hint: `平均匹配度 ${dashboard.stats.average_match_score}` },
      { label: '剩余积分', value: String(dashboard.user.credits), hint: `累计消费 ¥${dashboard.stats.total_spent_cny}` },
    ];
  }, [dashboard]);

  const topActions = dashboard
    ? [
        `最近 7 天完成 ${dashboard.stats.analyses_this_week} 次分析，可继续追高匹配岗位。`,
        dashboard.stats.total_tasks > 0 ? `当前有 ${dashboard.stats.total_tasks} 个任务待推进。` : '当前暂无学习任务积压。',
        dashboard.user.credits > 0 ? `当前剩余 ${dashboard.user.credits} 积分，可直接继续分析。` : '当前积分不足，需先补充额度。',
      ]
    : [
        '登录后可查看真实分析统计。',
        'Dashboard 将自动接入最近分析与投递数据。',
        '当前页面已切换为真实 API 优先的数据态结构。',
      ];

  return (
    <DashboardLayout
      title="控制台"
      subtitle={
        dashboard
          ? `欢迎回来，${dashboard.user.name}。这里展示你的真实分析、投递和额度数据；当前平均匹配度 ${dashboard.stats.average_match_score}。`
          : '当前 Dashboard 已支持真实 API 数据接入。登录后可查看最近分析、投递概览、任务总数与积分余额。'
      }
      activePath="/dashboard"
      action={
        <Link
          to="/analysis/new"
          className="rounded-[20px] bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.24)]"
        >
          发起新分析
        </Link>
      }
    >
      {!accessToken ? (
        <DashboardCard className="p-5 sm:p-6 lg:p-7">
          <div className="flex items-start gap-3 text-amber-200">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <div className="text-lg font-semibold text-white">尚未检测到 access token</div>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                当前 Dashboard 已接入真实数据接口，但本地未发现 `gappilot_access_token` / `access_token`。登录后即可显示真实统计、最近分析和投递数据。
              </p>
            </div>
          </div>
        </DashboardCard>
      ) : null}

      {error ? (
        <DashboardCard className="p-5 sm:p-6 lg:p-7">
          <div className="flex items-start gap-3 text-rose-200">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <div className="text-lg font-semibold text-white">Dashboard 数据加载失败</div>
              <p className="mt-2 text-sm leading-7 text-slate-300">{error}</p>
            </div>
          </div>
        </DashboardCard>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        {statCards.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] xl:gap-6">
        <DashboardCard className="p-5 sm:p-6 lg:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">最近分析</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">真实会话数据</h2>
            </div>
            {loading ? <LoaderCircle className="h-5 w-5 animate-spin text-indigo-300" /> : <div className="rounded-2xl bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">API 已接通</div>}
          </div>

          <div className="mt-8 space-y-4">
            {sessions.length > 0 ? (
              sessions.map((item) => (
                <div key={item.id} className="dashboard-soft rounded-[22px] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">{item.target_role}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {formatRelativeTime(item.created_at)} • {item.summary}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="rounded-[18px] bg-emerald-500/10 px-4 py-3 text-right">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-300 sm:text-xs">匹配度</div>
                        <div className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-emerald-300">{item.match_score}%</div>
                      </div>
                      <Link to={`/analysis/${item.id}`} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
                        查看详情
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboard-soft rounded-[22px] p-5 text-sm text-slate-300">
                {loading ? '正在加载最近分析…' : '当前还没有可展示的分析记录。'}
              </div>
            )}
          </div>
        </DashboardCard>

        <div className="space-y-4 xl:space-y-6">
          <DashboardCard className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-slate-400">快捷操作</div>
                <div className="mt-1 text-xl font-semibold text-white">立即开始</div>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {quickActions.map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  to={href}
                  className="dashboard-soft flex items-center justify-between rounded-[20px] px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-indigo-300" /> {label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </Link>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">投递流程</div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">管理</div>
              </div>
              <BriefcaseBusiness className="h-5 w-5 text-indigo-300" />
            </div>
            <div className="mt-6 space-y-3">
              {pipeline.map(([label, value]) => (
                <div key={label} className="dashboard-soft flex items-center justify-between rounded-[20px] px-4 py-3">
                  <span className="text-sm text-slate-300">{label}</span>
                  <span className="text-lg font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {applications.slice(0, 3).map((item) => (
                <div key={item.id} className="text-sm text-slate-400">
                  {item.company_name} · {item.target_role} · {statusLabels[item.status] ?? item.status}
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">AI 见解</div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">下一步建议</div>
              </div>
              <BarChart3 className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="mt-6 rounded-[24px] bg-gradient-to-br from-cyan-500/15 to-indigo-500/10 p-5">
              <div className="flex items-center gap-2 text-sm text-cyan-200">
                <Clock3 className="h-4 w-4" /> 未来 7 天建议
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                {topActions.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
              <Link to="/applications" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                查看投递管理 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </DashboardCard>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default Dashboard;
