import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-xs)]',
  secondary: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-border)] hover:border-[var(--color-border-strong)]',
  ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]',
  danger: 'bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-[12px] gap-1.5',
  md: 'h-8 px-3 text-[12px] gap-1.5',
  lg: 'h-9 px-4 text-[13px] gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center font-medium rounded-[var(--radius-md)]
          transition-all duration-100 ease-out cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-[0.98]
          whitespace-nowrap
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <span className="inline-block w-3.5 h-3.5 border-[1.5px] border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
