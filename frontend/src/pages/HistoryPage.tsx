import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { MatchScoreBadge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { useToastStore } from '../store';
import { getSessions, deleteSession } from '../services/analysis';
import type { SessionSummary } from '../types';

export default function HistoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<SessionSummary | null>(null);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', { offset: page * limit, limit, search }],
    queryFn: () => getSessions({ offset: page * limit, limit, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast({ type: 'success', message: '删除成功' });
      setDeleteTarget(null);
    },
    onError: () => addToast({ type: 'error', message: '删除失败' }),
  });

  const sessions = data?.sessions ?? [];
  const total = data?.total ?? 0;

  return (
    <PageContainer>
      <PageHeader title="分析记录" description={`共 ${total} 条记录`} />

      {/* Search bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 max-w-xs">
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="搜索岗位..."
          />
        </div>
        <span className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          {total} 条记录
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon="analytics"
          title="暂无分析记录"
          description="开始你的第一次求职差距分析"
          action={{ label: '新建分析', icon: 'add', onClick: () => navigate('/analyze') }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map(session => (
              <Card key={session.id} hoverable={true} padding={false} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold truncate"
                      style={{ color: 'var(--color-on-surface)' }}
                    >
                      {session.target_role}
                    </p>
                    {session.company && (
                      <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
                        {session.company}
                      </p>
                    )}
                  </div>
                  <MatchScoreBadge score={session.match_score} />
                </div>

                <p
                  className="text-sm line-clamp-2 mb-4"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  {session.summary}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {new Date(session.created_at).toLocaleDateString('zh-CN')}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="visibility"
                      onClick={() => navigate(`/analyze/${session.id}`)}
                    >
                      查看
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="delete"
                      onClick={() => setDeleteTarget(session)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex justify-center gap-3 mt-8">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                上一页
              </Button>
              <span
                className="flex items-center text-sm"
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                第 {page + 1} / {Math.ceil(total / limit)} 页
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={(page + 1) * limit >= total}
                onClick={() => setPage(p => p + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="确认删除"
        size="sm"
      >
        <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          确定要删除「{deleteTarget?.target_role}」的分析记录吗？此操作无法撤销。
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>取消</Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
          >
            删除
          </Button>
        </ModalFooter>
      </Modal>
    </PageContainer>
  );
}
