import { type HTMLAttributes } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'secondary';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border border-[var(--color-success-border)]',
  warning: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border border-[var(--color-warning-border)]',
  error: 'bg-[var(--color-error-subtle)] text-[var(--color-error)] border border-[var(--color-error-border)]',
  info: 'bg-[var(--color-info-subtle)] text-[var(--color-info)] border border-[var(--color-info)]/20',
  neutral: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
  primary: 'bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)] border border-[var(--color-primary)]/20',
  secondary: 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]',
};

export function Badge({ variant = 'neutral', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-1.5 py-px
        text-[11px] font-semibold rounded-[var(--radius-sm)]
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

export function MatchScoreBadge({ score }: { score: number }) {
  const variant: BadgeVariant = score >= 80 ? 'success' : score >= 60 ? 'info' : score >= 40 ? 'warning' : 'error';
  const label = score >= 80 ? '强建议投递' : score >= 60 ? '适合投递' : score >= 40 ? '需补差距' : '不建议';
  return <Badge variant={variant}>{label} · {score}%</Badge>;
}
