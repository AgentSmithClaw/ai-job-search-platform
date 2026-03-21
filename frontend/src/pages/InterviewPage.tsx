import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Textarea } from '../components/ui/Input';

import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useToastStore } from '../store';
import { getInterviewPrep, createInterviewPrep, updateInterviewPrep, deleteInterviewPrep } from '../services/tracking';
import type { InterviewPrep } from '../types';

export default function InterviewPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['interview-prep'],
    queryFn: getInterviewPrep,
  });

  const createMutation = useMutation({
    mutationFn: (payload: Omit<InterviewPrep, 'id' | 'created_at' | 'updated_at'>) => createInterviewPrep(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['interview-prep'] }); addToast({ type: 'success', message: '添加成功' }); setShowForm(false); },
    onError: () => addToast({ type: 'error', message: '添加失败' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...updates }: InterviewPrep) => updateInterviewPrep(id, updates),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['interview-prep'] }); addToast({ type: 'success', message: '更新成功' }); },
    onError: () => addToast({ type: 'error', message: '更新失败' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteInterviewPrep(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['interview-prep'] }); addToast({ type: 'success', message: '删除成功' }); },
    onError: () => addToast({ type: 'error', message: '删除失败' }),
  });

  const [form, setForm] = useState({ question: '', answer: '', notes: '' });

  const handleSubmit = () => {
    createMutation.mutate({ ...form, status: 'pending' });
    setForm({ question: '', answer: '', notes: '' });
  };

  const preparedCount = items.filter((i) => i.status === 'prepared').length;

  return (
    <PageContainer>
      <PageHeader
        title="面试准备"
        description={`${preparedCount}/${items.length} 已准备`}
        action={<Button onClick={() => setShowForm(true)}><Plus size={16} /> 添加问题</Button>}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /></div>
      ) : items.length === 0 ? (
        <Card><EmptyState icon="🎤" title="暂无面试题" description="添加面试问题和参考答案" action={{ label: '添加', onClick: () => setShowForm(true) }} /></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="cursor-pointer" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
              <div className="flex items-start gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ ...item, status: item.status === 'prepared' ? 'pending' : 'prepared' }); }}
                  className="mt-0.5"
                >
                  {item.status === 'prepared' ? (
                    <CheckCircle size={18} className="text-[var(--color-success)]" />
                  ) : (
                    <Circle size={18} className="text-[var(--color-border-strong)]" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-[var(--color-text)] ${item.status === 'prepared' ? 'line-through opacity-60' : ''}`}>
                    {item.question}
                  </p>
                  {item.notes && <p className="text-xs text-[var(--color-text-tertiary)] mt-1">💬 {item.notes}</p>}
                  {expanded === item.id && item.answer && (
                    <div className="mt-3 p-3 bg-[var(--color-bg-subtle)] rounded-[var(--radius-md)]">
                      <p className="text-xs font-semibold text-[var(--color-text-tertiary)] mb-1">参考答案</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{item.answer}</p>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }} className="hover:text-[var(--color-error)]">
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="添加面试题">
        <div className="space-y-3">
          <Textarea label="面试问题" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          <Textarea label="参考答案（可选）" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
          <Textarea label="备注（可选）" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button className="w-full" onClick={handleSubmit} disabled={!form.question.trim()}>添加</Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
