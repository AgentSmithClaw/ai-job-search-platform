import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Briefcase, GraduationCap, Target, ArrowRight } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MatchScoreBadge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuthStore } from '../store';
import { getDashboard, getSessions } from '../services/analysis';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-primary-subtle)] flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-[var(--color-primary)]" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-[var(--color-text)] leading-none">{value}</p>
        <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-[var(--color-text-tertiary)]">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', { limit: 6 }],
    queryFn: () => getSessions({ limit: 6 }),
  });

  const isLoading = statsLoading || sessionsLoading;
  const sessions = sessionsData?.sessions ?? [];

  return (
    <PageContainer>
      <PageHeader
        title={`你好，${user?.name || '用户'}`}
        description="开始你的下一次求职差距分析"
        action={
          <Button onClick={() => navigate('/analyze')} size="md">
            <Plus size={13} strokeWidth={2.5} />
            新建分析
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {isLoading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          <>
            <StatCard icon={Target} label="总分析次数" value={stats?.analyses_total ?? 0} sub={`本周 ${stats?.analyses_week ?? 0} 次`} />
            <StatCard icon={ArrowRight} label="平均匹配度" value={`${stats?.avg_match ?? 0}%`} />
            <StatCard icon={Briefcase} label="投递追踪" value={stats?.applications ?? 0} />
            <StatCard icon={GraduationCap} label="学习任务" value={stats?.tasks ?? 0} />
          </>
        )}
      </div>

      {/* Recent Sessions */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-[var(--color-text)]">最近分析</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/history')} className="text-[11px]">
            查看全部 →
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : sessions.length === 0 ? (
          <Card>
            <EmptyState
              icon="📊"
              title="还没有分析记录"
              description="上传简历 + 粘贴 JD，AI 自动分析差距、生成定制简历"
              action={{ label: '开始分析', onClick: () => navigate('/analyze') }}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {sessions.map((session) => (
              <Card
                key={session.id}
                hoverable
                padding={false}
                onClick={() => navigate(`/analyze/${session.id}`)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--color-text)] truncate leading-tight">{session.target_role}</p>
                      {session.company && (
                        <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{session.company}</p>
                      )}
                    </div>
                    <MatchScoreBadge score={session.match_score} />
                  </div>
                  <p className="text-[12px] text-[var(--color-text-secondary)] line-clamp-2 mt-1 leading-snug">{session.summary}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2">
                    {new Date(session.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-[13px] font-semibold text-[var(--color-text)] mb-3">快捷操作</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/analyze')}>
            <Plus size={12} /> 新建分析
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/applications')}>
            <Briefcase size={12} /> 投递追踪
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/tasks')}>
            <GraduationCap size={12} /> 学习任务
          </Button>
        </div>
      </section>
    </PageContainer>
  );
}
