import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useToastStore } from '../store';
import { getApplications, createApplication, updateApplication, deleteApplication } from '../services/tracking';
import type { Application } from '../types';

const statusConfig: Record<Application['status'], { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' }> = {
  interested: { label: '感兴趣', variant: 'info' },
  applied: { label: '已投递', variant: 'success' },
  interviewing: { label: '面试中', variant: 'warning' },
  offer: { label: '拿到 Offer', variant: 'success' },
  rejected: { label: '已拒绝', variant: 'error' },
  pending: { label: '待处理', variant: 'neutral' },
};

function ApplicationForm({ onSubmit, initial }: { onSubmit: (data: Omit<Application, 'id' | 'created_at' | 'updated_at'>) => void; initial?: Partial<Application> }) {
  const [form, setForm] = useState<Omit<Application, 'id' | 'created_at' | 'updated_at'>>({
    company: initial?.company || '',
    role: initial?.role || '',
    description: initial?.description || '',
    url: initial?.url || '',
    salary: initial?.salary || '',
    notes: initial?.notes || '',
    status: initial?.status || 'interested',
    match_score: initial?.match_score,
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="公司名称" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <Input label="目标岗位" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
      </div>
      <Textarea label="职位描述" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="投递链接" value={form.url || ''} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        <Input label="薪资范围" value={form.salary || ''} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
      </div>
      <Textarea label="备注" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      <div>
        <label className="text-sm font-semibold text-[var(--color-text)] mb-1 block">状态</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as Application['status'] })}
          className="w-full px-3 py-2.5 text-sm bg-[var(--color-bg-surface)] border-2 border-[var(--color-border)] rounded-[var(--radius-md)]"
        >
          {Object.entries(statusConfig).map(([val, cfg]) => (
            <option key={val} value={val}>{cfg.label}</option>
          ))}
        </select>
      </div>
      <Button className="w-full" onClick={() => onSubmit(form)}>{initial ? '更新' : '添加'}</Button>
    </div>
  );
}

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Application | null>(null);

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  const createMutation = useMutation({
    mutationFn: (payload: Omit<Application, 'id' | 'created_at' | 'updated_at'>) => createApplication(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['applications'] }); addToast({ type: 'success', message: '添加成功' }); setShowForm(false); },
    onError: () => addToast({ type: 'error', message: '添加失败' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...updates }: Application) => updateApplication(id, updates),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['applications'] }); addToast({ type: 'success', message: '更新成功' }); setEditTarget(null); },
    onError: () => addToast({ type: 'error', message: '更新失败' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteApplication(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['applications'] }); addToast({ type: 'success', message: '删除成功' }); },
    onError: () => addToast({ type: 'error', message: '删除失败' }),
  });

  return (
    <PageContainer>
      <PageHeader
        title="投递追踪"
        description={`${apps.length} 个投递记录`}
        action={<Button onClick={() => setShowForm(true)}><Plus size={16} /> 添加投递</Button>}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /></div>
      ) : apps.length === 0 ? (
        <Card><EmptyState icon="📨" title="暂无投递记录" description="记录你的求职投递进度" action={{ label: '添加', onClick: () => setShowForm(true) }} /></Card>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => {
            const cfg = statusConfig[app.status];
            return (
              <Card key={app.id} className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[var(--color-text)]">{app.role}</span>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">{app.company}</p>
                  {app.salary && <p className="text-xs text-[var(--color-text-tertiary)] mt-1">💰 {app.salary}</p>}
                  {app.notes && <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{app.notes}</p>}
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-2">{new Date(app.created_at).toLocaleDateString('zh-CN')}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {app.url && (
                    <Button variant="ghost" size="sm" onClick={() => window.open(app.url, '_blank')}>
                      <ExternalLink size={14} />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setEditTarget(app)}>编辑</Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(app.id)} className="hover:text-[var(--color-error)]">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="添加投递">
        <ApplicationForm onSubmit={(data) => createMutation.mutate(data)} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="编辑投递">
        <ApplicationForm onSubmit={(data) => editTarget && updateMutation.mutate({ ...editTarget, ...data })} initial={editTarget ?? undefined} />
      </Modal>
    </PageContainer>
  );
}
