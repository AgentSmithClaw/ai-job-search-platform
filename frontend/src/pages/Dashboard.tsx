import { useNavigate } from 'react-router-dom';
import {
  Add,
  TrendingUp,
  Description,
  Warning,
  AutoAwesome,
  ArrowForward,
  ChevronRight,
  UploadFile,
} from '@mui/icons-material';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/Progress';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { getDashboard, getSessions } from '../services/analysis';
import { PageContainer } from '../components/layout/PageContainer';

const MOCK_STATS = { avgMatch: 84, applications: 12, interviews: 8, skillGaps: 3 };
const SKILL_GAP_TAGS = ['Kubernetes', 'Golang', 'Rust'];

interface AnalysisCardProps {
  roleTitle: string;
  company: string;
  matchScore?: number;
  analyzedAgo?: string;
  priority?: ('high' | 'medium' | 'low')[];
  isNewAnalysis?: boolean;
  onClick?: () => void;
}

function AnalysisCard({ roleTitle, company, matchScore, analyzedAgo, priority, isNewAnalysis, onClick }: AnalysisCardProps) {
  if (isNewAnalysis) {
    return (
      <Card hoverable onClick={onClick} style={{ height: 256, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', border: '2px dashed #c7c4d8', background: '#ffffff' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0ecf9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <UploadFile sx={{ fontSize: 28, color: '#3525cd' }} />
        </div>
        <p style={{ fontWeight: 700, color: '#1b1b24' }}>Run New Analysis</p>
        <p style={{ fontSize: 12, color: '#464555', marginTop: 8, maxWidth: 160 }}>Upload a PDF job description or paste a URL to begin.</p>
      </Card>
    );
  }
  return (
    <Card hoverable onClick={onClick} style={{ height: 256, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f0ecf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
          {matchScore !== undefined && <Badge variant={matchScore >= 80 ? 'success' : matchScore >= 60 ? 'info' : 'warning'}>{matchScore}% MATCH</Badge>}
        </div>
        <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1b1b24', lineHeight: 1.3 }}>{roleTitle}</h4>
        <p style={{ fontSize: 13, color: '#464555', marginTop: 4 }}>{company}</p>
      </div>
      <div style={{ padding: '16px 24px', borderTop: '1px solid #f0ecf9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#464555', letterSpacing: '0.05em' }}>ANALYZED {analyzedAgo}</p>
        <div style={{ display: 'flex', gap: 4 }}>
          {priority?.map((p, i) => (
            <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: p === 'high' ? '#ba1a1a' : p === 'medium' ? '#d97706' : '#e4e1ee' }} />
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({ queryKey: ['sessions', { limit: 6 }], queryFn: () => getSessions({ limit: 6 }) });
  const isLoading = statsLoading || sessionsLoading;
  const sessions = sessionsData?.sessions ?? [];
  const avgMatch = stats?.avg_match ?? MOCK_STATS.avgMatch;
  const applications = stats?.applications ?? MOCK_STATS.applications;

  return (
    <PageContainer>
      {/* Welcome */}
      <section style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#464555', textTransform: 'uppercase', marginBottom: 8 }}>Workspace Overview</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#1b1b24', letterSpacing: '-0.02em' }}>Precision Dashboard</h2>
            <p style={{ fontSize: 15, color: '#464555', marginTop: 8 }}>You have {MOCK_STATS.skillGaps} critical skill gaps across {applications} targeted roles.</p>
          </div>
        </div>
      </section>

      {/* Stats Bento */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24, marginBottom: 48 }}>
        {/* Match Score Card */}
        <div style={{ gridColumn: 'span 5', background: '#ffffff', borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 128, height: 128, borderRadius: '50%', background: 'rgba(53,37,205,0.05)', marginRight: -64, marginTop: -64 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#464555', textTransform: 'uppercase' }}>Average Match Score</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 16 }}>
              <span style={{ fontSize: 72, fontWeight: 900, color: '#3525cd', letterSpacing: '-0.03em' }}>{avgMatch}<span style={{ fontSize: 28 }}>%</span></span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#3525cd', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(53,37,205,0.1)', padding: '4px 8px', borderRadius: 6 }}>
                <TrendingUp sx={{ fontSize: 14 }} />+12%
              </span>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#464555', marginTop: 32, maxWidth: 240, position: 'relative', zIndex: 1 }}>
            Your match profile has improved significantly after completing the <span style={{ color: '#1b1b24', fontWeight: 600 }}>Advanced System Design</span> module.
          </p>
        </div>

        {/* Right 2x2 grid */}
        <div style={{ gridColumn: 'span 7', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {/* Active Applications */}
          <div style={{ background: '#ffffff', borderRadius: 12, padding: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(53,37,205,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Description sx={{ color: '#3525cd', fontSize: 20 }} />
            </div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#464555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Active Applications</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#1b1b24', marginTop: 4 }}>{applications}</p>
            <div style={{ marginTop: 16 }}><ProgressBar value={65} size="sm" color="primary" /></div>
            <p style={{ fontSize: 10, color: '#464555', marginTop: 8 }}>{MOCK_STATS.interviews} in interview stage</p>
          </div>

          {/* Critical Skill Gaps */}
          <div style={{ background: '#ffffff', borderRadius: 12, padding: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(126,48,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Warning sx={{ color: '#7e3000', fontSize: 20 }} />
            </div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#464555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Critical Skill Gaps</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#1b1b24', marginTop: 4 }}>{String(MOCK_STATS.skillGaps).padStart(2, '0')}</p>
            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SKILL_GAP_TAGS.map((tag) => <Badge key={tag} variant="warning">{tag}</Badge>)}
            </div>
          </div>

          {/* Next Priority Step */}
          <div style={{ gridColumn: 'span 2', background: '#ffffff', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#3525cd', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(53,37,205,0.3)' }}>
                <AutoAwesome sx={{ fontSize: 20 }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1b1b24' }}>Next Priority Step</p>
                <p style={{ fontSize: 12, color: '#464555' }}>Update your portfolio with the recent "EcoStream" project analysis.</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/analyze')}>
              Take Action <ArrowForward sx={{ fontSize: 14 }} />
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Analyses */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1b1b24', letterSpacing: '-0.01em' }}>Recent Job Analyses</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
            View All Analyses <ChevronRight sx={{ fontSize: 16 }} />
          </Button>
        </div>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : sessions.length === 0 ? (
          <Card style={{ background: '#ffffff' }}>
            <EmptyState icon="📊" title="还没有分析记录" description="上传简历 + 粘贴 JD，AI 自动分析差距、生成定制简历" action={{ label: '开始分析', onClick: () => navigate('/analyze') }} />
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {sessions.slice(0, 2).map((session) => (
              <AnalysisCard key={session.id} matchScore={session.match_score} roleTitle={session.target_role} company={session.company || 'Unknown Company'} analyzedAgo={`${Math.floor(Math.random() * 5) + 1}d`} priority={['high', 'medium', 'low']} onClick={() => navigate(`/analyze/${session.id}`)} />
            ))}
            <AnalysisCard roleTitle="" company="" isNewAnalysis onClick={() => navigate('/analyze')} />
          </div>
        )}
      </section>

      {/* FAB */}
      <button onClick={() => navigate('/analyze')} style={{ position: 'fixed', bottom: 40, right: 40, width: 56, height: 56, borderRadius: '50%', background: '#3525cd', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(53,37,205,0.4)', zIndex: 50, transition: 'transform 0.15s' }}>
        <Add sx={{ fontSize: 24 }} />
      </button>
    </PageContainer>
  );
}
