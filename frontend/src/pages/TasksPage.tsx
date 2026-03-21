import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useToastStore } from '../store';
import { getTasks, createTask, updateTask, deleteTask } from '../services/tracking';
import type { LearningTask } from '../types';

const priorityConfig: Record<LearningTask['priority'], { label: string; color: string }> = {
  high: { label: '🔴 高', color: 'text-[var(--color-error)]' },
  medium: { label: '🟡 中', color: 'text-[var(--color-warning)]' },
  low: { label: '🟢 低', color: 'text-[var(--color-success)]' },
};

const statusConfig: Record<LearningTask['status'], { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  completed: { label: '已完成', variant: 'success' },
  in_progress: { label: '进行中', variant: 'warning' },
  pending: { label: '待开始', variant: 'neutral' },
};

export default function TasksPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<LearningTask | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  const createMutation = useMutation({
    mutationFn: (payload: Omit<LearningTask, 'id' | 'created_at' | 'updated_at'>) => createTask(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); addToast({ type: 'success', message: '添加成功' }); setShowForm(false); },
    onError: () => addToast({ type: 'error', message: '添加失败' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...updates }: LearningTask) => updateTask(id, updates),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); addToast({ type: 'success', message: '更新成功' }); setEditTarget(null); },
    onError: () => addToast({ type: 'error', message: '更新失败' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); addToast({ type: 'success', message: '删除成功' }); },
    onError: () => addToast({ type: 'error', message: '删除失败' }),
  });

  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as LearningTask['priority'], due_date: '' });

  const handleSubmit = () => {
    createMutation.mutate({ ...form, status: 'pending' });
  };

  const toggleStatus = (task: LearningTask) => {
    const nextStatus: LearningTask['status'] = task.status === 'completed' ? 'pending' : 'completed';
    updateMutation.mutate({ ...task, status: nextStatus });
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <PageContainer>
      <PageHeader
        title="学习任务"
        description={`${completedCount}/${tasks.length} 已完成`}
        action={<Button onClick={() => setShowForm(true)}><Plus size={16} /> 添加任务</Button>}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /></div>
      ) : tasks.length === 0 ? (
        <Card><EmptyState icon="📚" title="暂无学习任务" description="从分析报告中创建或手动添加" action={{ label: '添加', onClick: () => setShowForm(true) }} /></Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const pc = priorityConfig[task.priority];
            const sc = statusConfig[task.status];
            return (
              <Card key={task.id} className="flex items-start gap-4">
                <button onClick={() => toggleStatus(task)} className="mt-0.5 flex-shrink-0">
                  {task.status === 'completed' ? (
                    <CheckCircle size={20} className="text-[var(--color-success)]" />
                  ) : (
                    <Circle size={20} className="text-[var(--color-border-strong)]" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-[var(--color-text)] ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                      {task.title}
                    </span>
                    <span className={pc.color} style={{ fontSize: '0.7rem' }}>{pc.label}</span>
                    <Badge variant={sc.variant}>{sc.label}</Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">{task.description}</p>
                  )}
                  {task.due_date && (
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">📅 {new Date(task.due_date).toLocaleDateString('zh-CN')}</p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setEditTarget(task)}>编辑</Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(task.id)} className="hover:text-[var(--color-error)]">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="添加任务">
        <div className="space-y-3">
          <Input label="任务标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="描述（可选）" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold mb-1 block">优先级</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as LearningTask['priority'] })} className="w-full px-3 py-2.5 text-sm bg-[var(--color-bg-surface)] border-2 border-[var(--color-border)] rounded-[var(--radius-md)]">
                <option value="high">🔴 高</option>
                <option value="medium">🟡 中</option>
                <option value="low">🟢 低</option>
              </select>
            </div>
            <Input label="截止日期" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={!form.title.trim()}>添加</Button>
        </div>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="编辑任务">
        <div className="space-y-3">
          <Input label="任务标题" value={editTarget?.title ?? ''} onChange={(e) => setEditTarget(editTarget ? { ...editTarget, title: e.target.value } : null)} />
          <Textarea label="描述（可选）" value={editTarget?.description ?? ''} onChange={(e) => setEditTarget(editTarget ? { ...editTarget, description: e.target.value } : null)} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold mb-1 block">优先级</label>
              <select value={editTarget?.priority ?? 'medium'} onChange={(e) => setEditTarget(editTarget ? { ...editTarget, priority: e.target.value as LearningTask['priority'] } : null)} className="w-full px-3 py-2.5 text-sm bg-[var(--color-bg-surface)] border-2 border-[var(--color-border)] rounded-[var(--radius-md)]">
                <option value="high">🔴 高</option>
                <option value="medium">🟡 中</option>
                <option value="low">🟢 低</option>
              </select>
            </div>
            <Input label="截止日期" type="date" value={editTarget?.due_date ?? ''} onChange={(e) => setEditTarget(editTarget ? { ...editTarget, due_date: e.target.value } : null)} />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setEditTarget(null)}>取消</Button>
            <Button className="flex-1" onClick={() => editTarget && updateMutation.mutate(editTarget)} disabled={!editTarget?.title.trim()}>保存</Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
