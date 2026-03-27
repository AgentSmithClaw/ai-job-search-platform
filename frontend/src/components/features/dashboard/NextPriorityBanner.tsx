import { useNavigate } from 'react-router-dom';

interface NextPriorityBannerProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
}

export function NextPriorityBanner({ title, description, actionLabel = 'Take Action', actionPath = '/analyze' }: NextPriorityBannerProps) {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-xl p-6 flex items-center justify-between min-h-[160px]"
      style={{
        background: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            boxShadow: '0 4px 16px rgba(53,37,205,0.2)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>auto_awesome</span>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--color-on-surface)' }}>{title}</p>
          <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>{description}</p>
        </div>
      </div>
      <button
        className="text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
        style={{ color: 'var(--color-primary)' }}
        onClick={() => navigate(actionPath)}
      >
        {actionLabel}
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    </div>
  );
}
