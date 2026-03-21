import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Share2, GraduationCap, Mic, Copy } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MatchScoreRing } from '../components/ui/Progress';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useToastStore } from '../store';
import { getSession, exportReport } from '../services/analysis';
import type { GapItem } from '../types';

const gapTypeLabels: Record<string, { label: string; variant: 'primary' | 'warning' | 'error' | 'info' | 'neutral' }> = {
  expression: { label: '表达不足', variant: 'info' },
  evidence_missing: { label: '证据缺失', variant: 'warning' },
  skill_gap: { label: '技能缺口', variant: 'error' },
  project_gap: { label: '项目缺口', variant: 'error' },
  unknown: { label: '待确认', variant: 'neutral' },
};

function GapCard({ gap }: { gap: GapItem }) {
  const { addToast } = useToastStore();
  const typeInfo = gapTypeLabels[gap.type] || gapTypeLabels.unknown;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast({ type: 'success', message: '已复制到剪贴板' });
    });
  };

  return (
    <div className={`rounded-[var(--radius-md)] p-4 mb-3 border ${
      gap.severity === 'high'
        ? 'bg-[var(--color-error-subtle)] border-[var(--color-error)]/20'
        : gap.severity === 'medium'
        ? 'bg-[var(--color-warning-subtle)] border-[var(--color-warning)]/20'
        : 'bg-[var(--color-bg-subtle)] border-[var(--color-border)]'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            gap.severity === 'high' ? 'bg-[var(--color-error)] text-white' :
            gap.severity === 'medium' ? 'bg-[var(--color-warning)] text-white' :
            'bg-[var(--color-text-tertiary)] text-white'
          }`}>
            {gap.severity === 'high' ? '高优' : gap.severity === 'medium' ? '中优' : '低优'}
          </span>
          <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
          <span className="text-sm font-semibold text-[var(--color-text)]">{gap.title}</span>
        </div>
        <button
          onClick={() => copyToClipboard(`${gap.title}: ${gap.suggestion}`)}
          className="p-1 rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-border)] transition-colors"
          title="复制"
        >
          <Copy size={14} />
        </button>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-3">{gap.description}</p>
      <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-sm)] p-3 border border-[var(--color-border)]">
        <p className="text-xs font-semibold text-[var(--color-text-tertiary)] mb-1">建议行动</p>
        <p className="text-sm text-[var(--color-text)]">{gap.suggestion}</p>
      </div>
      {gap.related_evidence && gap.related_evidence.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-[var(--color-text-tertiary)] mb-1">相关简历原文</p>
          {gap.related_evidence.map((ev, i) => (
            <p key={i} className="text-xs text-[var(--color-text-secondary)] italic pl-2 border-l-2 border-[var(--color-border)] mt-1">
              "{ev}"
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function ListCard({ title, icon, items, variant = 'default' }: {
  title: string;
  icon: string;
  items: string[];
  variant?: 'success' | 'warning' | 'default';
}) {
  const colorClass = variant === 'success'
    ? 'border-[var(--color-success)]/20 bg-[var(--color-success-subtle)]'
    : variant === 'warning'
    ? 'border-[var(--color-warning)]/20 bg-[var(--color-warning-subtle)]'
    : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)]';

  return (
    <Card padding={false} className={`border ${colorClass}`}>
      <div className="p-4 border-b border-[var(--color-border)]/50 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
        <span className="ml-auto text-xs text-[var(--color-text-tertiary)]">{items.length} 项</span>
      </div>
      <ul className="divide-y divide-[var(--color-border)]/50">
        {items.map((item, i) => (
          <li key={i} className="px-4 py-3 text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
            <span className={`mt-0.5 ${
              variant === 'success' ? 'text-[var(--color-success)]' :
              variant === 'warning' ? 'text-[var(--color-warning)]' :
              'text-[var(--color-text-tertiary)]'
            }`}>
              {variant === 'success' ? '✓' : variant === 'warning' ? '⚠' : '•'}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function AnalysisResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const sessionId = Number(id);

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId),
    enabled: !!sessionId,
  });

  const [showResumeDraft, setShowResumeDraft] = useState(false);

  const handleExport = async (format: 'docx' | 'pdf') => {
    try {
      const blob = await exportReport(sessionId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GapPilot-分析报告-${session?.target_role || sessionId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      addToast({ type: 'success', message: `已导出 ${format.toUpperCase()} 文件` });
    } catch {
      addToast({ type: 'error', message: '导出失败，请重试' });
    }
  };

  const handleShare = () => {
    const text = `GapPilot 分析报告\n岗位：${session?.target_role}\n匹配度：${session?.match_score}%\n${session?.summary}`;
    navigator.clipboard.writeText(text).then(() => {
      addToast({ type: 'success', message: '报告摘要已复制到剪贴板' });
    });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft size={16} /> 返回</Button>
          </div>
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
            <p className="mt-4 text-[var(--color-text-secondary)]">加载中...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !session) {
    return (
      <PageContainer>
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft size={16} /> 返回</Button>
          <div className="mt-8">
            <EmptyState
              icon="❌"
              title="无法加载分析结果"
              description="请检查网络或稍后重试"
              action={{ label: '返回', onClick: () => navigate('/history') }}
            />
          </div>
        </div>
      </PageContainer>
    );
  }

  const score = session.match_score ?? 0;
  const scoreColor = score >= 80 ? 'success' : score >= 60 ? 'info' : score >= 40 ? 'warning' : 'error';
  const scoreLabel = score >= 80 ? '强烈建议投递' : score >= 60 ? '适合投递' : score >= 40 ? '需补齐差距' : '不建议投递';

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/history')}><ArrowLeft size={16} /> 返回</Button>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text)]">{session.target_role}</h1>
              {session.company && <p className="text-sm text-[var(--color-text-secondary)]">{session.company}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/tasks')}>
              <GraduationCap size={14} /> 学习任务
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/interview?analysis=${sessionId}`)}>
              <Mic size={14} /> 面试题
            </Button>
            <Button variant="secondary" size="sm" onClick={handleShare}>
              <Share2 size={14} /> 分享
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleExport('docx')}>
              <Download size={14} /> DOCX
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleExport('pdf')}>
              <Download size={14} /> PDF
            </Button>
          </div>
        </div>

        {/* Hero: Match Score */}
        <Card className="mb-6">
          <div className="flex items-center gap-8">
            <MatchScoreRing score={score} size={140} />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-2xl font-bold text-[var(--color-text)]">{score}%</h2>
                <Badge variant={scoreColor === 'success' ? 'success' : scoreColor === 'info' ? 'primary' : scoreColor === 'warning' ? 'warning' : 'error'}>
                  {scoreLabel}
                </Badge>
                {session.confidence && session.confidence < 70 && (
                  <Badge variant="warning">⚠ 置信度 {session.confidence}</Badge>
                )}
              </div>
              <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">{session.summary}</p>
              {session.routing_mode && (
                <p className="text-xs text-[var(--color-text-tertiary)] mt-2">分析模型：{session.routing_mode}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Strengths / Risks / Gaps */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <ListCard title="优势" icon="💪" items={session.strengths} variant="success" />
          <ListCard title="风险" icon="⚠️" items={session.risks} variant="warning" />
          <div className="flex flex-col">
            <Card className="flex-1 border-[var(--color-error)]/20 bg-[var(--color-error-subtle)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">✕</span>
                <h3 className="font-semibold text-[var(--color-text)]">差距项</h3>
                <span className="ml-auto text-xs text-[var(--color-text-tertiary)]">{session.gaps.length} 项</span>
              </div>
              <div className="space-y-1">
                {session.gaps.slice(0, 5).map((gap) => (
                  <div key={gap.id} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      gap.severity === 'high' ? 'bg-[var(--color-error)]' :
                      gap.severity === 'medium' ? 'bg-[var(--color-warning)]' :
                      'bg-[var(--color-text-tertiary)]'
                    }`} />
                    <span className="truncate">{gap.title}</span>
                  </div>
                ))}
                {session.gaps.length > 5 && (
                  <p className="text-xs text-[var(--color-text-tertiary)]">+{session.gaps.length - 5} 更多</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Evidence Mapping */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">📊 差距行动面板</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">按优先级排序的行动建议</p>
          <div className="space-y-2">
            {session.gaps.map((gap) => (
              <GapCard key={gap.id} gap={gap} />
            ))}
          </div>
        </Card>

        {/* Learning & Interview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <h3 className="font-semibold text-[var(--color-text)] mb-3">📚 学习计划</h3>
            <ul className="space-y-2">
              {session.learning_plan.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                  <span className="text-[var(--color-primary)] mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="font-semibold text-[var(--color-text)] mb-3">🎤 面试重点</h3>
            <ul className="space-y-2">
              {session.interview_focus.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                  <span className="text-[var(--color-primary)] mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Resume Suggestions */}
        <Card className="mb-6">
          <h3 className="font-semibold text-[var(--color-text)] mb-3">✍️ 简历优化建议</h3>
          <div className="space-y-2">
            {session.resume_suggestions.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm text-[var(--color-text-secondary)]">{line}</p>
            ))}
          </div>
        </Card>

        {/* Resume Draft */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--color-text)]">📝 岗位定制简历草稿</h3>
            <Button variant="secondary" size="sm" onClick={() => setShowResumeDraft(true)}>
              查看完整
            </Button>
          </div>
          <pre className="bg-[var(--color-bg-subtle)] rounded-[var(--radius-md)] p-4 text-sm font-mono text-[var(--color-text-secondary)] whitespace-pre-wrap overflow-auto max-h-48">
            {session.resume_draft || '暂无简历草稿'}
          </pre>
          <div className="flex gap-2 mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(session.resume_draft || '');
                addToast({ type: 'success', message: '简历草稿已复制' });
              }}
            >
              <Copy size={14} /> 复制
            </Button>
          </div>
        </Card>

        {/* Next Actions */}
        <Card className="mt-6">
          <h3 className="font-semibold text-[var(--color-text)] mb-3">📋 下一步动作</h3>
          <div className="flex flex-wrap gap-2">
            {session.next_actions.map((action, i) => (
              <Badge key={i} variant="neutral">{action}</Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Resume Draft Modal */}
      <Modal isOpen={showResumeDraft} onClose={() => setShowResumeDraft(false)} title="岗位定制简历草稿" size="lg">
        <pre className="bg-[var(--color-bg-subtle)] rounded-[var(--radius-md)] p-4 text-sm font-mono text-[var(--color-text-secondary)] whitespace-pre-wrap overflow-auto max-h-96">
          {session.resume_draft || '暂无简历草稿'}
        </pre>
        <ModalFooter>
          <Button variant="secondary" onClick={() => {
            navigator.clipboard.writeText(session.resume_draft || '');
            addToast({ type: 'success', message: '已复制到剪贴板' });
          }}>
            <Copy size={14} /> 复制
          </Button>
          <Button variant="primary" onClick={() => setShowResumeDraft(false)}>关闭</Button>
        </ModalFooter>
      </Modal>
    </PageContainer>
  );
}
