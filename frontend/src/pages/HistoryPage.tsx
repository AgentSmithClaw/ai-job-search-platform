import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Eye } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
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
      <PageHeader title="分析记录" description={`共 ${total} 条分析记录`} />

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 max-w-sm">
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="搜索岗位..."
          />
        </div>
        <span className="text-sm text-[var(--color-text-tertiary)]">
          {total} 条记录
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <EmptyState
            icon="📋"
            title="暂无分析记录"
            description="开始你的第一次求职差距分析"
            action={{ label: '新建分析', onClick: () => navigate('/analyze') }}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((session) => (
              <Card key={session.id} hoverable padding={false}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--color-text)] truncate">{session.target_role}</p>
                      {session.company && <p className="text-xs text-[var(--color-text-secondary)]">{session.company}</p>}
                    </div>
                    <MatchScoreBadge score={session.match_score} />
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3">{session.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      {new Date(session.created_at).toLocaleDateString('zh-CN')}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/analyze/${session.id}`)}>
                        <Eye size={14} /> 查看
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(session)}
                        className="hover:text-[var(--color-error)]"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
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
                onClick={() => setPage((p) => p - 1)}
              >
                上一页
              </Button>
              <span className="flex items-center text-sm text-[var(--color-text-secondary)]">
                第 {page + 1} / {Math.ceil(total / limit)} 页
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={(page + 1) * limit >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="确认删除" size="sm">
        <p className="text-sm text-[var(--color-text-secondary)]">
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
