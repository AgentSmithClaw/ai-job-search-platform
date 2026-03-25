import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Input, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToastStore } from '../store';
import { createTask, deleteTask, getTasks, updateTaskStatus } from '../services/tracking';
import type { LearningTask, LearningTaskCreatePayload } from '../types';
import { formatDate } from '../utils/format';

const STATUS_COLUMNS: Array<{ key: LearningTask['status']; title: string; badge: 'error' | 'primary' | 'success' }> = [
  { key: 'pending', title: 'Planned', badge: 'error' },
  { key: 'in_progress', title: 'In Progress', badge: 'primary' },
  { key: 'completed', title: 'Completed', badge: 'success' },
];

function TaskForm({ onSubmit }: { onSubmit: (payload: LearningTaskCreatePayload) => void }) {
  const [form, setForm] = useState<LearningTaskCreatePayload>({
    title: '',
    description: '',
    target_date: '',
    priority: 'medium',
  });

  return (
    <div className="space-y-4">
      <Input label="Task title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
      <Textarea label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-[140px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Target date" type="date" value={form.target_date ?? ''} onChange={(event) => setForm({ ...form, target_date: event.target.value })} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Priority</label>
          <select
            value={form.priority}
            onChange={(event) => setForm({ ...form, priority: event.target.value as LearningTask['priority'] })}
            className="h-11 px-3 rounded-[var(--radius-xl)] text-sm"
            style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-border)' }}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      <Button className="w-full" disabled={!form.title.trim()} onClick={() => onSubmit(form)}>
        Create task
      </Button>
    </div>
  );
}

export default function TasksPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['learning-tasks'],
    queryFn: getTasks,
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-tasks'] });
      setOpen(false);
      addToast({ type: 'success', message: 'Learning task created.' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Could not create the task.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: LearningTask['status'] }) => updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-tasks'] });
      addToast({ type: 'success', message: 'Task status updated.' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Could not update the task.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-tasks'] });
      addToast({ type: 'success', message: 'Task removed.' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Could not remove the task.' }),
  });

  const grouped = useMemo(
    () =>
      STATUS_COLUMNS.map((column) => ({
        ...column,
        items: tasks.filter((task) => task.status === column.key),
      })),
    [tasks],
  );

  const completedCount = tasks.filter((task) => task.status === 'completed').length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <PageContainer>
      <PageHeader
        title="Learning tasks"
        description="Turn the gaps from your analysis into a simple, trackable execution plan instead of leaving them buried inside a report."
        action={
          <Button icon="add" onClick={() => setOpen(true)}>
            Add task
          </Button>
        }
      />

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        <Card className="xl:col-span-8 p-8">
          <p className="editorial-kicker mb-2">Execution Progress</p>
          <h2 className="text-3xl font-black tracking-tight mb-2">Plan completion: {progress}%</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            You currently have {tasks.length} tasks, with {completedCount} already done. Keeping these actions visible makes it much easier to improve your match over time.
          </p>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-container-highest)' }}>
            <div className="h-full" style={{ width: `${progress}%`, background: 'var(--color-primary)' }} />
          </div>
        </Card>

        <Card className="xl:col-span-4 p-8">
          <p className="editorial-kicker mb-2">Task Health</p>
          <div className="space-y-4">
            {STATUS_COLUMNS.map((column) => (
              <div key={column.key} className="flex items-center justify-between rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                <p className="font-semibold">{column.title}</p>
                <Badge variant={column.badge}>{tasks.filter((task) => task.status === column.key).length}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {isLoading ? (
        <Card className="p-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Loading learning tasks...
        </Card>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="school"
          title="No learning tasks yet"
          description="You can create tasks from an analysis result or add your own study plan here."
          action={{ label: 'Add task', icon: 'add', onClick: () => setOpen(true) }}
        />
      ) : (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {grouped.map((column) => (
            <Card key={column.key} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold tracking-tight">{column.title}</h3>
                <Badge variant={column.badge}>{column.items.length}</Badge>
              </div>
              <div className="space-y-4">
                {column.items.length === 0 ? (
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>No tasks in this stage.</div>
                ) : (
                  column.items.map((task) => (
                    <div key={task.id} className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {task.priority.toUpperCase()} · {task.target_date ? formatDate(task.target_date) : 'No due date'}
                          </p>
                        </div>
                        <select
                          value={task.status}
                          onChange={(event) => updateMutation.mutate({ id: task.id, status: event.target.value as LearningTask['status'] })}
                          className="h-9 px-2 rounded-[var(--radius-xl)] text-xs"
                          style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
                        >
                          <option value="pending">Planned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      {task.description && <p className="text-sm mb-3">{task.description}</p>}
                      <Button variant="ghost" icon="delete" onClick={() => deleteMutation.mutate(task.id)}>
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))}
        </section>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create learning task">
        <TaskForm onSubmit={(payload) => createMutation.mutate(payload)} />
      </Modal>
    </PageContainer>
  );
}
