import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDashboard, getPricing, getSessions } from '../services/analysis';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge, MatchScoreBadge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate, relativeTime } from '../utils/format';

/** 与后端 `ApplicationStatus` 枚举值对应 */
const APPLICATION_STATUS_ZH: Record<string, string> = {
  interested: '意向',
  applied: '已投递',
  interviewing: '面试中',
  offer: '录用',
  rejected: '已拒绝',
  withdrawn: '已撤回',
};

/** 与后端 `LearningTaskStatus` 枚举值对应 */
const TASK_STATUS_ZH: Record<string, string> = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成',
};

function statusZh(key: string, map: Record<string, string>): string {
  return map[key] ?? key;
}

function HeroMetric({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div
      className="rounded-[24px] px-4 py-4 md:px-5 md:py-5"
      style={{
        background: 'rgba(255,255,255,0.6)',
        border: '1px solid rgba(255,255,255,0.65)',
        boxShadow: '0 12px 32px rgba(53,37,205,0.06)',
      }}
    >
      <p className="editorial-kicker mb-2">{label}</p>
      <p className="text-[28px] md:text-[34px] leading-none font-black tracking-tight text-[var(--color-text-on-surface)]">{value}</p>
      <p className="mt-2 text-xs md:text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
        {note}
      </p>
    </div>
  );
}

function SurfaceCard({
  title,
  children,
  kicker,
  action,
  className = '',
}: {
  title: string;
  children: ReactNode;
  kicker?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[30px] md:rounded-[34px] p-5 md:p-6 xl:p-7 ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,242,255,0.9))',
        border: '1px solid color-mix(in srgb, var(--color-outline-variant) 38%, transparent)',
        boxShadow: '0 20px 48px rgba(27,27,36,0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          {kicker && <p className="editorial-kicker mb-2">{kicker}</p>}
          <h3 className="text-[22px] md:text-[26px] leading-tight font-black tracking-tight">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', { limit: 4 }],
    queryFn: () => getSessions({ limit: 4 }),
  });

  const { data: pricing = [] } = useQuery({
    queryKey: ['pricing'],
    queryFn: getPricing,
  });

  const stats = dashboardData?.stats;
  const user = dashboardData?.user;
  const sessions = sessionsData?.sessions ?? [];
  const loading = dashboardLoading || sessionsLoading;

  const applicationSummary = useMemo(() => {
    const statuses = stats?.application_by_status ?? {};
    const top = Object.entries(statuses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (top.length === 0) return '暂无已跟踪的投递';
    return top.map(([key, count]) => `${count} ${statusZh(key, APPLICATION_STATUS_ZH)}`).join(' · ');
  }, [stats?.application_by_status]);

  const taskSummary = useMemo(() => {
    const statuses = stats?.task_by_status ?? {};
    const top = Object.entries(statuses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (top.length === 0) return '暂无任务状态分布';
    return top.map(([key, count]) => `${count} ${statusZh(key, TASK_STATUS_ZH)}`).join(' · ');
  }, [stats?.task_by_status]);

  const needsCredits = (user?.credits ?? 0) < 1;

  return (
    <PageContainer>
      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_360px] gap-6 xl:gap-8 mb-8 md:mb-10">
        <div
          className="relative overflow-hidden rounded-[34px] md:rounded-[40px] px-5 py-6 md:px-8 md:py-8 xl:px-10 xl:py-10"
          style={{
            background:
              'radial-gradient(circle at 16% 12%, rgba(255,255,255,0.86), transparent 18%), radial-gradient(circle at 86% 14%, rgba(195,192,255,0.68), transparent 22%), linear-gradient(135deg, #f5f2ff 0%, #f8f6ff 46%, #efebff 100%)',
            border: '1px solid color-mix(in srgb, var(--color-outline-variant) 40%, transparent)',
            boxShadow: '0 30px 80px rgba(53,37,205,0.09)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute right-[-70px] top-[-40px] w-[260px] h-[260px] rounded-full bg-[rgba(91,78,255,0.12)] blur-3xl" />
            <div className="absolute left-[8%] bottom-[-80px] w-[320px] h-[180px] rounded-full bg-[rgba(255,182,149,0.15)] blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <Badge variant="primary" className="px-3 py-1.5 text-[10px] tracking-[0.12em]">
                  控制台总览
                </Badge>
                <h1 className="mt-4 text-[34px] md:text-[48px] xl:text-[60px] leading-[0.98] font-black tracking-[-0.05em] text-[var(--color-text-on-surface)]">
                  {user?.name ? `${user.name} 的求职指挥台` : '你的求职指挥台'}
                </h1>
                <p className="mt-4 max-w-[760px] text-sm md:text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
                  查看近期分析、规划下一步，把投递记录、学习任务与面试准备集中在一处完成。
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Button size="lg" icon="add" onClick={() => navigate('/analyze')}>
                  新建分析
                </Button>
                <Button size="lg" variant="secondary" icon="history" onClick={() => navigate('/history')}>
                  分析记录
                </Button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <HeroMetric label="积分余额" value={user?.credits ?? 0} note="当前工作区可用于分析的次数" />
              <HeroMetric label="本周分析" value={stats?.analyses_this_week ?? 0} note="近 7 天完成的分析次数" />
              <HeroMetric label="平均匹配度" value={`${stats?.average_match_score ?? 0}%`} note="近期报告的平均匹配得分" />
            </div>
          </div>
        </div>

        <div
          className="rounded-[32px] md:rounded-[36px] p-5 md:p-6 xl:p-7"
          style={{
            background: 'linear-gradient(180deg, rgba(18,18,31,0.96), rgba(35,37,57,0.96))',
            boxShadow: '0 24px 60px rgba(17, 24, 39, 0.26)',
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="editorial-kicker text-white/60 mb-2">下一步</p>
              <h2 className="text-[28px] leading-tight font-black tracking-tight text-white">先做能改变结果的关键几步</h2>
            </div>
            {needsCredits && <Badge variant="warning">积分不足</Badge>}
          </div>

          <div className="space-y-3">
            {[
              {
                title: '上传最新版简历',
                desc: '与新岗位对比前，先确保简历内容是最新、最完整的一版。',
                icon: 'upload_file',
              },
              {
                title: '把差距落成学习任务',
                desc: '将薄弱项拆成任务，设好优先级与目标完成时间。',
                icon: 'checklist_rtl',
              },
              {
                title: '准备面试论据与故事',
                desc: '把报告里的洞察变成可讲的故事、案例与高频问题预案。',
                icon: 'record_voice_over',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[22px] p-4 border border-white/8 bg-white/6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-[16px] flex items-center justify-center bg-white/10 text-white shrink-0">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/70">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8 md:mb-10">
        <SurfaceCard
          title="近期报告"
          kicker="分析动态"
          className="xl:col-span-7"
          action={
            <Button variant="ghost" icon="arrow_forward" iconPosition="right" onClick={() => navigate('/history')}>
              查看全部
            </Button>
          }
        >
          {loading ? (
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              正在加载数据…
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon="analytics"
              title="暂无分析记录"
              description="先完成一次简历与岗位对比，建立你的报告历史。"
              action={{ label: '新建分析', icon: 'add', onClick: () => navigate('/analyze') }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  hoverable
                  className="rounded-[24px] p-5"
                  onClick={() => navigate(`/analyze/${session.id}`)}
                  style={{ background: 'rgba(255,255,255,0.66)' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-lg font-bold tracking-tight">{session.target_role}</h4>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {formatDate(session.created_at)} · {relativeTime(session.created_at)}
                      </p>
                    </div>
                    <MatchScoreBadge score={session.match_score} />
                  </div>
                  <p className="text-sm line-clamp-3 leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                    {session.summary}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard title="工作区健康度" kicker="运营概况" className="xl:col-span-5">
          <div className="space-y-4">
            {[
              {
                label: '已跟踪投递',
                value: stats?.total_applications ?? 0,
                detail: applicationSummary,
                tone: 'primary',
              },
              {
                label: '学习任务',
                value: stats?.total_tasks ?? 0,
                detail: taskSummary,
                tone: 'warning',
              },
              {
                label: '累计消费',
                value: `¥${stats?.total_spent_cny ?? 0}`,
                detail: `本工作区已记录 ${stats?.total_analyses ?? 0} 次分析`,
                tone: 'neutral',
              },
            ].map((item) => {
              const accent = item.tone === 'primary' ? 'var(--color-primary)' : item.tone === 'warning' ? 'var(--color-tertiary)' : 'var(--color-text)';
              return (
                <div key={item.label} className="rounded-[24px] p-5" style={{ background: 'rgba(255,255,255,0.62)' }}>
                  <p className="editorial-kicker mb-2">{item.label}</p>
                  <p className="text-[30px] leading-none font-black tracking-tight" style={{ color: accent }}>
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </SurfaceCard>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <SurfaceCard title="账户容量" kicker="积分与套餐" className="xl:col-span-5" action={needsCredits ? <Badge variant="warning">建议充值</Badge> : undefined}>
          <div className="space-y-3">
            {pricing.slice(0, 3).map((pkg) => (
              <div key={pkg.code} className="rounded-[24px] p-4 md:p-5" style={{ background: 'rgba(255,255,255,0.66)' }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-base font-bold tracking-tight">{pkg.name}</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {pkg.description}
                    </p>
                  </div>
                  <Badge variant="secondary">{pkg.credits} 积分</Badge>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-[24px] leading-none font-black tracking-tight">¥{pkg.price_cny}</p>
                  <Button variant="secondary" onClick={() => navigate('/billing')}>
                    前往账单
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="快捷执行" kicker="常用操作" className="xl:col-span-7">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: '运行分析',
                desc: '将简历与新岗位 JD 对比，刷新匹配信号。',
                icon: 'auto_awesome',
                action: () => navigate('/analyze'),
              },
              {
                title: '查看任务',
                desc: '处理历史报告生成的学习待办与补强项。',
                icon: 'task_alt',
                action: () => navigate('/tasks'),
              },
              {
                title: '面试准备',
                desc: '把分析中的差距转化为高频问题与表达素材。',
                icon: 'forum',
                action: () => navigate('/interview'),
              },
            ].map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={item.action}
                className="text-left rounded-[26px] p-5 transition-transform duration-150 hover:-translate-y-0.5"
                style={{
                  background: 'rgba(255,255,255,0.66)',
                  border: '1px solid color-mix(in srgb, var(--color-outline-variant) 32%, transparent)',
                  boxShadow: '0 14px 34px rgba(27,27,36,0.04)',
                }}
              >
                <div className="w-11 h-11 rounded-[18px] flex items-center justify-center mb-4" style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <p className="text-lg font-bold tracking-tight">{item.title}</p>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </PageContainer>
  );
}
