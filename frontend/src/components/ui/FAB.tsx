import { useNavigate } from 'react-router-dom';

interface FABProps {
  icon?: string;
  label?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function FAB({ icon = 'add', onClick, href, className = '' }: FABProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    else if (href) navigate(href);
  };

  return (
    <button
      className={`
        fixed rounded-full flex items-center justify-center
        shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
        transition-all duration-150 z-50
        w-14 h-14
        ${className}
      `}
      style={{
        bottom: 40,
        right: 40,
        background: 'var(--gradient-hero)',
        color: 'var(--color-on-primary)',
        boxShadow: '0 8px 28px color-mix(in srgb, var(--color-primary) 35%, transparent)',
      }}
      onClick={handleClick}
      aria-label="Create new"
    >
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </button>
  );
}
