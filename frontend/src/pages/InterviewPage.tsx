import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '../components/layout/PageContainer';
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
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="text-base font-bold">{item.question}</h3>
        <Badge variant={item.status === 'prepared' ? 'success' : 'warning'}>{item.status === 'prepared' ? '已准备' : '待完善'}</Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="min-h-[120px]" />
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[120px]" placeholder="备注" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" loading={saving} onClick={() => onSave({ ideal_answer: answer, notes, status: item.status })}>
          保存
        </Button>
        <Button size="sm" variant="ghost" loading={deleting} onClick={onDelete}>
          删除
        </Button>
      </div>
    </Card>
  );
}

export default function InterviewPage() {
  const navigate = useNavigate();
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
      addToast({ type: 'success', message: '已添加面试卡' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || '创建失败' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, item }: { id: number; item: Pick<InterviewPrep, 'ideal_answer' | 'notes' | 'status'> }) => updateInterviewPrep(id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-prep'] });
      addToast({ type: 'success', message: '已更新' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || '更新失败' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInterviewPrep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-prep'] });
      addToast({ type: 'success', message: '已删除' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || '删除失败' }),
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
      addToast({ type: 'success', message: '已从分析生成面试题' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || '生成失败' }),
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

  const roleTitle = sessionDetail?.target_role ?? '目标岗位';

  return (
    <PageContainer>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
        <div>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
            style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
          >
            AI 驱动的学习
          </span>
          <h1 className="mt-3 text-2xl md:text-3xl font-black tracking-tight">掌控您的下一次职业晋升</h1>
          <p className="mt-2 text-sm max-w-2xl leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            结合岗位描述与差距报告，生成可演练的面试问答，并持续记录你的表达与答案版本。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate('/history')}>
            查看历史
          </Button>
          <Button icon="forum" onClick={() => document.getElementById('interview-prep-list')?.scrollIntoView({ behavior: 'smooth' })}>
            开始新会话
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 mb-8">
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-md)', background: 'var(--color-bg-surface)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                正在模拟面试
              </p>
              <p className="font-bold text-lg mt-0.5">{roleTitle}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'var(--color-bg-subtle)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              正在倾听…
            </div>
          </div>
          <div className="p-5 space-y-4 min-h-[220px]">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: 'var(--color-bg-subtle)' }}>
                AI
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] text-sm leading-relaxed" style={{ background: 'var(--color-bg-subtle)' }}>
                请描述一次你与多方干系人意见不一致时，如何推动决策并交付结果？
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div
                className="rounded-2xl rounded-tr-sm px-4 py-3 max-w-[90%] text-sm leading-relaxed text-white"
                style={{ background: 'var(--gradient-hero)' }}
              >
                我在上一家公司负责增长看板项目，通过每周对齐会议与数据复盘，把争议焦点收敛到可验证的实验指标上…
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              className="w-12 h-12 rounded-full flex items-center justify-center border"
              style={{ borderColor: 'var(--color-border)' }}
              disabled
              title="功能开发中"
            >
              <span className="material-symbols-outlined">call_end</span>
            </button>
            <button
              type="button"
              className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
              disabled
              title="功能开发中"
              style={{ background: 'var(--gradient-hero)' }}
            >
              <span className="material-symbols-outlined text-2xl">mic</span>
            </button>
            <button
              type="button"
              className="w-12 h-12 rounded-full flex items-center justify-center border"
              style={{ borderColor: 'var(--color-border)' }}
              disabled
              title="功能开发中"
            >
              <span className="material-symbols-outlined">pause</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl p-5 border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}>
            <p className="text-xs font-bold mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
              实时反馈（演示）
            </p>
            {[
              { label: '表达清晰度', v: 88 },
              { label: '自信度', v: 72 },
              { label: '关键词命中', v: 95 },
            ].map((m) => (
              <div key={m.label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>{m.label}</span>
                  <span className="font-bold">{m.v}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-subtle)' }}>
                  <div className="h-full rounded-full" style={{ width: `${m.v}%`, background: 'var(--gradient-hero)' }} />
                </div>
              </div>
            ))}
            <div className="mt-4 p-3 rounded-xl text-xs leading-relaxed" style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary-text)' }}>
              提示：减少「嗯、那个」等填充词，结论先行会让回答更有权威感。
            </div>
          </div>
          <div className="rounded-2xl p-4 border text-sm" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}>
            <p className="font-bold mb-2">推荐任务</p>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <li>· STAR 实验室（约 15 分钟）</li>
              <li>· 系统设计快问（约 10 分钟）</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-5 mb-8" style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="font-bold text-lg">关联分析会话</h2>
          <Button icon="auto_awesome" size="sm" disabled={!sessionDetail} loading={generateMutation.isPending} onClick={() => generateMutation.mutate()}>
            从分析生成题目
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {sessions.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              暂无分析记录，请先在「岗位分析」中运行一次诊断。
            </p>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => setSelectedId(session.id)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border transition-colors"
                style={{
                  borderColor: activeSessionId === session.id ? 'var(--color-primary)' : 'var(--color-border)',
                  background: activeSessionId === session.id ? 'var(--color-primary-subtle)' : 'var(--color-bg-surface)',
                  color: activeSessionId === session.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                }}
              >
                {session.target_role} · {session.match_score}%
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border p-5 mb-8" style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}>
        <h3 className="font-bold mb-4">手动添加面试卡</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input label="问题" value={manualQuestion} onChange={(e) => setManualQuestion(e.target.value)} placeholder="例如：请描述一次你推动跨团队落地的经历。" />
          <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Textarea label="参考回答" value={manualAnswer} onChange={(e) => setManualAnswer(e.target.value)} className="min-h-[120px]" />
            <Textarea label="备注" value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} className="min-h-[120px]" />
          </div>
        </div>
        <Button className="mt-4" loading={createMutation.isPending} disabled={!manualQuestion.trim()} onClick={() => createMutation.mutate({ question: manualQuestion, ideal_answer: manualAnswer, notes: manualNotes, session_id: activeSessionId })}>
          保存面试卡
        </Button>
      </div>

      <div id="interview-prep-list" className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input label="搜索" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="问题、答案或备注" />
        </div>
        <div className="w-full sm:w-48">
          <label className="text-xs font-semibold mb-1 block">状态</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | InterviewPrep['status'])}
            className="w-full h-11 px-3 rounded-xl text-sm border"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}
          >
            <option value="all">全部</option>
            <option value="pending">待完善</option>
            <option value="prepared">已准备</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm py-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
          加载中…
        </div>
      ) : prepItems.length === 0 ? (
        <EmptyState icon="record_voice_over" title="暂无面试卡" description="从分析生成题目，或手动添加一条面试问答。" />
      ) : filteredPrep.length === 0 ? (
        <EmptyState icon="search" title="没有匹配的记录" description="试试调整筛选条件。" />
      ) : (
        <div className="grid grid-cols-1 gap-4">
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
        </div>
      )}
    </PageContainer>
  );
}
