import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { register, saveToken } from '../services/auth';
import { useAuthStore, useToastStore } from '../store';
import type { User } from '../types';

const HERO_METRICS = [
  { value: '10x', label: 'faster role-fit diagnosis' },
  { value: '3 min', label: 'from upload to action plan' },
  { value: '1 hub', label: 'analysis, tasks, applications, interview prep' },
];

const FEATURE_CARDS = [
  {
    eyebrow: 'Resume vs JD',
    title: 'Find the real gap before you apply',
    description: 'GapPilot compares your resume with a target job description and highlights strengths, evidence gaps, and missing capabilities in one pass.',
    points: ['Structured match score', 'Evidence-based gaps', 'Role-specific summary'],
    icon: 'analytics',
  },
  {
    eyebrow: 'Action system',
    title: 'Convert analysis into next steps',
    description: 'Turn weak spots into learning tasks, application notes, and interview talking points so reports do not die in your downloads folder.',
    points: ['Learning task queue', 'Application tracking', 'Interview prompts'],
    icon: 'checklist',
  },
  {
    eyebrow: 'Decision support',
    title: 'See where to spend your effort',
    description: 'A clean dashboard shows credits, recent reports, pipeline activity, and what deserves attention now.',
    points: ['Operational dashboard', 'Reusable project structure', 'Clear visual hierarchy'],
    icon: 'space_dashboard',
  },
];

const PROCESS_STEPS = [
  {
    id: '01',
    title: 'Bring your materials',
    description: 'Upload your resume, paste the JD, and tell GapPilot which role you want to win.',
  },
  {
    id: '02',
    title: 'Get a structured diagnosis',
    description: 'Review match score, strengths, high-risk gaps, and supporting evidence in a report built for decisions.',
  },
  {
    id: '03',
    title: 'Move directly into execution',
    description: 'Push findings into learning tasks, application tracking, and interview preparation without context-switching.',
  },
];

const DASHBOARD_PREVIEW = [
  {
    title: 'Resume Match',
    value: '82%',
    note: 'Strong fit for Product Growth Manager',
    tone: 'primary',
  },
  {
    title: 'Critical Gaps',
    value: '03',
    note: 'Attribution modeling, experimentation depth, retention playbooks',
    tone: 'warning',
  },
  {
    title: 'Next Move',
    value: 'Mock interview',
    note: 'Build evidence stories before round two',
    tone: 'neutral',
  },
] as const;

function MarketingPreviewCard({
  title,
  value,
  note,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  tone: 'primary' | 'warning' | 'neutral';
}) {
  const accent = tone === 'primary' ? 'var(--color-primary)' : tone === 'warning' ? 'var(--color-tertiary)' : 'var(--color-text)';

  return (
    <div
      className="rounded-[28px] p-5 md:p-6"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,242,255,0.9))',
        border: '1px solid color-mix(in srgb, var(--color-outline-variant) 42%, transparent)',
        boxShadow: '0 24px 48px rgba(53, 37, 205, 0.08)',
      }}
    >
      <p className="editorial-kicker mb-3">{title}</p>
      <p className="text-[30px] md:text-[36px] leading-none font-black tracking-tight" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-3 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
        {note}
      </p>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const { addToast } = useToastStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const isValid = useMemo(() => email.includes('@') && name.trim().length >= 2, [email, name]);

  const mutation = useMutation({
    mutationFn: () => register(email, name),
    onSuccess: (data) => {
      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        credits: data.credits,
      };
      saveToken(data.access_token);
      setToken(data.access_token);
      setUser(user);
      addToast({ type: 'success', message: 'Workspace ready.' });
      navigate('/dashboard');
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Could not create account.' }),
  });

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--color-bg-base)' }}>
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 xl:px-10 pb-14 md:pb-20">
        <header className="flex items-center justify-between gap-4 py-6 md:py-8">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-[16px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #5b4eff 0%, #3525cd 100%)', boxShadow: '0 14px 30px rgba(53,37,205,0.24)' }}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ color: 'white' }}>
                north_east
              </span>
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">GapPilot</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                AI job search operating system
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Badge variant="primary">New landing redesign</Badge>
            <Button variant="ghost" onClick={() => document.getElementById('signup-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
              Get started
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_420px] gap-6 xl:gap-8 items-stretch pt-4 md:pt-8">
          <div
            className="relative overflow-hidden rounded-[36px] md:rounded-[44px] px-6 py-7 md:px-10 md:py-10 xl:px-12 xl:py-12"
            style={{
              background:
                'radial-gradient(circle at 14% 18%, rgba(255,255,255,0.95), transparent 24%), radial-gradient(circle at 86% 12%, rgba(195,192,255,0.62), transparent 20%), linear-gradient(135deg, #f5f2ff 0%, #f8f6ff 48%, #eeebff 100%)',
              border: '1px solid color-mix(in srgb, var(--color-outline-variant) 38%, transparent)',
              boxShadow: '0 30px 80px rgba(53, 37, 205, 0.1)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute right-[-70px] top-[-40px] w-[240px] h-[240px] rounded-full bg-[rgba(91,78,255,0.10)] blur-3xl" />
              <div className="absolute left-[12%] bottom-[-80px] w-[280px] h-[180px] rounded-full bg-[rgba(255,182,149,0.18)] blur-3xl" />
            </div>

            <div className="relative">
              <Badge variant="primary" className="px-3 py-1.5 text-[10px] tracking-[0.16em] uppercase">
                Official site
              </Badge>

              <h1 className="mt-5 max-w-[820px] text-[42px] leading-[0.98] md:text-[64px] xl:text-[82px] font-black tracking-[-0.05em] text-[var(--color-text-on-surface)]">
                Turn every job analysis into a sharper application strategy.
              </h1>

              <p className="mt-5 max-w-[680px] text-base md:text-lg leading-7" style={{ color: 'var(--color-text-secondary)' }}>
                GapPilot connects resume diagnosis, application planning, learning tasks, and interview prep in one clean workflow. You stop collecting advice and start acting on evidence.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" icon="arrow_forward" iconPosition="right" onClick={() => document.getElementById('signup-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                  Start free workspace
                </Button>
                <Button size="lg" variant="secondary" icon="space_dashboard" onClick={() => navigate('/dashboard')}>
                  Preview console
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                {HERO_METRICS.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] p-4 md:p-5"
                    style={{
                      background: 'rgba(255,255,255,0.72)',
                      border: '1px solid rgba(255,255,255,0.7)',
                      boxShadow: '0 10px 30px rgba(53,37,205,0.06)',
                    }}
                  >
                    <p className="text-[28px] md:text-[34px] leading-none font-black tracking-tight">{item.value}</p>
                    <p className="mt-2 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside
            id="signup-card"
            className="rounded-[32px] md:rounded-[36px] p-5 md:p-7 xl:p-8 self-start xl:sticky xl:top-8"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,242,255,0.92))',
              border: '1px solid color-mix(in srgb, var(--color-outline-variant) 40%, transparent)',
              boxShadow: '0 28px 56px rgba(27,27,36,0.08)',
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <p className="editorial-kicker mb-2">Get access</p>
                <h2 className="text-[30px] leading-[1.02] font-black tracking-tight">Create your workspace</h2>
              </div>
              <div className="w-12 h-12 rounded-[18px] flex items-center justify-center bg-[var(--color-primary-fixed)] text-[var(--color-primary)]">
                <span className="material-symbols-outlined">rocket_launch</span>
              </div>
            </div>

            <p className="text-sm leading-6 mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              New accounts receive trial credits. Register once, run your first analysis, and move directly into your dashboard.
            </p>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (isValid) mutation.mutate();
              }}
            >
              <Input label="Work email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
              <Input label="Your name" value={name} onChange={(event) => setName(event.target.value)} placeholder="How should GapPilot address you?" />
              <Button type="submit" className="w-full" size="lg" loading={mutation.isPending} disabled={!isValid}>
                Enter GapPilot
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              {[
                'Upload resume + job description',
                'Get a role-fit report with gaps and strengths',
                'Continue into dashboard, tasks, and interview prep',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[20px] px-4 py-3" style={{ background: 'var(--color-surface-container-low)' }}>
                  <span className="material-symbols-outlined text-[18px] mt-0.5" style={{ color: 'var(--color-primary)' }}>
                    check_circle
                  </span>
                  <p className="text-sm leading-6">{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-8 md:mt-10 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {DASHBOARD_PREVIEW.map((item) => (
              <MarketingPreviewCard key={item.title} {...item} />
            ))}
          </div>

          <div
            className="rounded-[32px] p-6 md:p-7"
            style={{
              background: 'linear-gradient(180deg, rgba(18,18,31,0.96), rgba(35,37,57,0.96))',
              boxShadow: '0 24px 60px rgba(17, 24, 39, 0.26)',
            }}
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="editorial-kicker text-white/60 mb-2">Dashboard preview</p>
                <h3 className="text-[28px] leading-tight font-black tracking-tight text-white">One console for the whole search</h3>
              </div>
              <div className="w-12 h-12 rounded-[18px] flex items-center justify-center bg-white/10 text-white">
                <span className="material-symbols-outlined">monitoring</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Recent reports', value: '4 active roles' },
                { label: 'Applications', value: '12 tracked' },
                { label: 'Learning tasks', value: '7 in progress' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-[20px] px-4 py-3 bg-white/6 border border-white/8">
                  <span className="text-sm text-white/72">{row.label}</span>
                  <span className="text-sm font-semibold text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 md:mt-24">
          <div className="max-w-[760px]">
            <p className="editorial-kicker mb-3">Core capabilities</p>
            <h2 className="text-[34px] md:text-[52px] leading-[1.02] font-black tracking-[-0.04em]">
              Designed like a product, not a pile of disconnected AI tricks.
            </h2>
            <p className="mt-4 text-base md:text-lg leading-7" style={{ color: 'var(--color-text-secondary)' }}>
              The landing page focuses on one promise: get clarity fast, then move into execution. Every module below supports that narrative.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {FEATURE_CARDS.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[30px] p-6 md:p-7"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,242,255,0.88))',
                  border: '1px solid color-mix(in srgb, var(--color-outline-variant) 35%, transparent)',
                  boxShadow: '0 18px 44px rgba(27,27,36,0.06)',
                }}
              >
                <div className="w-12 h-12 rounded-[18px] flex items-center justify-center mb-5" style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}>
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </div>
                <p className="editorial-kicker mb-3">{feature.eyebrow}</p>
                <h3 className="text-[26px] leading-[1.08] font-black tracking-tight">{feature.title}</h3>
                <p className="mt-4 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                  {feature.description}
                </p>
                <div className="mt-5 space-y-3">
                  {feature.points.map((point) => (
                    <div key={point} className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-[18px] text-[var(--color-primary)]">subdirectory_arrow_right</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 md:mt-24 grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6 md:gap-8 items-start">
          <div>
            <p className="editorial-kicker mb-3">Workflow</p>
            <h2 className="text-[34px] md:text-[52px] leading-[1.02] font-black tracking-[-0.04em]">
              A homepage that explains the product in three moves.
            </h2>
            <p className="mt-4 text-base md:text-lg leading-7 max-w-[620px]" style={{ color: 'var(--color-text-secondary)' }}>
              The design language stays soft and editorial, while the structure remains product-first: import input, review diagnosis, act on the result.
            </p>
          </div>

          <div className="space-y-4 md:space-y-5">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.id}
                className="rounded-[28px] p-5 md:p-6 flex gap-4 md:gap-5"
                style={{
                  background: 'rgba(255,255,255,0.78)',
                  border: '1px solid color-mix(in srgb, var(--color-outline-variant) 32%, transparent)',
                  boxShadow: '0 16px 40px rgba(27,27,36,0.05)',
                }}
              >
                <div className="w-14 h-14 rounded-[20px] flex items-center justify-center text-lg font-black shrink-0" style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}>
                  {step.id}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm md:text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
