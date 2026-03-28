import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileSearch,
  LayoutDashboard,
  Sparkles,
  Target,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { WorkspaceSignupCard } from '../components/marketing/WorkspaceSignupCard';
import { useAuthStore } from '../store';

const HERO_METRICS = [
  { value: '10x', label: '更快发现岗位差距' },
  { value: '3 分钟', label: '从上传到行动建议' },
  { value: '1 个工作台', label: '统一管理报告、任务、投递与面试' },
];

const FEATURE_CARDS = [
  {
    eyebrow: '简历 vs JD',
    title: '在投递前先看清真正差距',
    description: 'GapPilot 会对照你的简历与目标岗位描述，提炼匹配分数、优势证据、关键缺口与高风险项。',
    points: ['结构化匹配分数', '有证据支撑的短板', '岗位定制化总结'],
    icon: FileSearch,
  },
  {
    eyebrow: '行动系统',
    title: '把分析结果直接转成下一步',
    description: '报告不会停留在下载文件夹里。你可以继续创建学习任务、维护投递记录并整理面试要点。',
    points: ['学习任务列表', '投递跟踪面板', '面试准备题库'],
    icon: Sparkles,
  },
  {
    eyebrow: '控制台',
    title: '知道此刻最该投入哪里',
    description: '在一个清晰的工作台里查看点数、近期报告、待跟进岗位和优先事项，减少来回切换。',
    points: ['统一作战视图', '清晰的信息层级', '适合长期迭代使用'],
    icon: LayoutDashboard,
  },
];

const PROCESS_STEPS = [
  {
    id: '01',
    title: '准备材料',
    description: '上传简历，粘贴目标岗位 JD，并告诉 GapPilot 你准备争取哪一个岗位。',
  },
  {
    id: '02',
    title: '获得结构化诊断',
    description: '查看匹配分数、关键优势、核心缺口和风险信号，而不是一堆难以执行的建议。',
  },
  {
    id: '03',
    title: '直接进入执行',
    description: '把分析结果延伸到学习、投递和面试准备，让求职动作围绕真实差距展开。',
  },
];

const DASHBOARD_PREVIEW = [
  {
    title: '简历匹配度',
    value: '82%',
    note: '适合产品增长经理岗位，具备明确优势',
    tone: 'primary',
  },
  {
    title: '关键缺口',
    value: '03',
    note: '归因建模、实验深度、用户留存策略仍需补齐',
    tone: 'warning',
  },
  {
    title: '下一步动作',
    value: '面试准备',
    note: '优先整理二轮面试可复用的成果案例',
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
  const accent =
    tone === 'primary'
      ? 'var(--color-primary)'
      : tone === 'warning'
        ? 'var(--color-tertiary)'
        : 'var(--color-text)';

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
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--color-bg-base)' }}>
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 xl:px-10 pb-16 md:pb-20">
        <header className="flex items-center justify-between gap-4 py-6 md:py-8">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-[16px] flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #5b4eff 0%, #3525cd 100%)',
                boxShadow: '0 14px 30px rgba(53,37,205,0.24)',
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

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
            >
              {isAuthenticated ? '进入工作台' : '注册 / 登录'}
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
                AI 求职分析平台
              </Badge>

              <h1 className="mt-5 max-w-[860px] text-[44px] leading-[0.98] md:text-[68px] xl:text-[84px] font-black tracking-[-0.06em] text-[var(--color-text-on-surface)]">
                把每一次岗位分析，
                <br />
                变成更清晰、
                <br />
                更可执行的求职策略。
              </h1>

              <p className="mt-5 max-w-[700px] text-base md:text-lg leading-7" style={{ color: 'var(--color-text-secondary)' }}>
                GapPilot 把简历诊断、岗位匹配、学习计划、投递管理和面试准备串成同一条工作流。你不再堆积建议，而是围绕真实差距持续推进。
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={() =>
                    document.getElementById('signup-card')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    })
                  }
                >
                  立即创建工作区
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}>
                  {isAuthenticated ? '打开控制台' : '查看注册入口'}
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

          <div id="signup-card" className="xl:sticky xl:top-8 self-start">
            <WorkspaceSignupCard />
          </div>
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
                <p className="editorial-kicker text-white/60 mb-2">控制台预览</p>
                <h3 className="text-[28px] leading-tight font-black tracking-tight text-white">一处看清整个求职进度</h3>
              </div>
              <div className="w-12 h-12 rounded-[18px] flex items-center justify-center bg-white/10 text-white">
                <LayoutDashboard size={20} />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: '最近分析', value: '4 个活跃岗位' },
                { label: '投递记录', value: '12 条在跟进' },
                { label: '学习任务', value: '7 项进行中' },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-[20px] px-4 py-3 bg-white/6 border border-white/8"
                >
                  <span className="text-sm text-white/72">{row.label}</span>
                  <span className="text-sm font-semibold text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 md:mt-24">
          <div className="max-w-[760px]">
            <p className="editorial-kicker mb-3">核心能力</p>
            <h2 className="text-[34px] md:text-[52px] leading-[1.02] font-black tracking-[-0.04em]">
              从分析到行动，所需能力都集中在这里。
            </h2>
            <p className="mt-4 text-base md:text-lg leading-7" style={{ color: 'var(--color-text-secondary)' }}>
              用一套更正常、更专业的产品结构承接你的求职流程。每一份报告都可以自然延伸到学习、投递和面试执行。
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {FEATURE_CARDS.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-[30px] p-6 md:p-7"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,242,255,0.88))',
                    border: '1px solid color-mix(in srgb, var(--color-outline-variant) 35%, transparent)',
                    boxShadow: '0 18px 44px rgba(27,27,36,0.06)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-[18px] flex items-center justify-center mb-5"
                    style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}
                  >
                    <Icon size={20} />
                  </div>
                  <p className="editorial-kicker mb-3">{feature.eyebrow}</p>
                  <h3 className="text-[26px] leading-[1.08] font-black tracking-tight">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                    {feature.description}
                  </p>
                  <div className="mt-5 space-y-3">
                    {feature.points.map((point) => (
                      <div key={point} className="flex items-center gap-3 text-sm">
                        <ArrowRight size={16} style={{ color: 'var(--color-primary)' }} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-16 md:mt-24 grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6 md:gap-8 items-start">
          <div>
            <p className="editorial-kicker mb-3">工作流</p>
            <h2 className="text-[34px] md:text-[52px] leading-[1.02] font-black tracking-[-0.04em]">
              一条简单路径，把分析真正推进到执行。
            </h2>
            <p className="mt-4 text-base md:text-lg leading-7 max-w-[620px]" style={{ color: 'var(--color-text-secondary)' }}>
              先判断是否匹配，再决定补什么、投什么、怎么准备下一轮面试。整个流程应该清楚、连贯，而不是像拼起来的原型。
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
                <div
                  className="w-14 h-14 rounded-[20px] flex items-center justify-center text-lg font-black shrink-0"
                  style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}
                >
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

        <section className="mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            {
              title: '岗位分析',
              desc: '对照目标岗位，理解简历的真实匹配度和重点风险。',
              icon: FileSearch,
            },
            {
              title: '投递管理',
              desc: '记录每个岗位的进度、阶段变化和后续跟进动作。',
              icon: BriefcaseBusiness,
            },
            {
              title: '执行跟进',
              desc: '围绕短板安排学习和面试准备，而不是凭感觉推进。',
              icon: CheckCircle2,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[28px] p-6"
                style={{
                  background: 'rgba(255,255,255,0.82)',
                  border: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
                  boxShadow: '0 16px 34px rgba(27,27,36,0.05)',
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-[16px] flex items-center justify-center"
                    style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}
                  >
                    <Icon size={18} />
                  </div>
                  <p className="text-lg font-bold tracking-tight">{item.title}</p>
                </div>
                <p className="text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
