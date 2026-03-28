import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Rocket } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { register, saveToken } from '../../services/auth';
import { useAuthStore, useToastStore } from '../../store';
import type { User } from '../../types';

interface WorkspaceSignupCardProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  highlights?: string[];
  compact?: boolean;
}

const DEFAULT_HIGHLIGHTS = [
  '上传简历与岗位描述，建立这次分析的上下文',
  '生成岗位匹配报告，快速识别优势、短板和风险点',
  '继续进入控制台、学习任务、投递跟进与面试准备',
];

export function WorkspaceSignupCard({
  eyebrow = '立即体验',
  title = '创建你的工作区',
  description = '新账号将获得体验点数。注册后即可开始首份分析，并进入完整的求职执行工作台。',
  submitLabel = '创建并进入工作台',
  highlights = DEFAULT_HIGHLIGHTS,
  compact = false,
}: WorkspaceSignupCardProps) {
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
      addToast({ type: 'success', message: '工作区已创建，正在进入控制台。' });
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      addToast({ type: 'error', message: error.message || '创建账号失败，请稍后重试。' });
    },
  });

  return (
    <aside
      className={`rounded-[32px] md:rounded-[36px] ${compact ? 'p-6 md:p-7' : 'p-5 md:p-7 xl:p-8'} self-start`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,242,255,0.92))',
        border: '1px solid color-mix(in srgb, var(--color-outline-variant) 40%, transparent)',
        boxShadow: '0 28px 56px rgba(27,27,36,0.08)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <p className="editorial-kicker mb-2">{eyebrow}</p>
          <h2 className="text-[28px] md:text-[32px] leading-[1.04] font-black tracking-tight">{title}</h2>
        </div>
        <div
          className="w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}
        >
          <Rocket size={20} />
        </div>
      </div>

      <p className="text-sm leading-6 mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        {description}
      </p>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (isValid) mutation.mutate();
        }}
      >
        <Input
          label="工作邮箱"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
        />
        <Input
          label="你的姓名"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="我们应该怎么称呼你？"
        />
        <Button type="submit" className="w-full" size="lg" loading={mutation.isPending} disabled={!isValid}>
          {submitLabel}
        </Button>
      </form>

      <div className="mt-6 space-y-3">
        {highlights.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-[20px] px-4 py-3"
            style={{ background: 'var(--color-surface-container-low)' }}
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
            <p className="text-sm leading-6">{item}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
