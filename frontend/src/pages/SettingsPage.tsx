import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuthStore, useThemeStore, useToastStore } from '../store';
import { updateProfile } from '../services/auth';
import { formatDateTime } from '../utils/format';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { addToast } = useToastStore();
  const [name, setName] = useState(user?.name || '');
  const joinedLabel = useMemo(() => (user?.created_at ? formatDateTime(user.created_at) : 'Recently'), [user?.created_at]);

  const updateMutation = useMutation({
    mutationFn: () => updateProfile(name),
    onSuccess: (updated) => {
      setUser({ ...user, ...updated, created_at: user?.created_at } as typeof updated);
      addToast({ type: 'success', message: 'Profile updated.' });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Could not update the profile.' }),
  });

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Manage your account details, interface preferences, and current session status." />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <Card className="xl:col-span-7 p-6 md:p-7">
          <p className="editorial-kicker mb-2">Profile</p>
          <h3 className="text-xl font-bold tracking-tight mb-4">Personal details</h3>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-6">
            <div className="space-y-4 max-w-xl">
              <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
              <Input label="Email" value={user?.email || ''} disabled />
              <Button loading={updateMutation.isPending} onClick={() => updateMutation.mutate()} disabled={!name.trim()}>
                Save changes
              </Button>
            </div>

            <div className="rounded-[var(--radius-xl)] p-5 space-y-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <div>
                <p className="text-sm font-semibold">Workspace profile</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Keep your display name current so reports, exports, and future collaboration features stay consistent.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Joined</span>
                  <span className="text-sm font-medium">{joinedLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Auth mode</span>
                  <Badge variant="primary">Bearer token</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-5 p-6 md:p-7">
          <p className="editorial-kicker mb-2">Appearance</p>
          <h3 className="text-xl font-bold tracking-tight mb-4">Theme preference</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-[var(--radius-xl)] p-4 gap-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <div>
                <p className="font-semibold">Color mode</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Current theme: {theme === 'dark' ? 'Dark' : 'Light'}
                </p>
              </div>
              <Button variant="secondary" onClick={toggleTheme}>
                Toggle theme
              </Button>
            </div>
            <div className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <p className="font-semibold mb-2">Interface principles</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                The workspace keeps a clean, low-noise SaaS layout so analysis, tracking, billing, and interview prep feel like one product instead of separate tools.
              </p>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-6 p-6 md:p-7">
          <p className="editorial-kicker mb-2">Account</p>
          <h3 className="text-xl font-bold tracking-tight mb-4">Account status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <span>Available credits</span>
              <Badge variant="primary">{user?.credits ?? 0} credits</Badge>
            </div>
            <div className="flex items-center justify-between rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <span>Signed-in email</span>
              <span>{user?.email || 'Not signed in'}</span>
            </div>
            <div className="flex items-center justify-between rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
              <span>Storage and session</span>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Local browser session</span>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-6 p-6 md:p-7">
          <p className="editorial-kicker mb-2">Workspace actions</p>
          <h3 className="text-xl font-bold tracking-tight mb-4">Billing, history, and access</h3>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Review your order history, reopen past analyses, or sign out of the current browser session when needed.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" icon="receipt_long" onClick={() => navigate('/billing')}>
                Open billing
              </Button>
              <Button variant="secondary" icon="history" onClick={() => navigate('/history')}>
                View history
              </Button>
              <Button variant="ghost" icon="logout" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
