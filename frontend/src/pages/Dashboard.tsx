import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDashboard, getSessions } from '../services/analysis';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge, MatchScoreBadge } from '../components/ui/Badge';
import { useAuthStore } from '../store';
import { formatDate } from '../utils/format';

const WEEK_BAR = [32, 48, 40, 72, 56, 44];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user: storeUser } = useAuthStore();

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  const { data: sessionsData } = useQuery({
    queryKey: ['sessions', { limit: 6 }],
    queryFn: () => getSessions({ limit: 6 }),
  });

  const user = dashboardData?.user ?? storeUser;
  const stats = dashboardData?.stats;
  const sessions = sessionsData?.sessions ?? [];

  const firstName = user?.name?.split(/\s/)[0] ?? user?.name ?? '伙伴';

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--color-text-on-surface)' }}>
            欢迎回来，{firstName}。
          </h1>
          <p className="mt-2 text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
            AI 已为你梳理 {stats?.total_analyses ?? 0} 次机会信号，本周可优先跟进学习与投递节奏。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate('/history')}>
            分析记录
          </Button>
          <Button icon="add" onClick={() => navigate('/analyze')}>
            新建分析
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 mb-8">
        <div
          className="rounded-2xl p-6 md:p-8 border"
          style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-md)' }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                职业概览
              </p>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="primary">AI · 职业策略</Badge>
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight leading-snug max-w-2xl">
                在目标岗位维度，你的简历信号与岗位关键词整体匹配良好。
              </h2>
              <p className="mt-3 text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
                结合近期分析与投递数据，建议优先补齐报告中的高风险缺口，并把高频技能映射到可验证的项目成果上。
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => navigate('/analyze')}>优化简历 / 分析</Button>
            <Button variant="secondary" onClick={() => navigate('/history')}>
              查看深度报告
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div
            className="rounded-2xl p-5 border"
            style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
              活跃申请
            </p>
            <p className="text-3xl font-black mt-1" style={{ color: 'var(--color-text-on-surface)' }}>
              {stats?.total_applications ?? 0}
            </p>
            <p className="text-xs mt-2 font-semibold text-emerald-600">+ 本周持续更新</p>
          </div>
          <div
            className="rounded-2xl p-5 border"
            style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
              平均匹配度
            </p>
            <p className="text-3xl font-black mt-1" style={{ color: 'var(--color-primary)' }}>
              {Math.round(stats?.average_match_score ?? 0)}%
            </p>
            <Badge variant="success" className="mt-2">
              可继续推进
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl p-6 border" style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">申请频率</h3>
            <div className="flex rounded-lg p-0.5 text-xs font-semibold" style={{ background: 'var(--color-bg-subtle)' }}>
              <span className="px-2 py-1 rounded-md shadow-sm" style={{ background: 'var(--color-bg-surface)' }}>周</span>
              <span className="px-2 py-1" style={{ color: 'var(--color-text-tertiary)' }}>
                月
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {WEEK_BAR.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-lg"
                  style={{
                    height: `${h}%`,
                    background: i === 3 ? 'var(--gradient-hero)' : 'color-mix(in srgb, var(--color-primary) 28%, transparent)',
                  }}
                />
                <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                  {['一', '二', '三', '四', '五', '六'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6 border" style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">即将进行的面试</h3>
            <button
              type="button"
              className="text-xs font-semibold"
              style={{ color: 'var(--color-primary)', opacity: 0.5, cursor: 'not-allowed' }}
              disabled
              title="功能开发中"
            >
              同步日历
            </button>
          </div>
          <div className="space-y-3">
            {sessions.slice(0, 2).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer hover:bg-[var(--color-bg-subtle)]"
                onClick={() => navigate(`/analyze/${s.id}`)}
              >
                <div>
                  <p className="font-semibold">{s.target_role}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    基于最近分析 · {formatDate(s.created_at)}
                  </p>
                </div>
                <Badge variant="info">准备中</Badge>
              </div>
            ))}
            {sessions.length === 0 ? (
              <p className="text-sm py-4" style={{ color: 'var(--color-text-secondary)' }}>
                暂无排期。完成岗位分析后，可在面试页生成模拟题。
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">近期职位分析</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            来自你最近保存的分析会话，可一键回到报告详情。
          </p>
        </div>
        <button type="button" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }} onClick={() => navigate('/history')}>
          查看全部
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sessions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => navigate(`/analyze/${s.id}`)}
            className="text-left rounded-2xl p-5 border transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="font-bold">{s.target_role}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatDate(s.created_at)}
                </p>
              </div>
              <MatchScoreBadge score={s.match_score} />
            </div>
            <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {s.summary}
            </p>
            <span className="inline-flex mt-4 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
              查看报告
            </span>
          </button>
        ))}
        {sessions.length === 0 ? (
          <div className="col-span-full rounded-2xl border p-10 text-center text-sm" style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>
            暂无分析。点击右下角「+」或上方按钮开始第一次岗位诊断。
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
