import { useNavigate } from 'react-router-dom';
import {
  Add,
  TrendingUp,
  Description,
  Warning,
  AutoAwesome,
  ArrowForward,
  ChevronRight,
  UploadFile,
} from '@mui/icons-material';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/Progress';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { getDashboard, getSessions } from '../services/analysis';
import { PageContainer } from '../components/layout/PageContainer';

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_STATS = {
  avgMatch: 84,
  applications: 12,
  interviews: 8,
  skillGaps: 3,
};

const SKILL_GAP_TAGS = ['Kubernetes', 'Golang', 'Rust'];

// ─── Analysis card ───────────────────────────────────────────────────────────

interface AnalysisCardProps {
  roleTitle: string;
  company: string;
  location?: string;
  matchScore?: number;
  analyzedAgo?: string;
  priority?: ('high' | 'medium' | 'low')[];
  isNewAnalysis?: boolean;
  onClick?: () => void;
}

function AnalysisCard({
  roleTitle,
  company,
  location,
  matchScore,
  analyzedAgo,
  priority,
  isNewAnalysis,
  onClick,
}: AnalysisCardProps) {
  if (isNewAnalysis) {
    return (
      <Card
        className="border-2 border-dashed border-[var(--color-outline-variant)]/30 hover:border-[var(--color-primary)]/30 transition-all duration-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer h-64"
        padding={false}
        onClick={onClick}
      >
        <div className="w-14 h-14 bg-[var(--color-bg-surface)] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
          <UploadFile sx={{ fontSize: 32, color: 'var(--color-primary)' }} />
        </div>
        <p className="font-bold text-[var(--color-text-on-surface)]">Run New Analysis</p>
        <p className="text-[var(--color-text-on-surface-variant)] text-xs mt-2 max-w-[160px]">
          Upload a PDF job description or paste a URL to begin.
        </p>
      </Card>
    );
  }

  return (
    <Card
      hoverable
      className="rounded-xl p-6 flex flex-col justify-between h-64"
      padding={false}
      onClick={onClick}
    >
      <div className="p-6 pb-0">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-[var(--color-bg-surface)] rounded-lg">
            <div className="w-10 h-10 bg-[var(--color-surface-container-highest)] rounded" />
          </div>
          {matchScore !== undefined && (
            <Badge variant={matchScore >= 80 ? 'success' : matchScore >= 60 ? 'info' : 'warning'}>
              {matchScore}% MATCH
            </Badge>
          )}
        </div>
        <h4 className="text-lg font-bold text-[var(--color-text-on-surface)] leading-tight">
          {roleTitle}
        </h4>
        <p className="text-[var(--color-text-on-surface-variant)] text-sm mt-1">
          {company}{location ? ` · ${location}` : ''}
        </p>
      </div>
      <div className="p-6 pt-4 border-t border-[var(--color-outline-variant)]/10 flex justify-between items-center">
        <p className="text-[10px] text-[var(--color-text-on-surface-variant)] font-bold tracking-widest uppercase">
          Analyzed {analyzedAgo}
        </p>
        <div className="flex -space-x-1">
          {priority?.map((p, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background:
                  p === 'high'
                    ? 'var(--color-error)'
                    : p === 'medium'
                    ? 'var(--color-warning)'
                    : 'var(--color-surface-container-highest)',
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

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

  const avgMatch = stats?.avg_match ?? MOCK_STATS.avgMatch;
  const applications = stats?.applications ?? MOCK_STATS.applications;

  return (
    <PageContainer>

        {/* Welcome Section */}
        <section className="mb-14">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-text-on-surface-variant)] uppercase mb-2">
            Workspace Overview
          </p>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-[var(--color-text-on-surface)]">
                Precision Dashboard
              </h2>
              <p className="text-[var(--color-text-on-surface-variant)] mt-2 text-lg">
                You have {MOCK_STATS.skillGaps} critical skill gaps across {applications} targeted roles.
              </p>
            </div>
          </div>
        </section>

        {/* Stats: Bento Grid */}
        <section className="grid grid-cols-12 gap-6 mb-14">

          {/* Average Match Score — large card */}
          <Card className="col-span-12 lg:col-span-5 rounded-xl p-8 flex flex-col justify-between relative overflow-hidden" padding={false}>
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16"
              style={{ background: 'var(--color-primary)/5' }}
            />
            <div className="relative z-10">
              <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-on-surface-variant)] uppercase">
                Average Match Score
              </p>
              <div className="flex items-baseline gap-2 mt-4">
                <h3 className="text-7xl font-black text-[var(--color-primary)] tracking-tighter">
                  {avgMatch}
                  <span className="text-3xl">%</span>
                </h3>
                <span className="text-[var(--color-primary)] font-bold flex items-center gap-1 text-sm bg-[var(--color-primary)]/10 px-2 py-0.5 rounded">
                  <TrendingUp sx={{ fontSize: 14 }} />
                  +12%
                </span>
              </div>
            </div>
            <p className="text-[var(--color-text-on-surface-variant)] text-sm mt-8 max-w-[240px] relative z-10">
              Your match profile has improved significantly after completing the{' '}
              <span className="text-[var(--color-text-on-surface)] font-semibold">Advanced System Design</span>{' '}
              module.
            </p>
          </Card>

          {/* Right column: 2x2 grid */}
          <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-6">

            {/* Active Applications */}
            <Card className="rounded-xl p-6" padding={false}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: 'var(--color-primary)/10' }}
              >
                <Description sx={{ color: 'var(--color-primary)', fontSize: 20 }} />
              </div>
              <p className="text-[var(--color-text-on-surface-variant)] text-xs font-bold uppercase tracking-widest">
                Active Applications
              </p>
              <p className="text-3xl font-extrabold text-[var(--color-text-on-surface)] mt-1">
                {applications}
              </p>
              <div className="mt-4">
                <ProgressBar value={65} size="sm" color="primary" />
              </div>
              <p className="text-[10px] text-[var(--color-text-on-surface-variant)] mt-2 font-medium">
                {MOCK_STATS.interviews} in interview stage
              </p>
            </Card>

            {/* Critical Skill Gaps */}
            <Card className="rounded-xl p-6" padding={false}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: 'var(--color-tertiary)/10' }}
              >
                <Warning sx={{ color: 'var(--color-tertiary)', fontSize: 20 }} />
              </div>
              <p className="text-[var(--color-text-on-surface-variant)] text-xs font-bold uppercase tracking-widest">
                Critical Skill Gaps
              </p>
              <p className="text-3xl font-extrabold text-[var(--color-text-on-surface)] mt-1">
                {String(MOCK_STATS.skillGaps).padStart(2, '0')}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {SKILL_GAP_TAGS.map((tag) => (
                  <Badge key={tag} variant="warning">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Next Priority Step */}
            <Card
              className="col-span-2 rounded-xl p-6 flex items-center justify-between"
              padding={false}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    boxShadow: '0 4px 16px rgba(53,37,205,0.3)',
                  }}
                >
                  <AutoAwesome sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-text-on-surface)]">Next Priority Step</p>
                  <p className="text-xs text-[var(--color-text-on-surface-variant)]">
                    Update your portfolio with the recent &quot;EcoStream&quot; project analysis.
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/analyze')}>
                Take Action
                <ArrowForward sx={{ fontSize: 14 }} />
              </Button>
            </Card>

          </div>
        </section>

        {/* Recent Analyses */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[var(--color-text-on-surface)] tracking-tight">
              Recent Job Analyses
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
              View All Analyses
              <ChevronRight sx={{ fontSize: 16 }} />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <EmptyState
                icon="📊"
                title="还没有分析记录"
                description="上传简历 + 粘贴 JD，AI 自动分析差距、生成定制简历"
                action={{ label: '开始分析', onClick: () => navigate('/analyze') }}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sessions.slice(0, 2).map((session) => (
                <AnalysisCard
                  key={session.id}
                  matchScore={session.match_score}
                  roleTitle={session.target_role}
                  company={session.company || 'Unknown Company'}
                  analyzedAgo={`${Math.floor(Math.random() * 5) + 1}d`}
                  priority={['high', 'medium', 'low']}
                  onClick={() => navigate(`/analyze/${session.id}`)}
                />
              ))}
              <AnalysisCard
                roleTitle=""
                company=""
                isNewAnalysis
                onClick={() => navigate('/analyze')}
              />
            </div>
          )}
        </section>

      {/* FAB */}
      <button
        onClick={() => navigate('/analyze')}
        className="fixed bottom-10 right-10 w-14 h-14 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-full flex items-center justify-center hover:scale-105 transition-transform z-50"
        style={{ boxShadow: '0 8px 32px rgba(53,37,205,0.4)' }}
      >
        <Add sx={{ fontSize: 24 }} />
      </button>
    </PageContainer>
  );
}
