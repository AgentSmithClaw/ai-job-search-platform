import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store';
import { register, saveToken } from '../services/auth';
import type { User } from '../types';

const FEATURES = [
  { icon: 'analytics', title: '智能分析', desc: 'AI 精准识别差距' },
  { icon: 'description', title: '定制简历', desc: '一键生成针对性简历' },
  { icon: 'psychology', title: '面试准备', desc: '针对性高频面试题' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const mutation = useMutation({
    mutationFn: () => register(email, name),
    onSuccess: data => {
      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        credits: data.credits,
        created_at: '',
      };
      saveToken(data.access_token);
      setToken(data.access_token);
      setUser(user);
      navigate('/');
    },
    onError: (err: Error) => {
      alert(err.message || '注册失败，请重试');
    },
  });

  const isValid = email.includes('@') && name.trim().length >= 2;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Background decorative blobs */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full"
          style={{ background: 'var(--color-primary)', opacity: 0.04 }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
          style={{ background: 'var(--color-primary)', opacity: 0.04 }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
            style={{ background: 'var(--color-primary)' }}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ color: 'var(--color-on-primary)' }}
            >
              trending_up
            </span>
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text)' }}
          >
            GapPilot
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            AI 驱动的新一代求职差距分析平台
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-[var(--color-bg-surface)] border rounded-xl p-6"
          style={{
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h2
            className="text-lg font-semibold mb-1"
            style={{ color: 'var(--color-text)' }}
          >
            创建账户
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            输入邮箱和姓名即可开始，无需密码
          </p>

          <form
            onSubmit={e => {
              e.preventDefault();
              if (isValid) mutation.mutate();
            }}
            className="space-y-4"
          >
            <Input
              label="邮箱"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="姓名"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="张三"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={mutation.isPending}
              disabled={!isValid}
              icon="arrow_forward"
            >
              开始使用 GapPilot
            </Button>
          </form>

          <p
            className="text-xs text-center mt-4"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            登录即表示你同意我们的服务条款
          </p>
        </div>

        {/* Feature highlights */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="text-center p-3 rounded-lg border"
              style={{
                background: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
                opacity: 0.7,
              }}
            >
              <span
                className="material-symbols-outlined text-xl block mb-1"
                style={{ color: 'var(--color-primary)' }}
              >
                {f.icon}
              </span>
              <p
                className="text-xs font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                {f.title}
              </p>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
