import { type HTMLAttributes } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'secondary';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border border-[var(--color-success-border)]',
  warning: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border border-[var(--color-warning-border)]',
  error: 'bg-[var(--color-error-subtle)] text-[var(--color-error)] border border-[var(--color-error-border)]',
  info: 'bg-[var(--color-info-subtle)] text-[var(--color-info)] border border-[color-mix(in_srgb,var(--color-info)_20%,transparent)]',
  neutral: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
  primary: 'bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)] border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]',
  secondary: 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]',
};

export function Badge({ variant = 'neutral', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-1
        text-[11px] font-semibold rounded-[var(--radius-full)]
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
  const label = score >= 80 ? 'Strong Match' : score >= 60 ? 'Promising' : score >= 40 ? 'Needs Work' : 'High Risk';
  return <Badge variant={variant}>{label} · {score}%</Badge>;
}
