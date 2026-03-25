import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDashboard, getPricing, getSessions } from '../services/analysis';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, MatchScoreBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate, relativeTime } from '../utils/format';

function StatCard({ label, value, detail, tone = 'default' }: { label: string; value: string | number; detail: string; tone?: 'default' | 'primary' | 'warning' }) {
  const color = tone === 'primary' ? 'var(--color-primary)' : tone === 'warning' ? 'var(--color-tertiary)' : 'var(--color-text)';

  return (
    <Card className="min-h-[160px]">
      <p className="editorial-kicker mb-4">{label}</p>
      <p className="text-4xl font-black tracking-tight" style={{ color }}>
        {value}
      </p>
      <p className="mt-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {detail}
      </p>
    </Card>
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
  const sessions = sessionsData?.sessions ?? [];
  const needsCredits = (dashboardData?.user.credits ?? 0) < 1;
  const loading = dashboardLoading || sessionsLoading;

  return (
    <PageContainer>
      <PageHeader
        title="Career Strategy Dashboard"
        description="Keep analysis, applications, learning actions, and interview prep in one operating system."
        action={
          <Button size="lg" icon="add" onClick={() => navigate('/analyze')}>
            Start New Analysis
          </Button>
        }
      />

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        <Card className="xl:col-span-7 p-8 overflow-hidden relative">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at top right, rgba(79,70,229,0.12), transparent 32%)' }} />
          <div className="relative">
            <p className="editorial-kicker mb-3">Career Pulse</p>
            <h2 className="text-4xl font-black tracking-tight mb-3" style={{ color: 'var(--color-text-on-surface)' }}>
              {dashboardData?.user.name || 'Your'} workspace
            </h2>
            <p className="text-sm max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
              In the last 7 days you completed {stats?.analyses_this_week ?? 0} analyses, with an average match score of {stats?.average_match_score ?? 0}%.
              Tightening the highest-risk skill gaps first usually gives the fastest lift in application quality.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                <p className="editorial-kicker mb-2">Credits</p>
                <p className="text-2xl font-black">{dashboardData?.user.credits ?? 0}</p>
              </div>
              <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                <p className="editorial-kicker mb-2">This Week</p>
                <p className="text-2xl font-black">{stats?.analyses_this_week ?? 0}</p>
              </div>
              <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                <p className="editorial-kicker mb-2">Average Match</p>
                <p className="text-2xl font-black">{stats?.average_match_score ?? 0}%</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-5 p-8">
          <p className="editorial-kicker mb-3">Next Best Action</p>
          <h3 className="text-2xl font-bold tracking-tight mb-2">Turn insight into action</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Run an analysis, then convert the most important gaps into tasks and interview prep so the report becomes a working plan.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>upload_file</span>
              <div>
                <p className="font-semibold">Upload resume and paste JD</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Create a real input set for the analysis engine.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>school</span>
              <div>
                <p className="font-semibold">Convert gaps into learning tasks</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Avoid reports that are reviewed once and ignored.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>record_voice_over</span>
              <div>
                <p className="font-semibold">Generate interview prep cards</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Use the same analysis to prepare your next conversation.</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total Analyses" value={stats?.total_analyses ?? 0} detail="Completed role-fit reports" tone="primary" />
        <StatCard label="Applications" value={stats?.total_applications ?? 0} detail="Tracked roles in your pipeline" />
        <StatCard label="Learning Tasks" value={stats?.total_tasks ?? 0} detail={`Total spend: CNY ${stats?.total_spent_cny ?? 0}`} tone="warning" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <Card className="xl:col-span-8 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="editorial-kicker mb-2">Recent Analyses</p>
              <h3 className="text-xl font-bold tracking-tight">Recent reports</h3>
            </div>
            <Button variant="ghost" icon="chevron_right" iconPosition="right" onClick={() => navigate('/history')}>
              View All
            </Button>
          </div>

          {loading ? (
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading live data...</div>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon="analytics"
              title="No analysis yet"
              description="Upload a resume and paste a target job description to create your first report."
              action={{ label: 'Start Analysis', icon: 'add', onClick: () => navigate('/analyze') }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <Card key={session.id} hoverable className="p-5" onClick={() => navigate(`/analyze/${session.id}`)}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-lg font-semibold tracking-tight">{session.target_role}</h4>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {formatDate(session.created_at)} · {relativeTime(session.created_at)}
                      </p>
                    </div>
                    <MatchScoreBadge score={session.match_score} />
                  </div>
                  <p className="text-sm line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {session.summary}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Card>

        <Card className="xl:col-span-4 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="editorial-kicker mb-2">Credits & Pricing</p>
              <h3 className="text-xl font-bold tracking-tight">Account capacity</h3>
            </div>
            {needsCredits && <Badge variant="warning">Low Credits</Badge>}
          </div>

          <div className="space-y-3">
            {pricing.slice(0, 3).map((pkg) => (
              <div key={pkg.code} className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">{pkg.name}</p>
                  <Badge variant="secondary">{pkg.credits} credits</Badge>
                </div>
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  {pkg.description}
                </p>
                <p className="text-lg font-bold">CNY {pkg.price_cny}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-3">
            <Button className="flex-1" onClick={() => navigate('/analyze')}>
              Analyze Now
            </Button>
            <Button className="flex-1" variant="secondary" onClick={() => navigate('/settings')}>
              Settings
            </Button>
          </div>
        </Card>
      </section>
    </PageContainer>
  );
}
