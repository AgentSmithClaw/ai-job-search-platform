import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { register, saveToken } from '../services/auth';
import { useAuthStore, useToastStore } from '../store';
import type { User } from '../types';

const FEATURES = [
  { icon: 'analytics', title: 'Targeted role analysis', desc: 'Compare your real resume against a real job description and get a structured gap report.' },
  { icon: 'school', title: 'Learning plan', desc: 'Turn the biggest gaps into concrete tasks you can actually finish.' },
  { icon: 'record_voice_over', title: 'Interview prep', desc: 'Generate question sets based on the exact role, gaps, and evidence in your report.' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setUser, setToken } = useAuthStore();
  const { addToast } = useToastStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

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
      addToast({ type: 'success', message: 'Your account is ready.' });
      navigate('/dashboard');
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Could not create the account.' }),
  });

  const valid = email.includes('@') && name.trim().length >= 2;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen grid grid-cols-1 xl:grid-cols-2">
      <section
        className="hidden xl:flex flex-col justify-between p-12"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(195,192,255,0.35), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(240,236,249,0.96) 100%)',
        }}
      >
        <div>
          <Badge variant="primary">GapPilot</Badge>
          <h1 className="text-5xl font-black tracking-tight mt-6 mb-4" style={{ color: 'var(--color-text-on-surface)' }}>
            Build a clearer job search strategy from every analysis.
          </h1>
          <p className="text-lg max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
            Upload a resume, compare it with a target role, and turn the findings into follow-up actions for learning, applications, interviews, and exports.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-[var(--radius-xl)] p-5 app-panel">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-[var(--radius-xl)] flex items-center justify-center" style={{ background: 'var(--color-primary-fixed)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>{feature.icon}</span>
                </div>
                <div>
                  <p className="font-semibold mb-1">{feature.title}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-[24px] p-8 app-panel">
            <p className="editorial-kicker mb-2">Authentication</p>
            <h2 className="text-3xl font-black tracking-tight mb-2">Create your account</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Start with your email and name. New accounts receive trial credits so you can run your first analysis right away.
            </p>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (valid) mutation.mutate();
              }}
            >
              <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
              <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" />
              <Button type="submit" className="w-full" size="lg" loading={mutation.isPending} disabled={!valid}>
                Enter workspace
              </Button>
            </form>

            <div className="mt-6 rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <p className="text-sm font-semibold mb-1">What you can do next</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Upload your resume, run an analysis, review past reports, and turn gaps into learning tasks and interview questions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
