import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuthStore, useThemeStore, useToastStore } from '../store';
import { updateProfile } from '../services/auth';

export default function SettingsPage() {
  const { user, setUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { addToast } = useToastStore();
  const [name, setName] = useState(user?.name || '');

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
        <Card className="xl:col-span-7 p-6">
          <p className="editorial-kicker mb-2">Profile</p>
          <h3 className="text-xl font-bold tracking-tight mb-4">Personal details</h3>
          <div className="space-y-4 max-w-xl">
            <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
            <Input label="Email" value={user?.email || ''} disabled />
            <Button loading={updateMutation.isPending} onClick={() => updateMutation.mutate()} disabled={!name.trim()}>
              Save changes
            </Button>
          </div>
        </Card>

        <Card className="xl:col-span-5 p-6">
          <p className="editorial-kicker mb-2">Appearance</p>
          <h3 className="text-xl font-bold tracking-tight mb-4">Theme preference</h3>
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
        </Card>

        <Card className="xl:col-span-6 p-6">
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
          </div>
        </Card>

        <Card className="xl:col-span-6 p-6">
          <p className="editorial-kicker mb-2">Session</p>
          <h3 className="text-xl font-bold tracking-tight mb-4">Login and access</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            If you need to switch accounts or clear the current local session, you can sign out here.
          </p>
          <Button variant="ghost" icon="logout" onClick={logout}>
            Sign out
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
}
