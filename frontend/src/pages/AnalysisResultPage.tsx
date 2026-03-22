import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSession } from '../services/analysis';
import { PageContainer } from '../components/layout/PageContainer';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/Progress';

// ─── Gap Score Gauge ──────────────────────────────────────────────────────────

function GapScoreGauge({ score }: { score: number }) {
  const size = 256;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80
    ? 'var(--color-success)'
    : score >= 60
    ? 'var(--color-primary)'
    : 'var(--color-warning)';

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-container-highest)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black tracking-tighter" style={{ color: 'var(--color-on-surface)' }}>
          {score}%
        </span>
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>
          Match Score
        </span>
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection({
  matchScore,
  summary,
}: {
  roleTitle: string;
  company?: string;
  matchScore: number;
  summary: string;
}) {
  const navigate = useNavigate();

  return (
    <section className="mb-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div className="lg:col-span-7">
        <span
          className="text-[11px] font-bold tracking-[0.05em] uppercase mb-3 block"
          style={{ color: 'var(--color-primary)' }}
        >
          Analysis Complete
        </span>
        <h2 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight" style={{ color: 'var(--color-on-surface)' }}>
          Strategic Capability<br />Match Report
        </h2>
        <p className="text-lg leading-relaxed max-w-xl" style={{ color: 'var(--color-on-surface-variant)' }}>
          {summary}
        </p>
        <div className="mt-8 flex gap-4">
          <button
            className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary-container)', color: 'var(--color-on-primary)' }}
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export Analysis
          </button>
          <button
            className="px-6 py-3 font-semibold rounded-lg border transition-all hover:bg-[var(--color-surface-container-low)]"
            style={{ borderColor: 'var(--color-outline-variant)', color: 'var(--color-primary)' }}
            onClick={() => navigate('/tasks')}
          >
            View Roadmap
          </button>
        </div>
      </div>
      <div className="lg:col-span-5 flex justify-center">
        <div
          className="rounded-full flex items-center justify-center p-4"
          style={{ background: 'var(--color-surface-container-low)' }}
        >
          <GapScoreGauge score={matchScore} />
        </div>
      </div>
    </section>
  );
}

// ─── Strengths Card ────────────────────────────────────────────────────────────

function StrengthsCard({ items }: { items: string[] }) {
  return (
    <div
      className="rounded-xl p-8 flex flex-col transition-all hover:bg-[var(--color-surface-container)]"
      style={{
        background: 'var(--color-surface-container-low)',
        borderColor: 'transparent',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--color-primary)' }}>verified_user</span>
        <Badge variant="success">High Strength</Badge>
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-on-surface)' }}>Core Proficiencies</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
        Foundational skills that exceed market benchmarks.
      </p>
      <ul className="space-y-4 flex-1">
        {items.map(item => (
          <li key={item} className="flex items-start gap-3">
            <span
              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Key Gaps Card ─────────────────────────────────────────────────────────────

function KeyGapsCard({ gaps }: { gaps: { title: string; description: string; severity: string }[] }) {
  return (
    <div
      className="rounded-xl p-8 flex flex-col transition-all hover:bg-[var(--color-surface-container)]"
      style={{ background: 'var(--color-surface-container-low)', borderColor: 'transparent' }}
    >
      <div className="flex items-center justify-between mb-6">
        <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--color-tertiary)' }}>signal_cellular_alt_2_bar</span>
        <Badge variant="warning">Growth Gap</Badge>
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-on-surface)' }}>Key Gaps</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
        Critical competencies requiring immediate attention.
      </p>
      <div className="flex-1 space-y-4">
        {gaps.map((gap) => {
          const level = gap.severity === 'high' ? 2 : gap.severity === 'medium' ? 3 : 4;
          return (
            <div
              key={gap.title}
              className="p-4 rounded-lg"
              style={{ background: 'var(--color-surface-container-highest)' }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold" style={{ color: 'var(--color-on-surface)' }}>{gap.title}</span>
                <span className="text-[10px] font-black" style={{ color: 'var(--color-tertiary)' }}>
                  LVL {level}/5
                </span>
              </div>
              <ProgressBar value={level} max={5} size="sm" color="warning" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Risks Card ───────────────────────────────────────────────────────────────

function RisksCard({ risks }: { risks: { title: string; description: string }[] }) {
  return (
    <div
      className="rounded-xl p-8 flex flex-col transition-all hover:bg-[var(--color-surface-container)]"
      style={{ background: 'var(--color-surface-container-low)', borderColor: 'transparent' }}
    >
      <div className="flex items-center justify-between mb-6">
        <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--color-error)' }}>report_problem</span>
        <Badge variant="error">Risk Factor</Badge>
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-on-surface)' }}>Market Risks</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
        External factors impacting your placement rate.
      </p>
      <div className="flex-1 space-y-4">
        {risks.map((risk, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div
              className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-error-container)' }}
            >
              <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-error)' }}>
                {i === 0 ? 'trending_down' : 'history'}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-on-surface)' }}>{risk.title}</p>
              <p className="text-[10px]" style={{ color: 'var(--color-on-surface-variant)' }}>{risk.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Competency Breakdown ─────────────────────────────────────────────────────

function CompetencyBreakdownSection({
  matchScore,
}: {
  roleTitle: string;
  matchScore: number;
}) {
  const competencies = [
    { name: 'Technical Strategy', matched: Math.min(matchScore + 5, 100), gap: Math.max(100 - matchScore - 5, 0) },
    { name: 'Financial Planning', matched: Math.max(matchScore - 20, 0), gap: Math.min(100 - matchScore + 20, 100) },
    { name: 'Product Engineering', matched: Math.min(matchScore + 10, 100), gap: Math.max(100 - matchScore - 10, 0) },
    { name: 'Stakeholder Management', matched: Math.max(matchScore - 10, 0), gap: Math.min(100 - matchScore + 10, 100) },
  ];

  return (
    <section
      className="mt-16 rounded-2xl p-10 shadow-sm"
      style={{
        background: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
      }}
    >
      <div className="flex justify-between items-end mb-10">
        <div>
          <h4 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-on-surface)' }}>
            Competency Breakdown
          </h4>
          <p className="text-sm mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
            Weighted analysis of technical vs. soft skill alignment.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-primary)' }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>Matched</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-tertiary)' }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>Gap</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {competencies.map(comp => (
          <div key={comp.name} className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-3 text-sm font-semibold" style={{ color: 'var(--color-on-surface)' }}>
              {comp.name}
            </div>
            <div className="col-span-9 flex items-center gap-4">
              <div
                className="flex-1 h-3 rounded-full overflow-hidden flex"
                style={{ background: 'var(--color-surface-container-highest)' }}
              >
                <div
                  className="h-full"
                  style={{ width: `${comp.matched}%`, background: 'var(--color-primary)' }}
                />
                <div
                  className="h-full"
                  style={{ width: `${comp.gap}%`, background: 'var(--color-tertiary)' }}
                />
              </div>
              <span className="text-xs font-bold w-8 text-right" style={{ color: 'var(--color-on-surface)' }}>
                {comp.matched}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalysisResultPage() {
  const { id } = useParams<{ id: string }>();
  const sessionId = id ? parseInt(id, 10) : 0;

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId),
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading analysis...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !session) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <span className="material-symbols-outlined text-5xl mb-4" style={{ color: 'var(--color-error)' }}>error</span>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-on-surface)' }}>Analysis not found</h2>
          <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            This analysis session could not be loaded.
          </p>
        </div>
      </PageContainer>
    );
  }

  const gaps = session.gaps.slice(0, 3).map(g => ({
    title: g.title,
    description: g.description,
    severity: g.severity,
  }));

  const risks = session.risks.slice(0, 2).map((r, i) => ({
    title: r,
    description: i === 0 ? '42% increase in competitive applicants' : 'PMP Renewal due in 14 days',
  }));

  return (
    <PageContainer>
      <HeroSection
        roleTitle={session.target_role}
        company={session.company}
        matchScore={session.match_score}
        summary={session.summary}
      />

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StrengthsCard items={session.strengths} />
        <KeyGapsCard gaps={gaps} />
        <RisksCard risks={risks} />
      </div>

      <CompetencyBreakdownSection
        roleTitle={session.target_role}
        matchScore={session.match_score}
      />
    </PageContainer>
  );
}
