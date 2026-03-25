import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSessions } from '../services/analysis';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { MatchScoreBadge } from '../components/ui/Badge';
import { formatDate, relativeTime } from '../utils/format';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const limit = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', { offset: page * limit, limit }],
    queryFn: () => getSessions({ offset: page * limit, limit }),
  });

  const sessions = useMemo(() => {
    const items = data?.sessions ?? [];
    if (!search.trim()) return items;
    return items.filter((session) => session.target_role.toLowerCase().includes(search.trim().toLowerCase()));
  }, [data?.sessions, search]);

  return (
    <PageContainer>
      <PageHeader
        title="Analysis history"
        description="Review previous reports, reopen a session, and continue with exports, learning tasks, or interview preparation whenever you need it."
        action={
          <Button icon="add" onClick={() => navigate('/analyze')}>
            New analysis
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by role title" />
        </div>
        <div className="text-sm flex items-center" style={{ color: 'var(--color-text-secondary)' }}>
          {data?.total ?? 0} records
        </div>
      </div>

      {isLoading ? (
        <Card className="p-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Loading analysis history...
        </Card>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon="analytics"
          title="No analysis history yet"
          description="Once you complete your first analysis, the reports will appear here for quick access."
          action={{ label: 'Start analysis', icon: 'add', onClick: () => navigate('/analyze') }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <Card key={session.id} hoverable className="p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{session.target_role}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {formatDate(session.created_at)} · {relativeTime(session.created_at)}
                  </p>
                </div>
                <MatchScoreBadge score={session.match_score} />
              </div>

              <p className="text-sm line-clamp-3 mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                {session.summary}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Used {session.credits_used} credit
                </span>
                <Button variant="secondary" icon="arrow_forward" iconPosition="right" onClick={() => navigate(`/analyze/${session.id}`)}>
                  Open report
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(data?.total ?? 0) > limit && (
        <div className="flex justify-center gap-3 mt-8">
          <Button variant="secondary" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={(page + 1) * limit >= (data?.total ?? 0)}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
