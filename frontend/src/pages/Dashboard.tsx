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
      {/* ── A. Overview Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ color: 'var(--color-on-surface)' }}
          >
            Your Workspace
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            {analysesTotal} skill gap{analysesTotal !== 1 ? 's' : ''} across{' '}
            <span className="font-semibold" style={{ color: 'var(--color-on-surface)' }}>
              {applications}
            </span>{' '}
            targeted role{applications !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          icon="add"
          onClick={() => navigate('/analyze')}
        >
          New Analysis
        </Button>
      </div>

      {/* ── B. Stats Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <MetricCard
          value={avgMatch}
          unit="%"
          label="Avg Match Score"
          trend={12}
          description="Match profile improved after completing Advanced System Design."
        />
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
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_SKILL_GAPS.map(tag => (
              <SkillGapTag key={tag} label={tag} />
            ))}
          </div>
        </StatCard>
      </div>

      {/* ── C. Next Priority ─────────────────────────────────────── */}
      <div className="mb-10">
        <NextPriorityBanner
          title="Next Priority"
          description='Complete the "EcoStream" portfolio update before your next interview.'
          actionLabel="Take Action"
          actionPath="/analyze"
        />
      </div>

      {/* ── D. Recent Analyses ────────────────────────────────────── */}
      <SectionHeader
        title="Recent Analyses"
        action={
          <Button
            variant="ghost"
            size="md"
            icon="chevron_right"
            iconPosition="right"
            onClick={() => navigate('/history')}
          >
            View all
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sessions.slice(0, 3).map(session => (
            <AnalysisCard key={session.id} session={session} />
          ))}
          {sessions.length < 3 && (
            <AnalysisCard isNewAnalysis onNewAnalysis={() => navigate('/analyze')} />
          )}
        </div>
      )}
    </PageContainer>
  );
}
