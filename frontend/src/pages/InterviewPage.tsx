import { useState } from 'react';
import {
  Architecture,
  Token,
  CloudDone,
  Terminal,
  Videocam,
  Bolt,
  Forum,
  HelpCenter,
  AutoAwesome,
  Refresh,
  ChevronRight,
} from '@mui/icons-material';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

// ─── Mock Data ───────────────────────────────────────────────────────────────

interface AppCard {
  id: string;
  role: string;
  company: string;
  location: string;
  status: 'interviewing' | 'applied' | 'offer' | 'rejected';
  nextStep?: string;
  date?: string;
  lastUpdate?: string;
}

const mockApplications: AppCard[] = [
  {
    id: '1',
    role: 'Senior Product Designer',
    company: 'Quantum Dynamics',
    location: 'Berlin',
    status: 'interviewing',
    nextStep: 'Technical Deep-dive',
    date: 'May 24',
  },
  {
    id: '2',
    role: 'Principal UX Lead',
    company: 'Monolith Systems',
    location: 'Remote',
    status: 'applied',
    lastUpdate: '2h ago',
  },
  {
    id: '3',
    role: 'Design Director',
    company: 'Nebula Cloud',
    location: 'London',
    status: 'offer',
    nextStep: 'Expires in 3 days',
  },
  {
    id: '4',
    role: 'Fullstack Architect',
    company: 'Linear Inc',
    location: 'San Francisco',
    status: 'rejected',
  },
];

interface ResumeAnchor {
  number: string;
  title: string;
  description: string;
}

const mockResumeAnchors: ResumeAnchor[] = [
  {
    number: '01',
    title: 'Scaling Monolith\'s Design Ops',
    description: 'Relevant to Quantum\'s current "Expansion Phase" mentioned in job post.',
  },
  {
    number: '02',
    title: 'The "Hologram" Project API integration',
    description: 'Strong proof of technical empathy for their engineering-heavy culture.',
  },
];

interface PredictedQuestion {
  id: string;
  type: 'technical' | 'behavioral';
  probability?: string;
  question: string;
  answer: string;
  keywords: string[];
  borderColor: 'primary' | 'secondary';
}

const mockQuestions: PredictedQuestion[] = [
  {
    id: '1',
    type: 'technical',
    probability: '85%',
    question: '"How do you bridge the gap between abstract design concepts and technical feasibility?"',
    answer:
      'Use the STAR method focusing on your work at Nebula Cloud. Mention specific handoff tools and how you participated in "Design QA" sprints to ensure dev fidelity.',
    keywords: ['Technical Debt', 'System Thinking', 'Handoff Ops'],
    borderColor: 'primary',
  },
  {
    id: '2',
    type: 'behavioral',
    question: '"Describe a time when you had to make a design trade-off due to time constraints."',
    answer:
      'Highlight the "Tiered MVP" approach. Explain how you prioritized core user flows while documenting secondary enhancements for Version 1.1.',
    keywords: [],
    borderColor: 'secondary',
  },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<
  AppCard['status'],
  { label: string; variant: 'warning' | 'info' | 'success' | 'error' | 'neutral'; className: string }
> = {
  interviewing: { label: 'INTERVIEWING', variant: 'warning', className: 'bg-[var(--color-tertiary-fixed)] text-[var(--color-on-tertiary-fixed)]' },
  applied: { label: 'APPLIED', variant: 'info', className: 'bg-[var(--color-surface-container-high)] text-[var(--color-text-on-surface-variant)]' },
  offer: { label: 'OFFER', variant: 'success', className: 'bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]' },
  rejected: { label: 'REJECTED', variant: 'error', className: 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' },
};

// ─── Icon Map ─────────────────────────────────────────────────────────────────

function AppIcon({ status }: { status: AppCard['status'] }) {
  const iconClass = 'text-[var(--color-text-on-surface-variant)]';
  switch (status) {
    case 'interviewing': return <Architecture className={iconClass} fontSize="small" />;
    case 'applied': return <Token className={iconClass} fontSize="small" />;
    case 'offer': return <CloudDone className={iconClass} fontSize="small" />;
    case 'rejected': return <Terminal className={iconClass} fontSize="small" />;
  }
}

// ─── Application Card ─────────────────────────────────────────────────────────

function ApplicationCard({
  app,
  isSelected,
  onClick,
}: {
  app: AppCard;
  isSelected: boolean;
  onClick: () => void;
}) {
  const cfg = statusConfig[app.status];
  const isRejected = app.status === 'rejected';

  return (
    <Card
      padding={false}
      hoverable={!isSelected}
      onClick={onClick}
      className={`
        p-4 rounded-xl transition-all duration-150
        ${isSelected
          ? 'bg-[var(--color-surface-container-lowest)] border-2 border-[var(--color-primary-container)] shadow-sm'
          : isRejected
          ? 'bg-[var(--color-surface-container)] opacity-60'
          : 'bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)]'}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            ${isSelected
              ? 'bg-[var(--color-primary-fixed-dim)]'
              : 'bg-[var(--color-surface-container-highest)]'}
          `}
        >
          <AppIcon status={app.status} />
        </div>
        <span
          className={`
            text-[10px] font-bold px-2 py-1 rounded
            ${cfg.className}
          `}
        >
          {cfg.label}
        </span>
      </div>

      <h3
        className={`
          font-bold text-[var(--color-text-on-surface)]
          group-hover:text-[var(--color-primary)] transition-colors
          ${isRejected ? 'opacity-60' : ''}
        `}
      >
        {app.role}
      </h3>
      <p className={`text-xs mb-4 ${isRejected ? 'opacity-60' : 'text-[var(--color-text-on-surface-variant)]'}`}>
        {app.company} · {app.location}
      </p>

      <div className="flex justify-between items-center text-[10px] font-bold text-[var(--color-text-on-surface-variant)]">
        <span>
          {app.nextStep ?? app.lastUpdate ?? ''}
        </span>
        {!isRejected && app.status !== 'interviewing' && (
          <ChevronRight className="text-sm" />
        )}
        {app.status === 'interviewing' && app.date && (
          <span>{app.date}</span>
        )}
      </div>
    </Card>
  );
}

// ─── Confidence Score Card ────────────────────────────────────────────────────

function ConfidenceCard({ score }: { score: number }) {
  return (
    <div className="bg-[var(--color-surface-container)] rounded-2xl p-8 relative overflow-hidden">
      <div className="relative z-10">
        <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-on-surface-variant)] uppercase">
          Confidence Score
        </span>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-6xl font-black text-[var(--color-primary)]">{score}</span>
          <span className="text-xl font-bold text-[var(--color-text-on-surface-variant)]">/ 100</span>
        </div>
        <p className="mt-4 text-sm text-[var(--color-text-on-surface-variant)] leading-relaxed">
          Your profile matches 94% of the technical requirements. Focus on articulating your "Leadership under Constraint" examples.
        </p>
      </div>
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[var(--color-primary-fixed-dim)] rounded-full blur-[60px] opacity-40" />
    </div>
  );
}

// ─── Resume Anchors ────────────────────────────────────────────────────────────

function ResumeAnchors({ anchors }: { anchors: ResumeAnchor[] }) {
  return (
    <div className="bg-[var(--color-surface-container-high)] rounded-2xl p-8">
      <div className="flex items-center gap-2 mb-6">
        <Bolt className="text-[var(--color-primary)]" fontSize="small" />
        <h3 className="text-lg font-bold text-[var(--color-text-on-surface)]">Key Resume Anchors</h3>
      </div>
      <ul className="space-y-4">
        {anchors.map((anchor) => (
          <li key={anchor.number} className="flex gap-4">
            <span className="text-xs font-black text-[var(--color-primary-container)] bg-white/50 w-6 h-6 rounded flex items-center justify-center flex-shrink-0">
              {anchor.number}
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--color-text-on-surface)]">{anchor.title}</p>
              <p className="text-xs text-[var(--color-text-on-surface-variant)]">{anchor.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({ q }: { q: PredictedQuestion }) {
  const isPrimary = q.borderColor === 'primary';

  return (
    <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/10 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-surface-container)] rounded-xl flex items-center justify-center">
          {q.type === 'technical' ? (
            <Forum className="text-[var(--color-text-on-surface-variant)]" />
          ) : (
            <HelpCenter className="text-[var(--color-text-on-surface-variant)]" />
          )}
        </div>
        <div className="space-y-4 w-full">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {q.probability ? (
                <span className="text-[10px] font-bold text-[var(--color-tertiary-container)] uppercase tracking-wider">
                  High Probability ({q.probability})
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[var(--color-text-on-surface-variant)] uppercase tracking-wider">
                  Behavioral
                </span>
              )}
            </div>
            <h4 className="text-lg font-bold text-[var(--color-text-on-surface)]">{q.question}</h4>
          </div>
          <div
            className={`
              bg-[var(--color-surface-container-low)] rounded-xl p-5
              border-l-4
              ${isPrimary ? 'border-[var(--color-primary)]' : 'border-[var(--color-secondary)]'}
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <AutoAwesome
                className={isPrimary ? 'text-[var(--color-primary)]' : 'text-[var(--color-secondary)]'}
                fontSize="small"
              />
              <span
                className={`text-xs font-bold ${
                  isPrimary ? 'text-[var(--color-primary)]' : 'text-[var(--color-secondary)]'
                }`}
              >
                AI STRATEGY
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-on-surface-variant)] leading-relaxed">{q.answer}</p>
            {q.keywords.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {q.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[10px] bg-white px-2 py-1 rounded border border-[var(--color-outline-variant)]/20 font-medium text-[var(--color-text-secondary)]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InterviewPage() {
  const [selectedId, setSelectedId] = useState<string>('1');

  const selectedApp = mockApplications.find((a) => a.id === selectedId) ?? mockApplications[0];
  const activeCount = mockApplications.filter((a) => a.status !== 'rejected').length;

  return (
    <PageContainer>
      <PageHeader
        title="面试准备"
        description={`${activeCount} 个进行中`}
        action={
          <Button size="sm">
            <Refresh fontSize="small" />
            刷新洞察
          </Button>
        }
      />

      {/* Two-panel layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Application Cards */}
        <div className="w-full lg:w-[340px] flex-shrink-0 space-y-4">
          <div className="space-y-3">
            {mockApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                isSelected={app.id === selectedId}
                onClick={() => setSelectedId(app.id)}
              />
            ))}
          </div>
        </div>

        {/* Right: Interview Details */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="primary">Elite Interview Prep</Badge>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                <span className="text-[11px] text-[var(--color-text-on-surface-variant)]">May 24, 14:00 CET</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-on-surface)]">
                {selectedApp.role}
                <span className="text-[var(--color-text-on-surface-variant)] opacity-40 ml-2">
                  at {selectedApp.company}
                </span>
              </h2>
            </div>
            <Button>
              <Videocam fontSize="small" />
              加入会议
            </Button>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Confidence Score */}
            <div className="lg:col-span-5">
              <ConfidenceCard score={88} />
            </div>

            {/* Resume Anchors */}
            <div className="lg:col-span-7">
              <ResumeAnchors anchors={mockResumeAnchors} />
            </div>

            {/* Predicted Questions */}
            <div className="lg:col-span-12 space-y-4">
              <div className="flex justify-between items-end">
                <h3 className="text-xl font-bold tracking-tight text-[var(--color-text-on-surface)]">
                  Predicted Questions
                </h3>
              </div>
              <div className="space-y-4">
                {mockQuestions.map((q) => (
                  <QuestionCard key={q.id} q={q} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
