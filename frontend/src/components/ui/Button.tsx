import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'text-[var(--color-on-primary)] hover:opacity-92 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 shadow-[var(--shadow-sm)]',
  secondary:
    'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] border border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-high)] hover:border-[var(--color-outline)]',
  ghost:
    'bg-transparent text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-on-surface)]',
  danger:
    'bg-[var(--color-error)] text-[var(--color-on-error)] hover:opacity-90',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-6 text-sm gap-2 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  children,
  className = '',
  disabled,
  style: externalStyle,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={[
        'inline-flex items-center justify-center font-semibold transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      style={
        variant === 'primary'
          ? { background: 'var(--gradient-hero)', ...externalStyle }
          : externalStyle
      }
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="material-symbols-outlined text-base flex-shrink-0">{icon}</span>
          )}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && (
            <span className="material-symbols-outlined text-base flex-shrink-0">{icon}</span>
          )}
        </>
      )}
    </button>
  );
}
