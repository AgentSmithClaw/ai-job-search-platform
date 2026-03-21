import {
  VerifiedUser,
  SignalCellularAlt2Bar,
  ReportProblem,
  TrendingDown,
  History,
  Download,
  Search,
  Notifications,
  Settings,
  Dashboard,
  Analytics,
  Assignment,
  School,
  InterpreterMode,
} from '@mui/icons-material';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/Progress';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RESULT = {
  roleTitle: 'Lead Systems Architect',
  company: 'Precision Curator',
  matchScore: 85,
  summary:
    'Our AI engine has cross-referenced your current profile against the Lead Systems Architect role requirements. You demonstrate high technical synergy with identified vertical growth paths.',
  strengths: [
    'Distributed Systems Architecture',
    'Cloud Infrastructure Optimization',
    'Cross-functional Team Leadership',
  ],
  gaps: [
    { name: 'Quantum Computing R&D', level: 2, maxLevel: 5 },
    { name: 'Budgetary Strategic Oversight', level: 3, maxLevel: 5 },
  ],
  risks: [
    {
      icon: TrendingDown,
      title: 'Niche Oversaturation',
      description: '42% increase in competitive applicants',
    },
    {
      icon: History,
      title: 'Certification Lag',
      description: 'PMP Renewal due in 14 days',
    },
  ],
  competencies: [
    { name: 'Technical Strategy', matched: 90, gap: 10 },
    { name: 'Financial Planning', matched: 65, gap: 35 },
    { name: 'Product Engineering', matched: 95, gap: 5 },
    { name: 'Stakeholder Management', matched: 75, gap: 25 },
  ],
};

const NAV_ITEMS = [
  { icon: Dashboard, label: 'Dashboard' },
  { icon: Analytics, label: 'Analysis', active: true },
  { icon: Assignment, label: 'Applications' },
  { icon: School, label: 'Learning' },
  { icon: InterpreterMode, label: 'Interviews' },
];

// ─── Gap Score Gauge ──────────────────────────────────────────────────────────

function GapScoreGauge({ score }: { score: number }) {
  const size = 256;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-primary)' : 'var(--color-warning)';

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
        <span className="text-5xl font-black tracking-tighter text-[var(--color-text)]">
          {score}%
        </span>
        <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-on-surface-variant)] uppercase">
          Match Score
        </span>
      </div>
    </div>
  );
}

// ─── Section: Hero ───────────────────────────────────────────────────────────

function HeroSection({ data }: { data: typeof MOCK_RESULT }) {
  return (
    <section className="mb-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div className="lg:col-span-7">
        <span className="text-[11px] font-bold tracking-[0.05em] text-[var(--color-primary)] uppercase mb-3 block">
          Analysis Complete
        </span>
        <h2 className="text-5xl font-extrabold tracking-tight text-[var(--color-text)] mb-6 leading-tight">
          Strategic Capability
          <br />
          Match Report
        </h2>
        <p className="text-lg text-[var(--color-text-on-surface-variant)] leading-relaxed max-w-xl">
          {data.summary}
        </p>
        <div className="mt-8 flex gap-4">
          <Button variant="primary" size="lg">
            <Download fontSize="small" />
            Export Analysis
          </Button>
          <Button variant="secondary" size="lg">
            View Roadmap
          </Button>
        </div>
      </div>
      <div className="lg:col-span-5 flex justify-center">
        <div
          className="rounded-full flex items-center justify-center p-4"
          style={{ background: 'var(--color-surface-container-low)' }}
        >
          <GapScoreGauge score={data.matchScore} />
        </div>
      </div>
    </section>
  );
}

// ─── Section: Bento Grid ──────────────────────────────────────────────────────

function StrengthsCard({ items }: { items: string[] }) {
  return (
    <div
      className="bg-[var(--color-surface-container-low)] p-8 rounded-xl flex flex-col transition-all hover:bg-[var(--color-surface-container)] border border-transparent hover:border-[var(--color-outline-variant)]/10"
      style={{ borderColor: 'transparent' }}
    >
      <div className="flex items-center justify-between mb-6">
        <VerifiedUser sx={{ fontSize: 36, color: 'var(--color-primary)' }} />
        <Badge variant="success">High Strength</Badge>
      </div>
      <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Core Proficiencies</h3>
      <p className="text-sm text-[var(--color-text-on-surface-variant)] mb-6">
        Foundational skills that exceed market benchmarks.
      </p>
      <ul className="space-y-4 flex-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span
              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <span className="text-sm font-medium text-[var(--color-text)]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KeyGapsCard({ gaps }: { gaps: { name: string; level: number; maxLevel: number }[] }) {
  return (
    <div
      className="bg-[var(--color-surface-container-low)] p-8 rounded-xl flex flex-col transition-all hover:bg-[var(--color-surface-container)]"
      style={{ borderColor: 'transparent' }}
    >
      <div className="flex items-center justify-between mb-6">
        <SignalCellularAlt2Bar sx={{ fontSize: 36, color: 'var(--color-tertiary)' }} />
        <Badge variant="warning">Growth Gap</Badge>
      </div>
      <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Key Gaps</h3>
      <p className="text-sm text-[var(--color-text-on-surface-variant)] mb-6">
        Critical competencies requiring immediate attention.
      </p>
      <div className="flex-1 space-y-4">
        {gaps.map((gap) => (
          <div
            key={gap.name}
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-surface-container-highest)' }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-[var(--color-text)]">{gap.name}</span>
              <span className="text-[10px] font-black" style={{ color: 'var(--color-tertiary)' }}>
                LVL {gap.level}/{gap.maxLevel}
              </span>
            </div>
            <ProgressBar
              value={gap.level}
              max={gap.maxLevel}
              size="sm"
              color="warning"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function RisksCard({
  risks,
}: {
  risks: { icon: React.ElementType; title: string; description: string }[];
}) {
  return (
    <div
      className="bg-[var(--color-surface-container-low)] p-8 rounded-xl flex flex-col transition-all hover:bg-[var(--color-surface-container)]"
      style={{ borderColor: 'transparent' }}
    >
      <div className="flex items-center justify-between mb-6">
        <ReportProblem sx={{ fontSize: 36, color: 'var(--color-error)' }} />
        <Badge variant="error">Risk Factor</Badge>
      </div>
      <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Market Risks</h3>
      <p className="text-sm text-[var(--color-text-on-surface-variant)] mb-6">
        External factors impacting your placement rate.
      </p>
      <div className="flex-1 space-y-4">
        {risks.map((risk) => {
          const Icon = risk.icon;
          return (
            <div key={risk.title} className="flex gap-4 items-center">
              <div
                className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--color-error-subtle)' }}
              >
                <Icon sx={{ fontSize: 20, color: 'var(--color-error)' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--color-text)]">{risk.title}</p>
                <p className="text-[10px] text-[var(--color-text-on-surface-variant)]">
                  {risk.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section: Competency Breakdown ──────────────────────────────────────────

function CompetencyBreakdownSection({
  competencies,
}: {
  competencies: { name: string; matched: number; gap: number }[];
}) {
  return (
    <section
      className="mt-16 rounded-2xl p-10 shadow-sm border"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        borderColor: 'var(--color-outline-variant)',
      }}
    >
      <div className="flex justify-between items-end mb-10">
        <div>
          <h4 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
            Competency Breakdown
          </h4>
          <p className="text-sm mt-1 text-[var(--color-text-on-surface-variant)]">
            Weighted analysis of technical vs. soft skill alignment.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-on-surface-variant)]">
              Matched
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: 'var(--color-tertiary)' }}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-on-surface-variant)]">
              Gap
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {competencies.map((comp) => (
          <div key={comp.name} className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-3 text-sm font-semibold text-[var(--color-text)]">
              {comp.name}
            </div>
            <div className="col-span-9 flex items-center gap-4">
              <div
                className="flex-1 h-3 rounded-full overflow-hidden flex"
                style={{ backgroundColor: 'var(--color-surface-container-highest)' }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${comp.matched}%`,
                    backgroundColor: 'var(--color-primary)',
                  }}
                />
                <div
                  className="h-full"
                  style={{
                    width: `${comp.gap}%`,
                    backgroundColor: 'var(--color-tertiary)',
                  }}
                />
              </div>
              <span className="text-xs font-bold w-8 text-right text-[var(--color-text)]">
                {comp.matched}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

function SideNav() {
  return (
    <aside
      className="h-screen w-64 fixed left-0 top-0 overflow-y-auto flex flex-col py-6 z-50"
      style={{ backgroundColor: 'var(--color-surface-container-highest)' }}
    >
      <div className="px-6 mb-10">
        <h1 className="text-xl font-black text-[var(--color-text)] tracking-tighter">
          Precision Curator
        </h1>
        <p className="text-[10px] font-medium text-[var(--color-text-on-surface-variant)] tracking-widest uppercase mt-1">
          Elite Analysis
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href="#"
              className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                item.active
                  ? 'rounded-lg mx-2 text-[var(--color-primary)]'
                  : 'text-[var(--color-text-on-surface-variant)] hover:bg-[var(--color-surface-container)]'
              }`}
              style={
                item.active
                  ? {
                      backgroundColor: 'var(--color-bg-surface)',
                      color: 'var(--color-primary)',
                    }
                  : {}
              }
            >
              <Icon sx={{ fontSize: 20 }} />
              <span className="font-medium text-sm tracking-tight">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-auto px-4">
        <div
          className="p-4 rounded-xl flex items-center gap-3"
          style={{ backgroundColor: 'var(--color-surface-container-low)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: 'var(--color-primary-fixed)', color: 'var(--color-on-primary-fixed-variant)' }}
          >
            AC
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--color-text)]">Alex Chen</p>
            <p className="text-[10px] text-[var(--color-text-on-surface-variant)]">Senior Analyst</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopAppBar() {
  return (
    <header
      className="fixed top-0 right-0 h-16 z-40 flex justify-between items-center px-8"
      style={{
        left: '16rem',
        backgroundColor: 'var(--color-bg-base)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-outline-variant)',
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search
            sx={{ fontSize: 18 }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-on-surface-variant)]"
          />
          <input
            className="w-full rounded-full py-2 pl-10 pr-4 text-sm border-none outline-none transition-all"
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              color: 'var(--color-text)',
            }}
            placeholder="Search curated data..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-[var(--color-text-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
          <Notifications sx={{ fontSize: 20 }} />
          <span
            className="absolute top-0 right-0 w-2 h-2 rounded-full border-2"
            style={{
              backgroundColor: 'var(--color-error)',
              borderColor: 'var(--color-bg-surface)',
            }}
          />
        </button>
        <button className="text-[var(--color-text-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
          <Settings sx={{ fontSize: 20 }} />
        </button>
        <div
          className="h-8 w-px mx-2"
          style={{ backgroundColor: 'var(--color-outline-variant)' }}
        />
        <span className="text-sm font-semibold text-[var(--color-text)]">
          Precision Curator
        </span>
      </div>
    </header>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalysisResultPage() {
  const data = MOCK_RESULT;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <SideNav />
      <TopAppBar />

      <main
        className="ml-64 mt-16 p-10"
        style={{ backgroundColor: 'var(--color-bg-base)' }}
      >
        <div className="max-w-6xl mx-auto">
          <HeroSection data={data} />

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StrengthsCard items={data.strengths} />
            <KeyGapsCard gaps={data.gaps} />
            <RisksCard risks={data.risks} />
          </div>

          <CompetencyBreakdownSection competencies={data.competencies} />
        </div>
      </main>
    </div>
  );
}
