import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDashboard, getPricing, getSessions } from '../services/analysis';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge, MatchScoreBadge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate, relativeTime } from '../utils/format';

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
  children: React.ReactNode;
  kicker?: string;
  action?: React.ReactNode;
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

    if (top.length === 0) return 'No tracked applications yet';
    return top.map(([key, count]) => `${count} ${key}`).join(' · ');
  }, [stats?.application_by_status]);

  const taskSummary = useMemo(() => {
    const statuses = stats?.task_by_status ?? {};
    const top = Object.entries(statuses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (top.length === 0) return 'No active task breakdown yet';
    return top.map(([key, count]) => `${count} ${key}`).join(' · ');
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
                <Badge variant="primary" className="px-3 py-1.5 text-[10px] tracking-[0.16em] uppercase">
                  Console overview
                </Badge>
                <h1 className="mt-4 text-[34px] md:text-[48px] xl:text-[60px] leading-[0.98] font-black tracking-[-0.05em] text-[var(--color-text-on-surface)]">
                  {user?.name || 'Your'} career command center
                </h1>
                <p className="mt-4 max-w-[760px] text-sm md:text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
                  Review the latest analyses, decide what to do next, and keep your application workflow in one place. The layout is intentionally calmer and more editorial while staying operational.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Button size="lg" icon="add" onClick={() => navigate('/analyze')}>
                  Start new analysis
                </Button>
                <Button size="lg" variant="secondary" icon="history" onClick={() => navigate('/history')}>
                  Open history
                </Button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <HeroMetric label="Credits" value={user?.credits ?? 0} note="Available runs in your current workspace" />
              <HeroMetric label="This week" value={stats?.analyses_this_week ?? 0} note="Analyses completed in the last 7 days" />
              <HeroMetric label="Average match" value={`${stats?.average_match_score ?? 0}%`} note="Mean fit score across recent reports" />
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
              <p className="editorial-kicker text-white/60 mb-2">Next move</p>
              <h2 className="text-[28px] leading-tight font-black tracking-tight text-white">Focus on the work that changes the outcome</h2>
            </div>
            {needsCredits && <Badge variant="warning">Low credits</Badge>}
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Upload a fresh resume snapshot',
                desc: 'Feed the analysis engine with your latest evidence before you compare against a new role.',
                icon: 'upload_file',
              },
              {
                title: 'Push gaps into learning tasks',
                desc: 'Treat every weak area like a backlog item instead of a vague note.',
                icon: 'checklist_rtl',
              },
              {
                title: 'Prepare interview proof points',
                desc: 'Turn report insights into stronger stories, examples, and likely questions.',
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
        <SurfaceCard title="Recent reports" kicker="Analysis stream" className="xl:col-span-7" action={<Button variant="ghost" icon="arrow_forward" iconPosition="right" onClick={() => navigate('/history')}>View all</Button>}>
          {loading ? (
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading live data...</div>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon="analytics"
              title="No analysis yet"
              description="Run your first comparison to populate the redesigned console."
              action={{ label: 'Start analysis', icon: 'add', onClick: () => navigate('/analyze') }}
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

        <SurfaceCard title="Workspace health" kicker="Operations" className="xl:col-span-5">
          <div className="space-y-4">
            {[
              {
                label: 'Applications tracked',
                value: stats?.total_applications ?? 0,
                detail: applicationSummary,
                tone: 'primary',
              },
              {
                label: 'Learning tasks',
                value: stats?.total_tasks ?? 0,
                detail: taskSummary,
                tone: 'warning',
              },
              {
                label: 'Spend to date',
                value: `CNY ${stats?.total_spent_cny ?? 0}`,
                detail: `${stats?.total_analyses ?? 0} analyses recorded in this workspace`,
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
        <SurfaceCard title="Account capacity" kicker="Credits & pricing" className="xl:col-span-5" action={needsCredits ? <Badge variant="warning">Top up soon</Badge> : undefined}>
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
                  <Badge variant="secondary">{pkg.credits} credits</Badge>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-[24px] leading-none font-black tracking-tight">CNY {pkg.price_cny}</p>
                  <Button variant="secondary" onClick={() => navigate('/analyze')}>
                    Use credits
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Execution shortcuts" kicker="Quick actions" className="xl:col-span-7">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Run an analysis',
                desc: 'Compare your resume with a new JD and refresh the signal.',
                icon: 'auto_awesome',
                action: () => navigate('/analyze'),
              },
              {
                title: 'Review tasks',
                desc: 'Focus on the learning backlog created from previous reports.',
                icon: 'task_alt',
                action: () => navigate('/tasks'),
              },
              {
                title: 'Prep interviews',
                desc: 'Turn analysis gaps into likely questions and stronger stories.',
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
