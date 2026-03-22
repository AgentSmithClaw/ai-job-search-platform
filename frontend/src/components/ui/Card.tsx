import { type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
  hoverable?: boolean;
}

export function Card({ padding = true, hoverable = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--color-bg-surface)]
        border border-[var(--color-border)]
        rounded-[var(--radius-lg)]
        shadow-[var(--shadow-xs)]
        ${padding ? 'p-5' : ''}
        ${hoverable ? 'cursor-pointer card-hover ' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <h3 className={`text-sm font-semibold text-[var(--color-text)] ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <p className={`text-[12px] text-[var(--color-text-secondary)] mt-0.5 ${className}`}>
      {children}
    </p>
  );
}
