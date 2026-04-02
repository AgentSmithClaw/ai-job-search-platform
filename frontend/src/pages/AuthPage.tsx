import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, FileSearch, GraduationCap, MessagesSquare, Target } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { WorkspaceSignupCard } from '../components/marketing/WorkspaceSignupCard';
import { useAuthStore } from '../store';

const FEATURE_BLOCKS = [
  {
    icon: FileSearch,
    title: '岗位匹配分析',
    description: '上传简历并粘贴岗位描述，快速得到结构化的匹配结果与关键缺口。',
  },
  {
    icon: GraduationCap,
    title: '学习与补强计划',
    description: '把短板转成明确的学习任务，而不是模糊建议。',
  },
  {
    icon: MessagesSquare,
    title: '面试准备与执行',
    description: '围绕报告里的证据和风险点，提前准备更具体的面试表达。',
  },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-base)' }}>
      <div className="mx-auto max-w-[1380px] px-4 md:px-8 xl:px-10 py-6 md:py-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-[16px] flex items-center justify-center"
              style={{
                background: 'var(--gradient-hero)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <Target size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">GapPilot</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                AI 求职分析工作台
              </p>
            </div>
          </div>

          <Button variant="ghost" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_430px] gap-6 xl:gap-8 items-start pt-8 md:pt-10">
          <section
            className="relative overflow-hidden rounded-[36px] md:rounded-[44px] px-6 py-7 md:px-10 md:py-10 xl:px-12 xl:py-12"
            style={{
              background:
                'radial-gradient(circle at 14% 18%, color-mix(in srgb, white 95%, transparent), transparent 24%), radial-gradient(circle at 86% 12%, color-mix(in srgb, var(--color-primary) 62%, transparent), transparent 20%), linear-gradient(135deg, var(--color-surface-container) 0%, var(--color-surface-container-low) 48%, var(--color-surface-container-high) 100%)',
              border: '1px solid color-mix(in srgb, var(--color-outline-variant) 38%, transparent)',
              boxShadow: '0 30px 80px color-mix(in srgb, var(--color-primary) 10%, transparent)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute right-[-70px] top-[-40px] w-[240px] h-[240px] rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] blur-3xl" />
              <div className="absolute left-[12%] bottom-[-80px] w-[280px] h-[180px] rounded-full bg-[color-mix(in_srgb,var(--color-tertiary)_18%,transparent)] blur-3xl" />
            </div>

            <div className="relative">
              <Badge variant="primary" className="px-3 py-1.5 text-[10px] tracking-[0.16em] uppercase">
                创建工作区
              </Badge>

              <h1 className="mt-5 max-w-[780px] text-[40px] leading-[1.02] md:text-[60px] xl:text-[72px] font-black tracking-[-0.05em] text-[var(--color-text-on-surface)]">
                先完成注册，
                <br />
                再把你的求职过程
                <br />
                管理成一套系统。
              </h1>

              <p className="mt-5 max-w-[620px] text-base md:text-lg leading-7" style={{ color: 'var(--color-text-secondary)' }}>
                这里不是一次性的简历打分工具。GapPilot 会把分析报告、投递记录、学习任务和面试准备连成同一个工作台，方便你持续推进。
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {FEATURE_BLOCKS.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="rounded-[24px] p-5"
                      style={{
                        background: 'color-mix(in srgb, var(--color-bg-surface) 76%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--color-outline-variant) 40%, transparent)',
                        boxShadow: '0 10px 30px color-mix(in srgb, var(--color-primary) 6%, transparent)',
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-[16px] flex items-center justify-center mb-4"
                        style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}
                      >
                        <Icon size={18} />
                      </div>
                      <p className="text-lg font-bold tracking-tight">{feature.title}</p>
                      <p className="mt-2 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div
                className="mt-6 rounded-[28px] p-5 md:p-6"
                style={{
                  background: 'color-mix(in srgb, var(--color-surface-container-highest) 92%, transparent)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="editorial-kicker text-white/60 mb-2">开始之后你会看到</p>
                    <h2 className="text-[24px] md:text-[28px] leading-tight font-black tracking-tight text-white">
                      报告、任务、投递和面试准备全部汇总在一个面板里。
                    </h2>
                  </div>
                  <CheckCircle2 size={20} className="shrink-0 text-white/80" />
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <div className="flex gap-2">
              <Button
                variant={!showLogin ? 'primary' : 'ghost'}
                onClick={() => setShowLogin(false)}
              >
                注册
              </Button>
              <Button
                variant={showLogin ? 'primary' : 'ghost'}
                onClick={() => setShowLogin(true)}
              >
                登录
              </Button>
            </div>
            {showLogin ? (
              <WorkspaceSignupCard
                eyebrow="登录"
                title="欢迎回来"
                description="输入邮箱和密码登录你的工作台。"
                submitLabel="登录"
                mode="login"
                compact
              />
            ) : (
              <WorkspaceSignupCard
                eyebrow="注册"
                title="立即创建账号"
                description="填写邮箱和姓名即可开始。注册后会获得体验点数，可以直接运行首份岗位分析。"
                submitLabel="注册并进入工作台"
                compact
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
