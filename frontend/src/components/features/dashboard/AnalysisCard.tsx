import { useNavigate } from 'react-router-dom';
import type { SessionSummary } from '../../../types';

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
        className="rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer h-64 border-2 border-dashed transition-all duration-300"
        style={{ background: 'var(--color-surface-container)', borderColor: 'var(--color-outline-variant)' }}
        onClick={onNewAnalysis}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--color-surface-container-low)' }}>
          <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--color-primary)' }}>upload_file</span>
        </div>
        <p className="font-bold">开始新的分析</p>
        <p className="text-xs mt-2 max-w-[160px]" style={{ color: 'var(--color-on-surface-variant)' }}>
          上传简历并粘贴岗位描述，生成下一份匹配报告。
        </p>
      </div>
    );
  }

  if (!session) return null;

  const createdDate = new Date(session.created_at);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const agoLabel = diffDays === 0 ? '今天' : diffDays === 1 ? '1 天前' : `${diffDays} 天前`;

  return (
    <div
      className="rounded-xl p-6 flex flex-col justify-between h-64 cursor-pointer transition-all duration-300 hover:bg-[var(--color-surface-container-lowest)]"
      style={{ background: 'var(--color-surface-container-low)' }}
      onClick={() => navigate(`/analyze/${session.id}`)}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-surface-container-lowest)' }}>
            <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-on-surface-variant)' }}>work</span>
          </div>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(53,37,205,0.1)', color: 'var(--color-primary)' }}>
            {session.match_score}% MATCH
          </span>
        </div>
        <h4 className="text-lg font-bold leading-tight">{session.target_role}</h4>
        <p className="text-sm mt-2 line-clamp-3" style={{ color: 'var(--color-on-surface-variant)' }}>
          {session.summary}
        </p>
      </div>

      <div className="pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--color-outline-variant)' }}>
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>
          {agoLabel}
        </p>
        <div className="flex -space-x-1">
          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-black" style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', borderColor: 'var(--color-surface-container-lowest)' }}>
            AI
          </div>
          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-black" style={{ background: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface-variant)', borderColor: 'var(--color-surface-container-lowest)' }}>
            +1
          </div>
        </div>
      </div>
    </div>
  );
}
