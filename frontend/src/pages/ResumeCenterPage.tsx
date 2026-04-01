import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { getSessions } from '../services/analysis';
import { formatDate, relativeTime } from '../utils/format';

export default function ResumeCenterPage() {
  const navigate = useNavigate();
  const { data: sessionsData } = useQuery({
    queryKey: ['sessions', { limit: 12 }],
    queryFn: () => getSessions({ limit: 12 }),
  });
  const sessions = sessionsData?.sessions ?? [];
  const latest = sessions[0];

  return (
    <PageContainer>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
        <div>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
            style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
          >
            AI 驱动的职业枢纽
          </span>
          <h1 className="mt-3 text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--color-text-on-surface)' }}>
            智能简历中心
          </h1>
          <p className="mt-2 text-sm max-w-xl leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            对照行业基准解析经历与关键词，获得可执行的分数与优化策略。上传新版本即可持续对比进步曲线。
          </p>
        </div>
        <Button size="lg" icon="upload_file" onClick={() => navigate('/analyze')}>
          上传并分析简历
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
        <div
          className="rounded-2xl p-6 border"
          style={{ background: '#fff', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
            当前分析快照
          </p>
          {latest ? (
            <>
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-18 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-bg-subtle)' }}
                >
                  <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--color-primary)' }}>
                    description
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate">{latest.target_role}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    最近更新 {relativeTime(latest.created_at)}
                  </p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-black" style={{ color: 'var(--color-primary)' }}>
                      {latest.match_score}
                    </span>
                    <span className="text-sm font-semibold pb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      /100 匹配度
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>
                {latest.summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => navigate(`/analyze/${latest.id}`)}>
                  查看完整报告
                </Button>
                <Button variant="ghost" onClick={() => navigate('/history')}>
                  全部分析记录
                </Button>
              </div>
            </>
          ) : (
            <div className="text-sm py-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
              暂无分析记录。开始上传简历与岗位描述，生成第一份诊断报告。
            </div>
          )}
        </div>

        <div
          className="rounded-2xl p-6 border"
          style={{ background: 'linear-gradient(180deg, #f0f6ff 0%, #fff 100%)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
            成长分析
          </p>
          <h3 className="text-lg font-bold mb-4">版本趋势</h3>
          <div className="flex items-end justify-between gap-2 h-36 px-2 min-h-[120px]">
            {sessions.length === 0 ? (
              <p className="text-sm m-auto" style={{ color: 'var(--color-text-secondary)' }}>
                分析后展示趋势
              </p>
            ) : (
              [...sessions]
                .slice(0, 5)
                .reverse()
                .map((s, idx) => (
                  <div key={s.id} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg min-h-[32px]"
                      style={{
                        height: `${Math.min(120, 32 + s.match_score * 0.85)}px`,
                        background: idx === 0 ? 'var(--gradient-hero)' : 'color-mix(in srgb, var(--color-primary) 38%, transparent)',
                      }}
                    />
                    <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                      {s.match_score}%
                    </span>
                  </div>
                ))
            )}
          </div>
          <p className="mt-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            个人资料曝光与匹配信号会随每次分析更新，建议保持简历与目标岗位同步迭代。
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">分析记录（版本档案）</h2>
          <button type="button" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }} onClick={() => navigate('/history')}>
            查看全部
          </button>
        </div>
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#fff', borderColor: 'var(--color-border)' }}>
          {sessions.length === 0 ? (
            <p className="p-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              暂无历史版本
            </p>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {sessions.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-4 px-4 py-3 hover:bg-[var(--color-bg-subtle)] cursor-pointer" onClick={() => navigate(`/analyze/${s.id}`)}>
                  <span className="material-symbols-outlined text-[var(--color-text-tertiary)]">draft</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{s.target_role}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {formatDate(s.created_at)} · 匹配 {s.match_score}%
                    </p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                    {s.match_score}
                  </span>
                  <span className="material-symbols-outlined text-[var(--color-text-tertiary)]">chevron_right</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
