import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDashboard, getSessions } from '../services/analysis';
import { PageContainer } from '../components/layout/PageContainer';
import { MatchScoreCard } from '../components/features/dashboard/MatchScoreCard';
import { StatCard } from '../components/features/dashboard/StatCard';
import { AnalysisCard } from '../components/features/dashboard/AnalysisCard';
import { NextPriorityBanner } from '../components/features/dashboard/NextPriorityBanner';
import { SkillGapTag } from '../components/features/dashboard/SkillGapTag';
import { SkeletonCard } from '../components/ui/Skeleton';

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
  const interviews = stats?.interviews ?? MOCK_STATS.interviews;
  const analysesTotal = stats?.analyses_total ?? MOCK_STATS.analyses_total;

  const skillGaps = sessions.length > 0
    ? sessions.flatMap(s => s.summary ? [] : []).slice(0, 3)
    : DEFAULT_SKILL_GAPS;

  return (
    <PageContainer>
      {/* Welcome Section */}
      <section className="mb-14">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>
          Workspace Overview
        </p>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight" style={{ color: 'var(--color-on-surface)' }}>
              Precision Dashboard
            </h2>
            <p className="mt-2 text-lg" style={{ color: 'var(--color-on-surface-variant)' }}>
              You have {analysesTotal} critical skill gaps across {applications} targeted roles.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-12 gap-6 mb-14">
        {/* Match Score Card - col-span-5 */}
        <div className="col-span-12 lg:col-span-5">
          <MatchScoreCard
            score={avgMatch}
            trend={12}
            description="Your match profile has improved significantly after completing the Advanced System Design module."
          />
        </div>

        {/* Right 2x2 grid - col-span-7 */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-6">
          {/* Active Applications */}
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

          {/* Critical Skill Gaps */}
          <StatCard
            iconName="warning"
            iconBgColor="rgba(126,48,0,0.1)"
            iconColor="var(--color-tertiary)"
            label="Critical Skill Gaps"
            value={String(analysesTotal).padStart(2, '0')}
          >
            {DEFAULT_SKILL_GAPS.map(tag => (
              <SkillGapTag key={tag} label={tag} />
            ))}
          </StatCard>

          {/* Next Priority Step - spans full width */}
          <div className="col-span-2">
            <NextPriorityBanner
              title="Next Priority Step"
              description='Update your portfolio with the recent "EcoStream" project analysis.'
              actionLabel="Take Action"
              actionPath="/analyze"
            />
          </div>
        </div>
      </section>

      {/* Recent Analyses */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-on-surface)' }}>
            Recent Job Analyses
          </h3>
          <button
            className="text-sm font-medium flex items-center gap-2 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-on-surface-variant)' }}
            onClick={() => navigate('/history')}
          >
            View All Analyses
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : sessions.length === 0 ? (
          <div
            className="rounded-xl p-12 flex flex-col items-center justify-center text-center"
            style={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--color-on-surface-variant)' }}>analytics</span>
            </div>
            <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--color-on-surface)' }}>No analyses yet</h4>
            <p className="text-sm mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
              Upload a resume + paste a job description to get started
            </p>
            <button
              className="px-6 py-3 rounded-lg text-sm font-semibold transition-opacity"
              style={{ background: 'var(--color-primary-container)', color: 'var(--color-on-primary)' }}
              onClick={() => navigate('/analyze')}
            >
              <span className="material-symbols-outlined text-sm mr-2">add</span>
              Start Analysis
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sessions.slice(0, 2).map(session => (
              <AnalysisCard key={session.id} session={session} />
            ))}
            <AnalysisCard isNewAnalysis onNewAnalysis={() => navigate('/analyze')} />
          </div>
        )}
      </section>

      {/* FAB */}
      <button
        className="fixed rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform z-50"
        style={{
          bottom: 40,
          right: 40,
          width: 56,
          height: 56,
          background: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          boxShadow: '0 8px 32px rgba(53,37,205,0.4)',
        }}
        onClick={() => navigate('/analyze')}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>add</span>
      </button>
    </PageContainer>
  );
}
