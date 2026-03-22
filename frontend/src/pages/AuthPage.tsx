import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Zap, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store';
import { register, saveToken } from '../services/auth';
import type { User } from '../types';

export default function AuthPage() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const mutation = useMutation({
    mutationFn: () => register(email, name),
    onSuccess: (data) => {
      const user: User = { id: data.id, email: data.email, name: data.name, credits: data.credits, created_at: '' };
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
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-primary)] mb-4">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">GapPilot</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">AI 驱动的新一代求职差距分析平台</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">创建账户</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            输入邮箱和姓名即可开始，无需密码
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isValid) mutation.mutate();
            }}
            className="space-y-4"
          >
            <Input
              label="邮箱"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="姓名"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="张三"
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={mutation.isPending}
              disabled={!isValid}
            >
              开始使用 GapPilot
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-xs text-center text-[var(--color-text-tertiary)] mt-4">
            登录即表示你同意我们的服务条款
          </p>
        </div>

        {/* Feature highlights */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: '📊', title: '智能分析', desc: 'AI 精准识别差距' },
            { icon: '✍️', title: '定制简历', desc: '一键生成针对性简历' },
            { icon: '🎯', title: '面试准备', desc: '针对性高频面试题' },
          ].map((f) => (
            <div key={f.title} className="text-center p-3 bg-[var(--color-bg-surface)]/50 rounded-[var(--radius-md)] border border-[var(--color-border)]/30">
              <div className="text-xl mb-1">{f.icon}</div>
              <p className="text-xs font-semibold text-[var(--color-text)]">{f.title}</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
