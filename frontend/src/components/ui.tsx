import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow ? (
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-indigo-600">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{description}</p> : null}
    </div>
  );
}

export function HomeSection({
  children,
  className = '',
  ...props
}: ComponentPropsWithoutRef<'section'>) {
  return (
    <section className={`px-6 py-20 sm:px-8 lg:px-10 ${className}`} {...props}>
      {children}
    </section>
  );
}

export function DashboardCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`dashboard-panel glass-card rounded-[28px] ${className}`}>{children}</div>;
}
