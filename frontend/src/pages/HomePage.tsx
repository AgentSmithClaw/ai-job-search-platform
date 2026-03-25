import { ArrowRight, BrainCircuit, CheckCircle2, FileText, Lock, Sparkles, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HomeSection, SectionHeading } from '../components/ui';

const featureCards = [
  {
    icon: Target,
    title: '差距分析',
    description:
      '深入解析职位描述与个人经历之间的错位，快速识别技能缺口、关键词缺口与表达弱点。',
    stat: '82%',
    statLabel: '技术匹配度',
  },
  {
    icon: FileText,
    title: '简历定制',
    description: '即时重写简历要点，镜像招聘方需要的语言风格，同时保持真实性与可验证性。',
    stat: 'DOCX',
    statLabel: '一键导出',
  },
  {
    icon: BrainCircuit,
    title: '面试准备',
    description: '根据 JD 与个人差距生成高相关问题库，并附带建议回答框架与表达提示。',
    stat: '12',
    statLabel: '关键匹配词',
  },
  {
    icon: Zap,
    title: '投递追踪',
    description: '把分析、简历版本、投递状态和面试节点统一收纳在一个清晰仪表盘里。',
    stat: '3步',
    statLabel: '工作流闭环',
  },
];

const workflow = [
  {
    step: '01',
    title: '上传简历',
    description: '拖入最新简历，AI 会高保真解析你的经历、技能、成果与岗位叙事重心。',
  },
  {
    step: '02',
    title: '粘贴职位链接',
    description: '输入目标 JD，我们提取显性要求与隐藏关键词，建立岗位画像与风险判断。',
  },
  {
    step: '03',
    title: '获取 AI 策略',
    description: '收到匹配分数、定制要点、风险标记和面试速查表，马上进入下一轮优化。',
  },
];

const pricing = [
  {
    name: '体验套餐',
    price: '¥59',
    credits: '5 次额度',
    features: ['5 次职位分析', '简历定制重写', 'PDF 导出功能'],
    highlight: false,
  },
  {
    name: '进阶求职者',
    price: '¥199',
    credits: '25 次额度',
    features: ['25 次职位分析', '无限次简历迭代', 'PDF & DOCX 导出', '面试通关指南'],
    highlight: true,
  },
  {
    name: '求职达人',
    price: '¥329',
    credits: '60 次额度',
    features: ['60 次职位分析', '包含所有进阶版功能', '优先客户支持'],
    highlight: false,
  },
];

const faqs = [
  {
    q: 'GapPilot 如何处理我的隐私？',
    a: '我们为每位用户使用加密沙箱。简历数据与分析历史严格保密，绝不会用于训练通用模型。',
  },
  {
    q: '什么是“点数”？',
    a: '1 个点数等于 1 份完整职位分析报告。报告生成后，你可以对同一职位无限次继续优化简历。',
  },
  {
    q: '可以导出报告吗？',
    a: '可以。进阶版及以上可导出 ATS 友好的 PDF 和 Word 文档，用于真实投递。',
  },
];

function HomePage() {
  return (
    <div className="overflow-hidden bg-transparent text-slate-900">
      <div className="home-grid relative">
        <div className="absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_42%)]" />
        <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white shadow-[0_12px_30px_rgba(15,23,42,0.24)]">
              G
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-950">GapPilot</p>
              <p className="text-xs text-slate-500">AI 职业精准导航</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
            <a href="#features">功能特性</a>
            <a href="#workflow">工作流程</a>
            <a href="#pricing">价格方案</a>
            <a href="#faq">常见问题</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="hidden text-sm font-medium text-slate-600 sm:inline-flex">
              登录
            </Link>
            <Link
              to="/dashboard"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5"
            >
              立即开始
            </Link>
          </div>
        </header>

        <HomeSection className="relative mx-auto max-w-7xl pt-8 sm:pt-14 lg:pt-20">
          <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-indigo-700 shadow-sm">
                <Sparkles className="h-4 w-4" /> 隆重推出 GapPilot 2.0
              </div>
              <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
                AI 精准度加速
                <br />
                您的职业生涯。
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                GapPilot 是一款 AI 驱动的职业管家。它分析职位描述、优化简历并为面试做准备，让求职从混乱走向清晰、从感觉走向策略。
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.28)] transition hover:-translate-y-0.5"
                >
                  开始免费分析 <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#report"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  查看示例报告
                </a>
              </div>
              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {[
                  ['89%', '高级岗位平均匹配提升'],
                  ['15,000+', '已服务专业人士'],
                  ['100%', '数据不参与模型训练'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
                    <div className="text-2xl font-semibold text-slate-950">{value}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div id="report" className="relative">
              <div className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-cyan-300/40 blur-3xl" />
              <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-indigo-400/30 blur-3xl" />
              <div className="relative rounded-[36px] border border-white/70 bg-white/80 p-4 shadow-[0_28px_90px_rgba(99,102,241,0.18)] backdrop-blur-xl sm:p-6">
                <div className="rounded-[28px] bg-slate-950 p-6 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-indigo-300">正在分析</p>
                      <h3 className="mt-3 text-2xl font-semibold">高级产品设计师</h3>
                      <p className="mt-2 text-sm text-slate-400">Stripe • 远程 • 全职</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                      <div className="text-xs text-slate-400">匹配分数</div>
                      <div className="mt-1 text-3xl font-semibold text-emerald-300">89%</div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white/5 p-5">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">关键指标</div>
                      <div className="mt-4 space-y-4">
                        {[
                          ['识别到关键差距', '系统思维表达不足'],
                          ['风险等级', '“资历过高”需弱化'],
                          ['TS 兼容性得分', 'A'],
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-slate-400">{k}</span>
                            <span className="font-medium text-white">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5">
                      <div className="text-xs uppercase tracking-[0.24em] text-indigo-100">直接行动建议</div>
                      <p className="mt-4 text-sm leading-7 text-indigo-50/95">
                        “您的资料中缺乏对系统思维的明确描述。建议修改 Google 2022 项目描述，加入组件库架构与跨团队协作成果。”
                      </p>
                      <button className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900">
                        立即修复
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HomeSection>
      </div>

      <HomeSection id="features" className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="功能特性"
          title="专为现代求职者打造的精准工具。"
          description="不是泛泛而谈的 AI 助手，而是一套围绕职位分析、简历重写、面试准备与投递管理构建的闭环。"
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map(({ icon: Icon, title, description, stat, statLabel }) => (
            <article
              key={title}
              className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_rgba(148,163,184,0.12)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-7 text-2xl font-semibold text-slate-950">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
              <div className="mt-8 rounded-2xl bg-slate-950 px-5 py-4 text-white">
                <div className="text-2xl font-semibold">{stat}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{statLabel}</div>
              </div>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection id="workflow" className="mx-auto max-w-7xl">
        <div className="rounded-[40px] bg-slate-950 px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
          <SectionHeading
            eyebrow="工作流程"
            title="从混乱走向清晰的三个步骤。"
            description="上传简历、粘贴职位链接、接收个性化策略。整个流程用最少操作换来最强针对性。"
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {workflow.map((item) => (
              <article key={item.step} className="rounded-[30px] border border-white/10 bg-white/5 p-7">
                <div className="text-sm font-semibold tracking-[0.28em] text-indigo-300">{item.step}</div>
                <h3 className="mt-5 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </HomeSection>

      <HomeSection className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-600">报告示例</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">
              告别泛泛而谈，直接获得可执行的求职策略。
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              GapPilot 生成的是高保真行动方案：告诉你哪里缺、为什么缺、该如何补，并把这些建议压缩成能立刻执行的任务。
            </p>
            <div className="mt-8 space-y-4">
              {[
                '识别岗位关键词与隐藏评估点',
                '标记“资历过高”等潜在风险',
                '给出简历修复建议与面试应答方向',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[36px] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-6 shadow-[0_24px_80px_rgba(99,102,241,0.14)]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">匹配分析摘要</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">高级产品设计师</h3>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
                  <div className="text-xs uppercase tracking-[0.24em] text-emerald-700">匹配度</div>
                  <div className="mt-1 text-3xl font-semibold text-emerald-600">89%</div>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ['风险等级', '中'],
                  ['关键匹配词', '12'],
                  ['技术兼容性', 'A'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
                    <div className="mt-3 text-2xl font-semibold text-slate-950">{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[24px] bg-slate-950 p-5 text-sm leading-7 text-slate-300">
                “建议增加组件库架构、跨团队决策和业务指标提升的描述，让系统思维与战略影响力更加显性。”
              </div>
            </div>
          </div>
        </div>
      </HomeSection>

      <HomeSection id="pricing" className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="价格方案"
          title="按次计费，精准高效。"
          description="无需包月。根据求职进度灵活购买，第一版重点还原设计中的三档定价结构。"
          align="center"
        />
        <div className="mt-14 grid gap-6 xl:grid-cols-3">
          {pricing.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-[32px] border p-8 shadow-[0_24px_60px_rgba(148,163,184,0.12)] ${
                plan.highlight
                  ? 'border-indigo-500 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-950'
              }`}
            >
              {plan.highlight ? (
                <div className="inline-flex rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">
                  最受欢迎
                </div>
              ) : null}
              <h3 className="mt-5 text-2xl font-semibold">{plan.name}</h3>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-semibold">{plan.price}</span>
                <span className={`pb-1 text-sm ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>{plan.credits}</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm leading-7">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className={`mt-1 h-4 w-4 shrink-0 ${plan.highlight ? 'text-emerald-300' : 'text-emerald-500'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-10 w-full rounded-full px-5 py-4 text-sm font-semibold transition ${
                  plan.highlight ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
                }`}
              >
                立即购买
              </button>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection id="faq" className="mx-auto max-w-7xl pb-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-600">常见问题</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">准备好拿到录用通知了吗？</h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              加入 15,000+ 专业人士的行列，用 AI 更有把握地驾驭现代求职市场。
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
                <Lock className="h-4 w-4 text-indigo-600" /> 隐私优先
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
                <Sparkles className="h-4 w-4 text-indigo-600" /> AI 精准分析
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {faqs.map((item) => (
              <article key={item.q} className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(148,163,184,0.1)]">
                <h3 className="text-xl font-semibold text-slate-950">{item.q}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </HomeSection>

      <footer className="border-t border-slate-200 bg-white/80 px-6 py-8 backdrop-blur-sm sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-semibold text-slate-900">GapPilot</span> © 2024 GapPilot AI. 智慧引领，职业精准。
          </div>
          <div className="flex flex-wrap gap-5">
            <a href="#">隐私政策</a>
            <a href="#">服务条款</a>
            <a href="#">新闻订阅</a>
            <a href="#">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
