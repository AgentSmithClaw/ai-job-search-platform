import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { exportReport, generateQuestions, getSession } from '../services/analysis';
import { createInterviewPrep, createTask } from '../services/tracking';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/Progress';
import { useToastStore } from '../store';
import { formatDateTime, scoreLabel } from '../utils/format';

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function Gauge({ score }: { score: number }) {
  const size = 220;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-container-highest)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-5xl font-black tracking-tight">{score}</p>
        <p className="editorial-kicker">Match Score</p>
      </div>
    </div>
  );
}

export default function AnalysisResultPage() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const { data: session, isLoading, isError } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId),
    enabled: Number.isFinite(sessionId) && sessionId > 0,
  });

  const exportMutation = useMutation({
    mutationFn: (format: 'docx' | 'pdf') => exportReport(sessionId, format),
    onSuccess: (blob, format) => {
      downloadBlob(blob, `analysis-${sessionId}.${format}`);
      addToast({ type: 'success', message: `${format.toUpperCase()} export is ready.` });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Export failed.' }),
  });

  const copyMutation = useMutation({
    mutationFn: (text: string) => copyToClipboard(text),
    onSuccess: () => addToast({ type: 'success', message: 'Summary copied to clipboard.' }),
    onError: () => addToast({ type: 'error', message: 'Could not copy the summary.' }),
  });

  const taskMutation = useMutation({
    mutationFn: async () => {
      if (!session) return;
      await Promise.all(
        session.report.learning_plan.map((item) =>
          createTask({
            title: item,
            description: `Created from analysis report #${session.id}.`,
            session_id: session.id,
            priority: 'medium',
          }),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-tasks'] });
      addToast({ type: 'success', message: 'Learning tasks created.' });
      navigate('/tasks');
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Could not create tasks.' }),
  });

  const interviewMutation = useMutation({
    mutationFn: async () => {
      if (!session) return;
      const generated = await generateQuestions({
        session_id: session.id,
        target_role: session.target_role,
        resume_text: session.resume_text,
        job_description: session.job_description,
        gaps: session.report.gaps,
      });

      await Promise.all(
        generated.questions.map((question) =>
          createInterviewPrep({
            question,
            session_id: session.id,
          }),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-prep'] });
      addToast({ type: 'success', message: 'Interview questions added to your library.' });
      navigate('/interview');
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Could not generate interview questions.' }),
  });

  const topGaps = useMemo(() => session?.report.gaps.slice(0, 4) ?? [], [session]);
  const strengths = session?.report.strengths ?? [];
  const risks = session?.report.risks ?? [];
  const validation = session?.report.validation;
  const competencyBreakdown = useMemo(() => {
    if (!session) return [];

    const categoryMap = new Map<string, { total: number; penalty: number }>();
    session.report.gaps.forEach((gap) => {
      const key = gap.category || 'General';
      const penalty = gap.severity === 'high' ? 34 : gap.severity === 'medium' ? 18 : 8;
      const current = categoryMap.get(key) ?? { total: 0, penalty: 0 };
      current.total += 1;
      current.penalty += penalty;
      categoryMap.set(key, current);
    });

    const items =
      categoryMap.size === 0
        ? [{ label: 'Overall fit', score: session.report.match_score, detail: 'No category-level gaps were detected in this report.' }]
        : Array.from(categoryMap.entries()).map(([label, value]) => ({
            label,
            score: Math.max(25, 100 - value.penalty),
            detail: `${value.total} gap item${value.total > 1 ? 's' : ''} identified`,
          }));

    return items.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [session]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="min-h-[60vh] flex items-center justify-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Loading analysis report...
        </div>
      </PageContainer>
    );
  }

  if (isError || !session) {
    return (
      <PageContainer>
        <EmptyState
          icon="error"
          title="This analysis report is unavailable"
          description="The session may not exist, or your account may not have access to it."
          action={{ label: 'Back to history', icon: 'arrow_back', onClick: () => navigate('/history') }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        <Card className="xl:col-span-8 p-6 md:p-8 overflow-hidden relative">
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at top right, rgba(79,70,229,0.12), transparent 32%)' }}
          />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="primary">Analysis complete</Badge>
              <Badge variant="secondary">{scoreLabel(session.report.match_score)}</Badge>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {formatDateTime(session.created_at)}
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">{session.target_role}</h1>
                <p className="text-base max-w-3xl" style={{ color: 'var(--color-text-secondary)' }}>
                  {session.report.summary}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" icon="content_copy" onClick={() => copyMutation.mutate(session.report.summary)} loading={copyMutation.isPending}>
                  Copy summary
                </Button>
                <Button variant="ghost" icon="history" onClick={() => navigate('/history')}>
                  History
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                <p className="editorial-kicker mb-2">Confidence</p>
                <p className="text-2xl font-black">{validation?.confidence ?? 0}%</p>
              </div>
              <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                <p className="editorial-kicker mb-2">Critical gaps</p>
                <p className="text-2xl font-black">{validation?.critical_gaps.length || topGaps.length}</p>
              </div>
              <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                <p className="editorial-kicker mb-2">Next actions</p>
                <p className="text-2xl font-black">{session.report.next_actions.length}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-4 p-6 md:p-8 flex flex-col items-center justify-center">
          <Gauge score={session.report.match_score} />
          <div className="w-full mt-6 space-y-3">
            <Button className="w-full" icon="download" onClick={() => exportMutation.mutate('pdf')} loading={exportMutation.isPending && exportMutation.variables === 'pdf'}>
              Export PDF report
            </Button>
            <Button className="w-full" variant="secondary" icon="description" onClick={() => exportMutation.mutate('docx')} loading={exportMutation.isPending && exportMutation.variables === 'docx'}>
              Export DOCX draft
            </Button>
            <Button className="w-full" variant="ghost" icon="assignment" onClick={() => navigate('/applications')}>
              Go to applications
            </Button>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        <Card className="xl:col-span-4 p-6">
          <p className="editorial-kicker mb-2">Strengths</p>
          <h3 className="text-xl font-bold tracking-tight mb-4">What already matches well</h3>
          <div className="space-y-3">
            {(strengths.length ? strengths : ['No standout strengths were extracted from this report.']).map((item) => (
              <div key={item} className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>verified</span>
                  <p className="text-sm">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-4 p-6">
          <p className="editorial-kicker mb-2">Key gaps</p>
          <h3 className="text-xl font-bold tracking-tight mb-4">Where the role still needs evidence</h3>
          <div className="space-y-3">
            {topGaps.length === 0 ? (
              <div className="rounded-[var(--radius-xl)] p-4 text-sm" style={{ background: 'var(--color-surface-container-low)' }}>
                No major skill gaps were identified in the top section of the report.
              </div>
            ) : (
              topGaps.map((gap) => (
                <div key={`${gap.requirement}-${gap.evidence}`} className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <p className="font-semibold">{gap.requirement}</p>
                    <Badge variant={gap.severity === 'high' ? 'error' : gap.severity === 'medium' ? 'warning' : 'secondary'}>
                      {gap.severity}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>{gap.evidence}</p>
                  <p className="text-sm">{gap.recommendation}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="xl:col-span-4 p-6">
          <p className="editorial-kicker mb-2">Risk signals</p>
          <h3 className="text-xl font-bold tracking-tight mb-4">Potential concerns to address</h3>
          <div className="space-y-3">
            {(risks.length ? risks : ['No major risk signals were found. Keep strengthening concrete examples and impact statements.']).map((item) => (
              <div key={item} className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary)' }}>report_problem</span>
                  <p className="text-sm">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        <Card className="xl:col-span-7 p-6">
          <div className="flex items-center justify-between mb-5 gap-4">
            <div>
              <p className="editorial-kicker mb-2">Execution plan</p>
              <h3 className="text-xl font-bold tracking-tight">Recommended next steps</h3>
            </div>
            <Button variant="secondary" icon="school" onClick={() => taskMutation.mutate()} loading={taskMutation.isPending}>
              Create learning tasks
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <p className="font-semibold mb-3">Next actions</p>
              <ul className="space-y-2">
                {(session.report.next_actions.length ? session.report.next_actions : ['No explicit next actions were generated.']).map((item) => (
                  <li key={item} className="text-sm flex gap-2">
                    <span className="material-symbols-outlined text-base" style={{ color: 'var(--color-primary)' }}>arrow_forward</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <p className="font-semibold mb-3">Learning roadmap</p>
              <ul className="space-y-2">
                {(session.report.learning_plan.length ? session.report.learning_plan : ['No learning roadmap was generated.']).map((item) => (
                  <li key={item} className="text-sm flex gap-2">
                    <span className="material-symbols-outlined text-base" style={{ color: 'var(--color-primary)' }}>school</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-5 p-6">
          <div className="flex items-center justify-between mb-5 gap-4">
            <div>
              <p className="editorial-kicker mb-2">Interview prep</p>
              <h3 className="text-xl font-bold tracking-tight">Turn this report into practice</h3>
            </div>
            <Button icon="record_voice_over" onClick={() => interviewMutation.mutate()} loading={interviewMutation.isPending}>
              Generate questions
            </Button>
          </div>

          <div className="space-y-3 mb-5">
            {(session.report.interview_focus.length ? session.report.interview_focus : ['No interview focus items were generated.']).map((item) => (
              <div key={item} className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
            <p className="font-semibold mb-2">Resume improvement notes</p>
            <div className="space-y-3">
              {(session.report.resume_suggestions.length ? session.report.resume_suggestions.slice(0, 2) : [{ original: 'No resume rewrite suggestions were generated yet.', optimized: '', reason: '' }]).map((item) => (
                <div key={`${item.original}-${item.optimized}`} className="text-sm">
                  <p className="font-medium">{item.original}</p>
                  {item.optimized && <p style={{ color: 'var(--color-text-secondary)' }}>{item.optimized}</p>}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <Card className="xl:col-span-5 p-6">
          <p className="editorial-kicker mb-2">Validation</p>
          <h3 className="text-xl font-bold tracking-tight mb-4">How trustworthy is this report?</h3>
          <div className="space-y-4">
            <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <p className="font-semibold mb-2">High-priority actions</p>
              <ul className="space-y-2">
                {(validation?.high_priority_actions.length ? validation.high_priority_actions : ['No additional validation actions were generated.']).map((item) => (
                  <li key={item} className="text-sm">{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <p className="font-semibold mb-2">Caution notes</p>
              <ul className="space-y-2">
                {(validation?.caution_notes.length ? validation.caution_notes : ['No caution notes were raised by the validation layer.']).map((item) => (
                  <li key={item} className="text-sm">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-7 p-6">
          <p className="editorial-kicker mb-2">Competency breakdown</p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Role coverage by capability area</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                A quick read on which capability clusters look strongest and where the report still sees missing evidence.
              </p>
            </div>
            <Badge variant="secondary">{competencyBreakdown.length} areas</Badge>
          </div>

          <div className="space-y-4 mb-6">
            {competencyBreakdown.map((item) => (
              <div key={item.label} className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="font-semibold">{item.label}</p>
                  <span className="text-sm font-semibold">{item.score}%</span>
                </div>
                <ProgressBar value={item.score} showLabel color={item.score >= 75 ? 'success' : item.score >= 55 ? 'primary' : item.score >= 40 ? 'warning' : 'error'} />
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          <p className="editorial-kicker mb-2">Resume draft</p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Generated resume draft</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Use this draft as a starting point before tailoring the final application version.
              </p>
            </div>
            <Button variant="secondary" icon="description" onClick={() => exportMutation.mutate('docx')} loading={exportMutation.isPending && exportMutation.variables === 'docx'}>
              Export draft
            </Button>
          </div>
          <div
            className="rounded-[var(--radius-xl)] p-4 max-h-[380px] overflow-auto whitespace-pre-wrap text-sm leading-7"
            style={{ background: 'var(--color-surface-container-low)' }}
          >
            {session.resume_draft}
          </div>
        </Card>
      </section>
    </PageContainer>
  );
}
