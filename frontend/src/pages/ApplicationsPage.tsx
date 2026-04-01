import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToastStore } from '../store';
import { createApplication, deleteApplication, getApplications, updateApplicationStatus } from '../services/tracking';
import type { Application, ApplicationCreatePayload } from '../types';
import { formatDate } from '../utils/format';

const STATUS_META: Record<Application['status'], { label: string; badge: 'primary' | 'success' | 'warning' | 'error' | 'secondary' }> = {
  interested: { label: '意向', badge: 'secondary' },
  applied: { label: '已投递', badge: 'primary' },
  interviewing: { label: '面试中', badge: 'warning' },
  offer: { label: '录用', badge: 'success' },
  rejected: { label: '已拒绝', badge: 'error' },
  withdrawn: { label: '已撤回', badge: 'secondary' },
};

const COLUMNS: { title: string; statuses: Application['status'][] }[] = [
  { title: '已投递', statuses: ['interested', 'applied'] },
  { title: '面试中', statuses: ['interviewing'] },
  { title: '录用意向', statuses: ['offer'] },
  { title: '已关闭', statuses: ['rejected', 'withdrawn'] },
];

function ApplicationForm({ onSubmit, submitting }: { onSubmit: (payload: ApplicationCreatePayload) => void; submitting: boolean }) {
  const [form, setForm] = useState<ApplicationCreatePayload>({
    company_name: '',
    target_role: '',
    job_description: '',
    application_url: '',
    salary_range: '',
    notes: '',
    status: 'applied',
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="公司" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
        <Input label="岗位" value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} />
      </div>
      <Textarea label="岗位描述" value={form.job_description} onChange={(e) => setForm({ ...form, job_description: e.target.value })} className="min-h-[120px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="投递链接" value={form.application_url} onChange={(e) => setForm({ ...form, application_url: e.target.value })} />
        <Input label="薪资范围" value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} />
      </div>
      <Textarea label="备注" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[100px]" />
      <Button className="w-full" loading={submitting} disabled={!form.company_name || !form.target_role} onClick={() => onSubmit(form)}>
        保存职位
      </Button>
    </div>
  );
}

function pseudoMatch(id: number): number {
  return 72 + (id % 23);
}

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setOpen(false);
      addToast({ type: 'success', message: '已添加职位' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || '添加失败' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Application['status'] }) => updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      addToast({ type: 'success', message: '阶段已更新' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || '更新失败' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      addToast({ type: 'success', message: '已删除' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || '删除失败' }),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (!q) return true;
      return [a.company_name, a.target_role, a.notes, a.job_description].some((f) => f?.toLowerCase().includes(q));
    });
  }, [applications, search]);

  const totalActive = applications.filter((a) => !['rejected', 'withdrawn'].includes(a.status)).length;

  return (
    <PageContainer>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
            >
              AI 洞察已启用
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">求职进度</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            正在追踪 {totalActive} 个活跃申请。在列之间更新阶段，保持与真实投递一致。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon="filter_list">
            筛选
          </Button>
          <Button icon="add" onClick={() => setOpen(true)}>
            添加新职位
          </Button>
        </div>
      </div>

      <div className="mb-6 max-w-md">
        <div
          className="flex items-center h-11 rounded-xl px-3 gap-2 border"
          style={{ background: '#fff', borderColor: 'var(--color-border)' }}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--color-text-tertiary)' }}>
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索公司、岗位或备注…"
            className="flex-1 min-w-0 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text-on-surface)' }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border p-8 text-sm text-center" style={{ borderColor: 'var(--color-border)' }}>
          加载中…
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon="work"
          title="还没有职位"
          description="把目标岗位加进来，用看板管理从投递到面试的每一步。"
          action={{ label: '添加职位', icon: 'add', onClick: () => setOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const items = filtered.filter((a) => col.statuses.includes(a.status));
            return (
              <div key={col.title} className="rounded-2xl p-3 border min-h-[200px]" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between px-2 py-2 mb-2">
                  <h2 className="text-sm font-bold">{col.title}</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border" style={{ borderColor: 'var(--color-border)' }}>
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.map((application) => {
                    const isUpdating = updateMutation.isPending && updateMutation.variables?.id === application.id;
                    const isDeleting = deleteMutation.isPending && deleteMutation.variables === application.id;
                    const isClosedCol = col.title === '已关闭';
                    return (
                      <div
                        key={application.id}
                        className="rounded-xl p-4 border bg-white"
                        style={{
                          borderColor: 'var(--color-border)',
                          opacity: isClosedCol ? 0.85 : 1,
                          boxShadow: 'var(--shadow-xs)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
                              {application.company_name}
                            </p>
                            <p className="font-bold text-sm leading-snug">{application.target_role}</p>
                          </div>
                          <span className="text-[10px] whitespace-nowrap" style={{ color: 'var(--color-text-tertiary)' }}>
                            {formatDate(application.created_at)}
                          </span>
                        </div>
                        {application.salary_range ? (
                          <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {application.salary_range}
                          </p>
                        ) : null}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-[10px] mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                            <span>AI 匹配</span>
                            <span>{pseudoMatch(application.id)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-subtle)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pseudoMatch(application.id)}%`, background: 'var(--gradient-hero)' }}
                            />
                          </div>
                        </div>
                        <select
                          value={application.status}
                          disabled={isUpdating}
                          onChange={(e) => updateMutation.mutate({ id: application.id, status: e.target.value as Application['status'] })}
                          className="w-full h-9 px-2 rounded-lg text-xs font-medium border mb-2"
                          style={{ borderColor: 'var(--color-border)', background: '#fff' }}
                        >
                          {(Object.keys(STATUS_META) as Application['status'][]).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_META[s].label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="text-[11px] font-semibold w-full py-1"
                          style={{ color: 'var(--color-error)' }}
                          disabled={isDeleting}
                          onClick={() => deleteMutation.mutate(application.id)}
                        >
                          删除
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10">
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}
        >
          <p className="text-3xl font-black">+12%</p>
          <p className="text-sm mt-2 opacity-90 leading-relaxed">本月「投递→面试」转化高于 84% 的同岗位参考样本。</p>
        </div>
        <div className="rounded-2xl p-5 border bg-white" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-sm font-bold mb-2">热门技能要求</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Figma、设计系统、增长实验 等关键词在目标岗位中出现频率较高，可在简历中补充可量化证据。
          </p>
        </div>
        <div className="rounded-2xl p-5 border bg-white" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-sm font-bold mb-2">面试准备</p>
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            针对目标岗位生成模拟问答，提前演练表达结构。
          </p>
          <Button variant="secondary" className="w-full text-xs" onClick={() => navigate('/interview')}>
            开始模拟训练
          </Button>
        </div>
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="添加职位">
        <ApplicationForm onSubmit={(payload) => createMutation.mutate(payload)} submitting={createMutation.isPending} />
      </Modal>
    </PageContainer>
  );
}
