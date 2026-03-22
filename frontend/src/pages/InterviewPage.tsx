import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { generateQuestions } from '../services/analysis';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AppCard {
  id: string;
  role: string;
  company: string;
  location: string;
  status: 'interviewing' | 'applied' | 'offer' | 'rejected';
  nextStep?: string;
  date?: string;
  lastUpdate?: string;
  sessionId?: number;
}

interface Question {
  id: string;
  type: 'technical' | 'behavioral';
  probability?: string;
  question: string;
  answer: string;
  keywords: string[];
  borderColor: 'primary' | 'secondary';
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const mockApplications: AppCard[] = [
  {
    id: '1',
    role: 'Senior Product Designer',
    company: 'Quantum Dynamics',
    location: 'Berlin',
    status: 'interviewing',
    nextStep: 'Technical Deep-dive',
    date: 'May 24',
    sessionId: 1,
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

const mockQuestions: Question[] = [
  {
    id: '1',
    type: 'technical',
    probability: '85%',
    question: '"How do you bridge the gap between abstract design concepts and technical feasibility?"',
    answer: 'Use the STAR method focusing on your work at Nebula Cloud. Mention specific handoff tools and how you participated in "Design QA" sprints to ensure dev fidelity.',
    keywords: ['Technical Debt', 'System Thinking', 'Handoff Ops'],
    borderColor: 'primary',
  },
  {
    id: '2',
    type: 'behavioral',
    question: '"Describe a time when you had to make a design trade-off due to time constraints."',
    answer: 'Highlight the "Tiered MVP" approach. Explain how you prioritized core user flows while documenting secondary enhancements for Version 1.1.',
    keywords: [],
    borderColor: 'secondary',
  },
];

const resumeAnchors = [
  { number: '01', title: 'Scaling Monolith\'s Design Ops', description: 'Relevant to Quantum\'s current "Expansion Phase" mentioned in job post.' },
  { number: '02', title: 'The "Hologram" Project API integration', description: 'Strong proof of technical empathy for their engineering-heavy culture.' },
];

// ─── Status Config ─────────────────────────────────────────────────────────────

const statusConfig: Record<AppCard['status'], { label: string; bgClass: string; textClass: string }> = {
  interviewing: {
    label: 'INTERVIEWING',
    bgClass: '',
    textClass: '',
  },
  applied: {
    label: 'APPLIED',
    bgClass: '',
    textClass: '',
  },
  offer: {
    label: 'OFFER',
    bgClass: '',
    textClass: '',
  },
  rejected: {
    label: 'REJECTED',
    bgClass: '',
    textClass: '',
  },
};

function getStatusStyles(status: AppCard['status']) {
  switch (status) {
    case 'interviewing':
      return {
        bg: 'var(--color-tertiary-fixed)',
        text: 'var(--color-on-tertiary-fixed)',
      };
    case 'applied':
      return {
        bg: 'var(--color-surface-container-high)',
        text: 'var(--color-on-surface-variant)',
      };
    case 'offer':
      return {
        bg: 'var(--color-secondary-container)',
        text: 'var(--color-on-secondary-container)',
      };
    case 'rejected':
      return {
        bg: 'var(--color-error-container)',
        text: 'var(--color-on-error-container)',
      };
  }
}

function getAppIcon(status: AppCard['status']) {
  switch (status) {
    case 'interviewing': return 'architecture';
    case 'applied': return 'token';
    case 'offer': return 'cloud_done';
    case 'rejected': return 'terminal';
  }
}

// ─── Application Card ──────────────────────────────────────────────────────────

function ApplicationCard({
  app,
  isSelected,
  onClick,
}: {
  app: AppCard;
  isSelected: boolean;
  onClick: () => void;
}) {
  const styles = getStatusStyles(app.status);
  const isRejected = app.status === 'rejected';

  return (
    <div
      className={`p-4 rounded-xl transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'border-2 shadow-sm'
          : isRejected
          ? 'opacity-60'
          : 'hover:bg-[var(--color-surface-container-high)]'
      }`}
      style={{
        background: isSelected ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container)',
        borderColor: isSelected ? 'var(--color-primary-container)' : 'transparent',
      }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: isSelected ? 'var(--color-primary-fixed-dim)' : 'var(--color-surface-container-highest)',
          }}
        >
          <span className="material-symbols-outlined text-lg" style={{ color: 'var(--color-on-surface-variant)' }}>
            {getAppIcon(app.status)}
          </span>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-1 rounded"
          style={{ background: styles.bg, color: styles.text }}
        >
          {statusConfig[app.status].label}
        </span>
      </div>

      <h3
        className={`font-bold ${isRejected ? 'opacity-60' : ''}`}
        style={{ color: 'var(--color-on-surface)' }}
      >
        {app.role}
      </h3>
      <p className={`text-xs mb-4 ${isRejected ? 'opacity-60' : ''}`} style={{ color: 'var(--color-on-surface-variant)' }}>
        {app.company} · {app.location}
      </p>

      <div className="flex justify-between items-center text-[10px] font-bold" style={{ color: 'var(--color-on-surface-variant)' }}>
        <span>{app.nextStep ?? app.lastUpdate ?? ''}</span>
        {app.status === 'interviewing' && app.date && <span>{app.date}</span>}
        {!isRejected && app.status !== 'interviewing' && (
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        )}
      </div>
    </div>
  );
}

// ─── Confidence Score Card ────────────────────────────────────────────────────

function ConfidenceCard({ score }: { score: number }) {
  return (
    <div className="rounded-2xl p-8 relative overflow-hidden" style={{ background: 'var(--color-surface-container)' }}>
      <div className="relative z-10">
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>
          Confidence Score
        </span>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-6xl font-black" style={{ color: 'var(--color-primary)' }}>{score}</span>
          <span className="text-xl font-bold" style={{ color: 'var(--color-on-surface-variant)' }}>/ 100</span>
        </div>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--color-on-surface-variant)' }}>
          Your profile matches 94% of the technical requirements. Focus on articulating your "Leadership under Constraint" examples.
        </p>
      </div>
      <div
        className="absolute rounded-full blur-[60px] opacity-40"
        style={{
          right: -32,
          bottom: -32,
          width: 160,
          height: 160,
          background: 'var(--color-primary-fixed-dim)',
        }}
      />
    </div>
  );
}

// ─── Resume Anchors ────────────────────────────────────────────────────────────

function ResumeAnchors({ anchors }: { anchors: typeof resumeAnchors }) {
  return (
    <div className="rounded-2xl p-8" style={{ background: 'var(--color-surface-container-high)' }}>
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>bolt</span>
        <h3 className="text-lg font-bold" style={{ color: 'var(--color-on-surface)' }}>Key Resume Anchors</h3>
      </div>
      <ul className="space-y-4">
        {anchors.map(anchor => (
          <li key={anchor.number} className="flex gap-4">
            <span
              className="text-xs font-black w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.5)', color: 'var(--color-primary-container)' }}
            >
              {anchor.number}
            </span>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-on-surface)' }}>{anchor.title}</p>
              <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>{anchor.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({ q }: { q: Question }) {
  const isPrimary = q.borderColor === 'primary';

  return (
    <div
      className="rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
      style={{
        background: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
      }}
    >
      <div className="flex gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--color-surface-container)' }}
        >
          <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)' }}>
            {q.type === 'technical' ? 'forum' : 'help_center'}
          </span>
        </div>
        <div className="space-y-4 w-full">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {q.probability ? (
                <span
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--color-tertiary-container)' }}
                >
                  High Probability ({q.probability})
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Behavioral
                </span>
              )}
            </div>
            <h4 className="text-lg font-bold" style={{ color: 'var(--color-on-surface)' }}>{q.question}</h4>
          </div>
          <div
            className="rounded-xl p-5 border-l-4"
            style={{
              background: 'var(--color-surface-container-low)',
              borderColor: isPrimary ? 'var(--color-primary)' : 'var(--color-secondary)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="material-symbols-outlined text-sm"
                style={{ color: isPrimary ? 'var(--color-primary)' : 'var(--color-secondary)' }}
              >
                auto_awesome
              </span>
              <span
                className="text-xs font-bold"
                style={{ color: isPrimary ? 'var(--color-primary)' : 'var(--color-secondary)' }}
              >
                AI STRATEGY
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-on-surface-variant)' }}>{q.answer}</p>
            {q.keywords.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {q.keywords.map(kw => (
                  <span
                    key={kw}
                    className="text-[10px] px-2 py-1 rounded border font-medium"
                    style={{
                      background: 'white',
                      borderColor: 'var(--color-outline-variant)',
                      color: 'var(--color-text-secondary)',
                    }}
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
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>('1');

  const selectedApp = mockApplications.find(a => a.id === selectedId) ?? mockApplications[0];
  const activeCount = mockApplications.filter(a => a.status !== 'rejected').length;

  // Fetch questions if we have a session ID
  const { data: questionsData } = useQuery({
    queryKey: ['questions', selectedApp.sessionId],
    queryFn: () => generateQuestions(selectedApp.sessionId!),
    enabled: !!selectedApp.sessionId,
  });

  const questions: Question[] = questionsData?.questions
    ? questionsData.questions.map((q, i) => ({
        id: String(i),
        type: 'technical' as const,
        question: q,
        answer: 'AI-generated answer will appear here based on your resume and the job requirements.',
        keywords: [],
        borderColor: 'primary' as const,
      }))
    : mockQuestions;

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="primary">Elite Interview Prep</Badge>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
            <span className="text-[11px]" style={{ color: 'var(--color-on-surface-variant)' }}>
              {activeCount} active · May 24, 14:00 CET
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-on-surface)' }}>
            {selectedApp.role}
            <span className="opacity-40 ml-2" style={{ color: 'var(--color-on-surface-variant)' }}>
              at {selectedApp.company}
            </span>
          </h2>
        </div>
        <Button onClick={() => navigate('/applications')}>
          <span className="material-symbols-outlined text-sm">videocam</span>
          Join Session
        </Button>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Application Cards */}
        <div className="w-full lg:w-[340px] flex-shrink-0 space-y-4">
          <div>
            <span
              className="text-[10px] font-bold tracking-[0.05em] uppercase mb-2 block"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              Tracked Activity
            </span>
            <h3 className="text-2xl font-bold tracking-tight mb-4" style={{ color: 'var(--color-on-surface)' }}>
              Active Roles
            </h3>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-on-primary-fixed-variant)' }}
            >
              {activeCount} Active
            </span>
          </div>
          <div className="space-y-3">
            {mockApplications.map(app => (
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
          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Confidence Score */}
            <div className="lg:col-span-5">
              <ConfidenceCard score={88} />
            </div>

            {/* Resume Anchors */}
            <div className="lg:col-span-7">
              <ResumeAnchors anchors={resumeAnchors} />
            </div>

            {/* Predicted Questions */}
            <div className="lg:col-span-12 space-y-4">
              <div className="flex justify-between items-end">
                <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-on-surface)' }}>
                  Predicted Questions
                </h3>
                <button
                  className="text-xs font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--color-primary)' }}
                  onClick={() => navigate(`/analyze/${selectedApp.sessionId}`)}
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Regenerate Insights
                </button>
              </div>
              <div className="space-y-4">
                {questions.map(q => (
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
