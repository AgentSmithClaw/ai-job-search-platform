import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Input, Textarea } from '../components/ui/Input';
import { useToastStore } from '../store';
import { generateQuestions, getSession, getSessions } from '../services/analysis';
import { createInterviewPrep, deleteInterviewPrep, getInterviewPrep, updateInterviewPrep } from '../services/tracking';
import type { InterviewPrep } from '../types';

function PrepCard({
  item,
  onSave,
  onDelete,
  saving,
  deleting,
}: {
  item: InterviewPrep;
  onSave: (updates: Pick<InterviewPrep, 'ideal_answer' | 'notes' | 'status'>) => void;
  onDelete: () => void;
  saving: boolean;
  deleting: boolean;
}) {
  const [answer, setAnswer] = useState(item.ideal_answer);
  const [notes, setNotes] = useState(item.notes);

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="editorial-kicker mb-1">Interview card</p>
          <h3 className="text-lg font-semibold tracking-tight">{item.question}</h3>
        </div>
        <Badge variant={item.status === 'prepared' ? 'success' : 'warning'}>
          {item.status === 'prepared' ? 'Prepared' : 'Pending'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
          <p className="font-semibold mb-2">Suggested answer</p>
          <Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} className="min-h-[150px]" />
        </div>
        <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
          <p className="font-semibold mb-2">Notes</p>
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-[150px]" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button loading={saving} onClick={() => onSave({ ideal_answer: answer, notes, status: item.status })}>
          Save
        </Button>
        <Button
          variant={item.status === 'prepared' ? 'secondary' : 'primary'}
          loading={saving}
          onClick={() =>
            onSave({
              ideal_answer: answer,
              notes,
              status: item.status === 'prepared' ? 'pending' : 'prepared',
            })
          }
        >
          {item.status === 'prepared' ? 'Mark pending' : 'Mark prepared'}
        </Button>
        <Button variant="ghost" icon="delete" loading={deleting} onClick={onDelete}>
          Remove
        </Button>
      </div>
    </Card>
  );
}

export default function InterviewPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [manualQuestion, setManualQuestion] = useState('');
  const [manualAnswer, setManualAnswer] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InterviewPrep['status']>('all');
  const [search, setSearch] = useState('');

  const { data: sessionsData } = useQuery({
    queryKey: ['sessions', { limit: 20 }],
    queryFn: () => getSessions({ limit: 20 }),
  });

  const sessions = sessionsData?.sessions ?? [];
  const activeSessionId = selectedId ?? sessions[0]?.id ?? null;

  const { data: sessionDetail } = useQuery({
    queryKey: ['session', activeSessionId],
    queryFn: () => getSession(activeSessionId as number),
    enabled: !!activeSessionId,
  });

  const { data: prepItems = [], isLoading } = useQuery({
    queryKey: ['interview-prep'],
    queryFn: getInterviewPrep,
  });

  const createMutation = useMutation({
    mutationFn: createInterviewPrep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-prep'] });
      setManualQuestion('');
      setManualAnswer('');
      setManualNotes('');
      addToast({ type: 'success', message: 'Interview card added.' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Create failed.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, item }: { id: number; item: Pick<InterviewPrep, 'ideal_answer' | 'notes' | 'status'> }) => updateInterviewPrep(id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-prep'] });
      addToast({ type: 'success', message: 'Interview card updated.' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Update failed.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInterviewPrep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-prep'] });
      addToast({ type: 'success', message: 'Interview card removed.' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Delete failed.' }),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!sessionDetail) return;
      const generated = await generateQuestions({
        session_id: sessionDetail.id,
        target_role: sessionDetail.target_role,
        resume_text: sessionDetail.resume_text,
        job_description: sessionDetail.job_description,
        gaps: sessionDetail.report.gaps,
      });

      await Promise.all(
        generated.questions.map((question) =>
          createInterviewPrep({
            question,
            session_id: sessionDetail.id,
          }),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-prep'] });
      addToast({ type: 'success', message: 'Questions generated from analysis.' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Generation failed.' }),
  });

  const filteredPrep = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return prepItems
      .slice()
      .reverse()
      .filter((item) => {
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesSearch =
          !normalizedSearch ||
          [item.question, item.ideal_answer, item.notes]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(normalizedSearch));

        return matchesStatus && matchesSearch;
      });
  }, [prepItems, search, statusFilter]);

  return (
    <PageContainer>
      <PageHeader
        title="Interview prep"
        description="Turn analysis gaps and risk signals into reusable interview cards that can be refined over time."
        action={
          <Button icon="auto_awesome" disabled={!sessionDetail} loading={generateMutation.isPending} onClick={() => generateMutation.mutate()}>
            Generate from analysis
          </Button>
        }
      />

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        <Card className="xl:col-span-4 p-6">
          <p className="editorial-kicker mb-2">Source session</p>
          <h3 className="text-xl font-bold tracking-tight mb-4">Choose an analysis</h3>
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No analysis history yet. Run a role-fit analysis first.
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  className="w-full text-left rounded-[var(--radius-xl)] p-4 transition-colors"
                  style={{ background: activeSessionId === session.id ? 'var(--color-primary-subtle)' : 'var(--color-surface-container-low)' }}
                  onClick={() => setSelectedId(session.id)}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-semibold">{session.target_role}</p>
                    <Badge variant="secondary">{session.match_score}%</Badge>
                  </div>
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {session.summary}
                  </p>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card className="xl:col-span-8 p-6">
          <p className="editorial-kicker mb-2">Manual card</p>
          <h3 className="text-xl font-bold tracking-tight mb-4">Create a manual interview card</h3>
          <div className="space-y-4">
            <Input label="Question" value={manualQuestion} onChange={(event) => setManualQuestion(event.target.value)} placeholder="Example: Tell me about a time you closed a critical skill gap quickly." />
            <Textarea label="Suggested answer" value={manualAnswer} onChange={(event) => setManualAnswer(event.target.value)} className="min-h-[140px]" />
            <Textarea label="Notes" value={manualNotes} onChange={(event) => setManualNotes(event.target.value)} className="min-h-[120px]" />
            <Button
              loading={createMutation.isPending}
              disabled={!manualQuestion.trim()}
              onClick={() =>
                createMutation.mutate({
                  question: manualQuestion,
                  ideal_answer: manualAnswer,
                  notes: manualNotes,
                  session_id: activeSessionId,
                })
              }
            >
              Save card
            </Button>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_220px] gap-4 mb-6">
        <Input
          label="Search interview cards"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Question, answer, or notes"
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Status filter</label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | InterviewPrep['status'])}
            className="h-11 px-3 rounded-[var(--radius-xl)] text-sm"
            style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-border)' }}
          >
            <option value="all">All cards</option>
            <option value="pending">Pending</option>
            <option value="prepared">Prepared</option>
          </select>
        </div>
      </section>

      {isLoading ? (
        <Card className="p-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Loading interview prep...
        </Card>
      ) : prepItems.length === 0 ? (
        <EmptyState
          icon="record_voice_over"
          title="No interview cards yet"
          description="Add one manually or generate a set from your latest analysis."
        />
      ) : filteredPrep.length === 0 ? (
        <EmptyState
          icon="search"
          title="No interview cards match the current filter"
          description="Try another search term or switch the status filter back to all."
        />
      ) : (
        <section className="grid grid-cols-1 gap-4">
          {filteredPrep.map((item) => (
            <PrepCard
              key={item.id}
              item={item}
              saving={updateMutation.isPending && updateMutation.variables?.id === item.id}
              deleting={deleteMutation.isPending && deleteMutation.variables === item.id}
              onSave={(updates) => updateMutation.mutate({ id: item.id, item: updates })}
              onDelete={() => deleteMutation.mutate(item.id)}
            />
          ))}
        </section>
      )}
    </PageContainer>
  );
}
