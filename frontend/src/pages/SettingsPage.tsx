import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuthStore, useThemeStore } from '../store';
import { updateProfile } from '../services/auth';
import { useToastStore } from '../store';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { addToast } = useToastStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; email: string }) => updateProfile(data),
    onSuccess: updated => {
      setUser(updated);
      addToast({ type: 'success', message: '个人信息已更新' });
    },
    onError: () => addToast({ type: 'error', message: '更新失败' }),
  });

  const handleSave = () => updateMutation.mutate({ name, email });

  return (
    <PageContainer>
      <PageHeader title="设置" description="管理账户和偏好设置" />

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <Card>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            个人信息
          </h3>
          <div className="space-y-4">
            <Input
              label="姓名"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Input
              label="邮箱"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              loading={updateMutation.isPending}
            >
              保存更改
            </Button>
          </div>
        </Card>

        {/* Appearance */}
        <Card>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            外观
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                深色模式
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                切换浅色 / 深色主题
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
              style={{
                background: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-border-strong)',
              }}
              aria-label="切换深色模式"
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                style={{
                  transform: theme === 'dark' ? 'translateX(24px)' : 'translateX(4px)',
                }}
              />
            </button>
          </div>
        </Card>

        {/* Account */}
        <Card>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            账户信息
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>邮箱</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {user?.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>剩余额度</span>
              <Badge variant="primary">{user?.credits ?? 0} 次</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>注册时间</span>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '—'}
              </span>
            </div>
          </div>
        </Card>

        {/* About */}
        <Card>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            关于
          </h3>
          <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>GapPilot Platform — AI 求职差距分析平台</p>
            <p>版本 2.0.0</p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              React + Vite + TypeScript + Tailwind CSS
            </p>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
