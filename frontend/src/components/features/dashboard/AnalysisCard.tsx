import { useNavigate } from 'react-router-dom';
import type { SessionSummary } from '../../../services/analysis';

interface AnalysisCardProps {
  session?: SessionSummary;
  isNewAnalysis?: boolean;
  onNewAnalysis?: () => void;
}

export function AnalysisCard({ session, isNewAnalysis, onNewAnalysis }: AnalysisCardProps) {
  const navigate = useNavigate();

  if (isNewAnalysis) {
    return (
      <div
        className="rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer h-64 border-2 border-dashed transition-all duration-300 hover:border-[var(--color-primary)]/30"
        style={{
          background: 'var(--color-surface-container)',
          borderColor: 'var(--color-outline-variant)',
        }}
        onClick={onNewAnalysis}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
          style={{
            background: 'var(--color-surface-container-low)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--color-primary)' }}>upload_file</span>
        </div>
        <p className="font-bold" style={{ color: 'var(--color-on-surface)' }}>Run New Analysis</p>
        <p className="text-xs mt-2 max-w-[160px]" style={{ color: 'var(--color-on-surface-variant)' }}>
          Upload a PDF job description or paste a URL to begin.
        </p>
      </div>
    );
  }

  if (!session) return null;

  const scoreVariant = session.match_score >= 80 ? 'success' : session.match_score >= 60 ? 'info' : 'warning';
  const scoreBg = scoreVariant === 'success' ? 'rgba(5,150,105,0.1)' : scoreVariant === 'info' ? 'rgba(53,37,205,0.1)' : 'rgba(217,119,6,0.1)';
  const scoreColor = scoreVariant === 'success' ? 'var(--color-success)' : scoreVariant === 'info' ? 'var(--color-primary)' : 'var(--color-warning)';

  const createdDate = new Date(session.created_at);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const agoLabel = diffDays === 0 ? 'Today' : diffDays === 1 ? '1d ago' : `${diffDays}d ago`;

  return (
    <div
      className="rounded-xl p-6 flex flex-col justify-between h-64 cursor-pointer transition-all duration-300 hover:bg-[var(--color-surface-container-lowest)]"
      style={{ background: 'var(--color-surface-container-low)' }}
      onClick={() => navigate(`/analyze/${session.id}`)}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-surface-container-lowest)' }}
          >
            <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-on-surface-variant)' }}>
              {session.company ? 'business' : 'work'}
            </span>
          </div>
          <span
            className="text-[10px] font-bold px-3 py-1 rounded-full"
            style={{ background: scoreBg, color: scoreColor }}
          >
            {session.match_score}% MATCH
          </span>
        </div>
        <h4 className="text-lg font-bold leading-tight" style={{ color: 'var(--color-on-surface)' }}>
          {session.target_role}
        </h4>
        <p className="text-sm mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
          {session.company || 'Unknown Company'}
        </p>
      </div>

      <div
        className="pt-4 flex justify-between items-center"
        style={{ borderTop: '1px solid var(--color-outline-variant)' }}
      >
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>
          Analyzed {agoLabel}
        </p>
        <div className="flex -space-x-1">
          <div
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-black"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', borderColor: 'var(--color-surface-container-lowest)' }}
          >
            AI
          </div>
          <div
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-black"
            style={{ background: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface-variant)', borderColor: 'var(--color-surface-container-lowest)' }}
          >
            +3
          </div>
        </div>
      </div>
    </div>
  );
}
