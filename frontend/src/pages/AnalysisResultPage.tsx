import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Notifications,
  Settings,
  VerifiedUser,
  SignalCellularAlt2Bar,
  ReportProblem,
  TrendingDown,
  History,
  DownloadOutlined as Download,
  MapOutlined as Map,
} from '@mui/icons-material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import InterpreterModeRoundedIcon from '@mui/icons-material/InterpreterModeRounded';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useToastStore } from '../store';
import { getSession, exportReport } from '../services/analysis';

/* ─────────────────────────────────────────────
   Gap Gauge (SVG Ring)
───────────────────────────────────────────── */
function GapGauge({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-64 h-64">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--color-surface-container-highest)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="transparent"
          stroke="var(--color-primary)" strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black tracking-tighter" style={{ color: 'var(--color-text-on-surface)' }}>{score}%</span>
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-on-surface-variant)' }}>Match Score</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Competency Bar
───────────────────────────────────────────── */
function CompetencyBar({ label, matched, gap, value }: { label: string; matched: number; gap: number; value: number }) {
  return (
    <div className="grid grid-cols-12 gap-6 items-center">
      <div className="col-span-3 text-sm font-semibold" style={{ color: 'var(--color-text-on-surface)' }}>{label}</div>
      <div className="col-span-9 flex items-center gap-4">
        <div className="flex-1 h-3 rounded-full overflow-hidden flex" style={{ background: 'var(--color-surface-container-highest)' }}>
          <div className="h-full" style={{ width: `${matched}%`, background: 'var(--color-primary)' }} />
          <div className="h-full" style={{ width: `${gap}%`, background: 'var(--color-tertiary)' }} />
        </div>
        <span className="text-xs font-bold w-8 text-right" style={{ color: 'var(--color-text-on-surface)' }}>{value}%</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Nav Item
───────────────────────────────────────────── */
function NavItem({ icon: Icon, label, active }: { icon: React.ElementType; label: string; active?: boolean }) {
  const color = active ? 'var(--color-primary)' : 'var(--color-text-on-surface-variant)';
  const bg = active ? 'var(--color-bg-surface)' : 'transparent';
  return (
    <a
      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
      style={{
        color,
        background: bg,
        fontWeight: active ? 500 : 400,
        fontSize: '13px',
        letterSpacing: '-0.01em',
        margin: active ? '0 8px' : '0',
      }}
    >
      <Icon sx={{ fontSize: 18 }} />
      <span>{label}</span>
    </a>
  );
}

/* ─────────────────────────────────────────────
   Section Card
───────────────────────────────────────────── */
function SectionCard({ icon: Icon, iconColor, badgeVariant, badgeLabel, title, description, children }: {
  icon: React.ElementType; iconColor: string; badgeVariant: 'success' | 'warning' | 'error'; badgeLabel: string;
  title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div
      className="p-8 rounded-xl flex flex-col transition-all hover:opacity-90"
      style={{ background: 'var(--color-surface-container-low)', border: '1px solid transparent' }}
    >
      <div className="flex items-center justify-between mb-6">
        <Icon sx={{ fontSize: 28, color: iconColor }} />
        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-on-surface)' }}>{title}</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-on-surface-variant)' }}>{description}</p>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function AnalysisResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const sessionId = Number(id);
  const [showResumeDraft, setShowResumeDraft] = useState(false);

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId),
    enabled: !!sessionId,
  });

  const handleExport = async (format: 'docx' | 'pdf') => {
    try {
      const blob = await exportReport(sessionId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GapPilot-分析报告-${session?.target_role || sessionId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      addToast({ type: 'success', message: `已导出 ${format.toUpperCase()}` });
    } catch {
      addToast({ type: 'error', message: '导出失败，请重试' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        {/* Sidebar skeleton */}
        <div className="w-64 h-screen" style={{ background: 'var(--color-surface-container-highest)' }} />
        <div className="flex-1 p-10">
          <div className="max-w-6xl mx-auto space-y-6">
            <SkeletonCard /><SkeletonCard />
            <div className="grid grid-cols-3 gap-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <PageContainer>
        <EmptyState
          icon="❌" title="无法加载分析结果"
          description="请检查网络或稍后重试"
          action={{ label: '返回', onClick: () => navigate('/history') }}
        />
      </PageContainer>
    );
  }

  const score = session.match_score ?? 0;
  const competencyData = [
    { label: 'Technical Strategy', matched: 90, gap: 10, value: 90 },
    { label: 'Financial Planning', matched: 65, gap: 35, value: 65 },
    { label: 'Product Engineering', matched: 95, gap: 5, value: 95 },
    { label: 'Stakeholder Management', matched: 75, gap: 25, value: 75 },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* ── Sidebar ── */}
      <aside
        className="fixed left-0 top-0 bottom-0 w-64 flex flex-col py-6 z-50 overflow-y-auto"
        style={{ background: 'var(--color-surface-container-highest)' }}
      >
        <div className="px-6 mb-10">
          <h1 className="text-xl font-black tracking-tighter" style={{ color: 'var(--color-text-on-surface)' }}>Precision Curator</h1>
          <p className="text-[10px] font-medium tracking-widest uppercase mt-1" style={{ color: 'var(--color-text-on-surface-variant)' }}>Elite Analysis</p>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon={DashboardRoundedIcon} label="Dashboard" />
          <NavItem icon={AnalyticsRoundedIcon} label="Analysis" active />
          <NavItem icon={AssignmentRoundedIcon} label="Applications" />
          <NavItem icon={SchoolOutlined} label="Learning" />
          <NavItem icon={InterpreterModeRoundedIcon} label="Interviews" />
        </nav>

        {/* User card */}
        <div className="mt-auto px-4">
          <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--color-surface-container-low)' }}>
            <div className="w-10 h-10 rounded-full" style={{ background: 'var(--color-primary-fixed)' }} />
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--color-text-on-surface)' }}>{session.target_role.split(' ')[0]} User</p>
              <p className="text-[10px]" style={{ color: 'var(--color-text-on-surface-variant)' }}>GapPilot Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Top Bar ── */}
      <header
        className="fixed top-0 right-0 h-16 flex justify-between items-center px-8 z-40"
        style={{
          left: '256px',
          background: 'rgba(252,248,255,0.8)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(199,196,216,0.2)',
          width: 'calc(100% - 256px)',
        }}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <Search sx={{ fontSize: 16, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-on-surface-variant)' }} />
            <input
              placeholder="Search curated data..."
              className="w-full rounded-full py-2 pl-10 pr-4 text-sm border-none"
              style={{ background: 'var(--color-surface-container-low)', color: 'var(--color-text-on-surface)' }}
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative" style={{ color: 'var(--color-text-on-surface-variant)' }}>
            <Notifications sx={{ fontSize: 18 }} />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full" style={{ background: 'var(--color-error)', border: '2px solid var(--color-bg)' }} />
          </button>
          <button style={{ color: 'var(--color-text-on-surface-variant)' }}>
            <Settings sx={{ fontSize: 18 }} />
          </button>
          <div className="h-8 w-px" style={{ background: 'var(--color-outline-variant)', opacity: 0.3 }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-on-surface)' }}>Precision Curator</span>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="ml-64 mt-16 p-10 min-h-screen">
        <div className="max-w-6xl mx-auto">

          {/* Hero: Gap Gauge */}
          <section className="mb-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span
                className="text-[11px] font-bold tracking-[0.05em] uppercase mb-3 block"
                style={{ color: 'var(--color-primary-container)' }}
              >
                Analysis Complete
              </span>
              <h2 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight" style={{ color: 'var(--color-text-on-surface)' }}>
                Strategic Capability<br />Match Report
              </h2>
              <p className="text-lg leading-relaxed max-w-xl" style={{ color: 'var(--color-text-on-surface-variant)' }}>
                Our AI engine has cross-referenced your current profile against the <span className="font-semibold" style={{ color: 'var(--color-text-on-surface)' }}>{session.target_role}</span> role requirements. {session.summary}
              </p>
              <div className="mt-8 flex gap-4">
                <Button onClick={() => handleExport('docx')} size="lg">
                  <Download sx={{ fontSize: 16 }} />
                  Export Analysis
                </Button>
                <Button variant="secondary" size="lg">
                  <Map sx={{ fontSize: 16 }} />
                  View Roadmap
                </Button>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <GapGauge score={score} />
            </div>
          </section>

          {/* Bento: Strengths / Gaps / Risks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Core Proficiencies */}
            <SectionCard
              icon={VerifiedUser} iconColor="var(--color-primary-container)"
              badgeVariant="success" badgeLabel="High Strength"
              title="Core Proficiencies"
              description="Foundational skills that exceed market benchmarks."
            >
              <ul className="space-y-4">
                {session.strengths.slice(0, 4).map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--color-primary-container)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-on-surface)' }}>{s}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>

            {/* Key Gaps */}
            <SectionCard
              icon={SignalCellularAlt2Bar} iconColor="var(--color-tertiary)"
              badgeVariant="warning" badgeLabel="Growth Gap"
              title="Key Gaps"
              description="Critical competencies requiring immediate attention."
            >
              <div className="space-y-4">
                {session.gaps.slice(0, 2).map((gap) => (
                  <div key={gap.id} className="p-4 rounded-lg" style={{ background: 'var(--color-surface-container-highest)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold" style={{ color: 'var(--color-text-on-surface)' }}>{gap.title}</span>
                      <span className="text-[10px] font-black" style={{ color: 'var(--color-tertiary)' }}>
                        LVL {Math.round((gap.severity === 'high' ? 2 : gap.severity === 'medium' ? 3 : 4))}/5
                      </span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.5)' }}>
                      <div className="h-full rounded-full" style={{ width: gap.severity === 'high' ? '40%' : gap.severity === 'medium' ? '60%' : '80%', background: 'var(--color-tertiary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Market Risks */}
            <SectionCard
              icon={ReportProblem} iconColor="var(--color-error)"
              badgeVariant="error" badgeLabel="Risk Factor"
              title="Market Risks"
              description="External factors impacting your placement rate."
            >
              <div className="space-y-4">
                {session.risks.slice(0, 2).map((risk, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-error-subtle)' }}>
                      {i === 0 ? <TrendingDown sx={{ fontSize: 20, color: 'var(--color-error)' }} /> : <History sx={{ fontSize: 20, color: 'var(--color-error)' }} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--color-text-on-surface)' }}>{risk}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Competency Breakdown */}
          <section
            className="rounded-2xl p-10 shadow-sm"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid rgba(199,196,216,0.1)' }}
          >
            <div className="flex justify-between items-end mb-10">
              <div>
                <h4 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-on-surface)' }}>Competency Breakdown</h4>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-on-surface-variant)' }}>Weighted analysis of technical vs. soft skill alignment.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-primary)' }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-on-surface-variant)' }}>Matched</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-tertiary)' }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-on-surface-variant)' }}>Gap</span>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              {competencyData.map((row, i) => (
                <CompetencyBar key={i} {...row} />
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="mt-8 flex gap-3 flex-wrap">
            <Button variant="secondary" onClick={() => navigate('/tasks')}>
              <SchoolOutlined sx={{ fontSize: 14 }} /> 学习任务
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/interview?analysis=${sessionId}`)}>
              <InterpreterModeRoundedIcon sx={{ fontSize: 14 }} /> 面试题
            </Button>
            <Button variant="secondary" onClick={() => setShowResumeDraft(true)}>
              查看简历草稿
            </Button>
          </div>
        </div>
      </main>

      {/* Resume Draft Modal */}
      <Modal isOpen={showResumeDraft} onClose={() => setShowResumeDraft(false)} title="岗位定制简历草稿" size="lg">
        <pre className="whitespace-pre-wrap text-sm font-mono overflow-auto max-h-96 p-4 rounded-lg" style={{ background: 'var(--color-surface-container-low)', color: 'var(--color-text-secondary)' }}>
          {session.resume_draft || '暂无简历草稿'}
        </pre>
        <ModalFooter>
          <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(session.resume_draft || ''); addToast({ type: 'success', message: '已复制' }); }}>
            复制
          </Button>
          <Button onClick={() => setShowResumeDraft(false)}>关闭</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
