import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDashboard, getSessions } from '../services/analysis';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/features/dashboard/StatCard';
import { AnalysisCard } from '../components/features/dashboard/AnalysisCard';
import { NextPriorityBanner } from '../components/features/dashboard/NextPriorityBanner';
import { SkillGapTag } from '../components/features/dashboard/SkillGapTag';
import { SkeletonCard } from '../components/ui/Skeleton';
import { MetricCard } from '../components/ui/MetricCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { FAB } from '../components/ui/FAB';
import { Button } from '../components/ui/Button';

const MOCK_STATS = { avg_match: 84, applications: 12, interviews: 8, analyses_total: 3 };
const DEFAULT_SKILL_GAPS = ['Kubernetes', 'Golang', 'Rust'];

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', { limit: 6 }],
    queryFn: () => getSessions({ limit: 6 }),
  });

  const isLoading = statsLoading || sessionsLoading;
  const sessions = sessionsData?.sessions ?? [];
  const avgMatch = stats?.avg_match ?? MOCK_STATS.avg_match;
  const applications = stats?.applications ?? MOCK_STATS.applications;
  const interviews = MOCK_STATS.interviews;
  const analysesTotal = stats?.analyses_total ?? MOCK_STATS.analyses_total;

  return (
    <PageContainer>
      {/* Welcome Section */}
      <section className="mb-10">
        <p
          className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          Workspace Overview
        </p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              className="text-3xl font-bold tracking-tight"
              style={{ color: 'var(--color-on-surface)' }}
            >
              Precision Dashboard
            </h2>
            <p className="mt-1.5 text-base" style={{ color: 'var(--color-on-surface-variant)' }}>
              {analysesTotal} critical skill gaps across {applications} targeted roles
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      {/* Layout: 12-col grid — MatchScore col-span-5, right col-span-7 */}
      <section className="grid grid-cols-12 gap-6 mb-10">
        {/* MetricCard — col-span-5 */}
        <div className="col-span-12 lg:col-span-5">
          <MetricCard
            value={avgMatch}
            unit="%"
            label="Average Match Score"
            trend={12}
            description="Your match profile has improved after completing the Advanced System Design module."
          />
        </div>

        {/* Right column — col-span-7: 2 stat cards + full-width banner */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {/* 2x1 grid for stat cards */}
          <div className="grid grid-cols-2 gap-6">
            <StatCard
              iconName="description"
              iconBgColor="rgba(53,37,205,0.1)"
              iconColor="var(--color-primary)"
              label="Active Applications"
              value={applications}
              progressValue={65}
              progressMax={100}
              description={`${interviews} in interview stage`}
            />
            <StatCard
              iconName="warning"
              iconBgColor="rgba(126,48,0,0.1)"
              iconColor="var(--color-tertiary)"
              label="Critical Skill Gaps"
              value={analysesTotal}
            >
              <div className="flex flex-wrap gap-1.5 mt-3">
                {DEFAULT_SKILL_GAPS.map(tag => (
                  <SkillGapTag key={tag} label={tag} />
                ))}
              </div>
            </StatCard>
          </div>

          {/* Full-width Next Priority Banner */}
          <NextPriorityBanner
            title="Next Priority Step"
            description='Update your portfolio with the recent "EcoStream" project analysis.'
            actionLabel="Take Action"
            actionPath="/analyze"
          />
        </div>
      </section>

      {/* Recent Analyses */}
      <section>
        <SectionHeader
          title="Recent Job Analyses"
          action={
            <Button
              variant="ghost"
              size="sm"
              icon="chevron_right"
              iconPosition="right"
              onClick={() => navigate('/history')}
            >
              View all
            </Button>
          }
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon="analytics"
            title="No analyses yet"
            description="Upload a resume and paste a job description to get started"
            action={{
              label: 'Start Analysis',
              icon: 'add',
              onClick: () => navigate('/analyze'),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sessions.slice(0, 2).map(session => (
              <AnalysisCard key={session.id} session={session} />
            ))}
            <AnalysisCard isNewAnalysis onNewAnalysis={() => navigate('/analyze')} />
          </div>
        )}
      </section>

      {/* Floating Action Button */}
      <FAB href="/analyze" />
    </PageContainer>
  );
}
