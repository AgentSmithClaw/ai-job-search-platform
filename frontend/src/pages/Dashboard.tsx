import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  CreditCard,
  FilePlus2,
  Search,
  Sparkles,
  Target,
  Upload,
} from 'lucide-react';
import { DashboardCard } from '../components/ui';

const statCards = [
  { label: '总分析数', value: '12', hint: '本周新增 3 个职位匹配' },
  { label: '待办任务', value: '5', hint: '优先处理高匹配职位' },
  { label: '已投递职位', value: '8', hint: '较上周 +2' },
  { label: '剩余积分', value: '4', hint: '建议补充额度' },
];

const analysisItems = [
  { title: '高级产品设计师', company: 'Google', time: '2 小时前分析', score: '94%' },
  { title: 'UX 策略主管', company: 'Microsoft', time: '1 天前分析', score: '82%' },
  { title: '设计系统架构师', company: 'Amazon', time: '3 天前分析', score: '68%' },
];

const quickActions = [
  { icon: FilePlus2, label: '新建分析' },
  { icon: Upload, label: '上传简历' },
  { icon: CreditCard, label: '购买积分' },
  { icon: CheckCircle2, label: '创建任务' },
];

const pipeline = [
  ['总计', '8'],
  ['面试中', '3'],
  ['评估中', '4'],
  ['已归档', '1'],
];

function Dashboard() {
  return (
    <div className="dashboard-shell min-h-screen text-slate-100">
      <div className="mx-auto max-w-[1520px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid gap-4 lg:grid-cols-[272px_minmax(0,1fr)] xl:gap-6">
          <aside className="dashboard-panel glass-card rounded-[28px] p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-lg font-bold text-white pill-glow">
                G
              </div>
              <div>
                <div className="text-lg font-semibold text-white">GapPilot</div>
                <div className="text-xs text-slate-400">AI 职业管家</div>
              </div>
            </div>

            <div className="dashboard-soft mt-8 rounded-[22px] p-4">
              <div className="text-sm font-semibold text-white">Alex Sterling</div>
              <div className="mt-1 text-xs text-indigo-200">专业版会员</div>
            </div>

            <nav className="mt-8 space-y-2 text-sm">
              {[
                ['控制台', true],
                ['匹配分析', false],
                ['投递管理', false],
                ['面试准备', false],
                ['设置', false],
                ['账单', false],
              ].map(([label, active]) => (
                <a
                  key={String(label)}
                  href="#"
                  className={`flex items-center justify-between rounded-[20px] px-4 py-3 transition ${
                    active ? 'bg-indigo-500 text-white shadow-[0_20px_40px_rgba(79,70,229,0.24)]' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{label}</span>
                  {active ? <Sparkles className="h-4 w-4" /> : null}
                </a>
              ))}
            </nav>

            <div className="mt-8 rounded-[24px] bg-gradient-to-br from-indigo-500/28 to-cyan-500/18 p-5">
              <div className="text-sm font-semibold text-white">GapPilot AI</div>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                根据你最近在 Google 的 94% 匹配度，建议在周五前生成一份“文化契合度”速查表。
              </p>
              <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">
                生成策略 <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </aside>

          <main className="space-y-4 xl:space-y-6">
            <DashboardCard className="p-5 sm:p-6 lg:p-7">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm text-slate-400">早安, Alex.</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[2.6rem]">控制台</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                    您的 AI 职业管家昨晚处理了 3 个新的职位匹配。您目前在高级产品职位中排名前 5%。
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row xl:min-w-[420px] xl:justify-end">
                  <label className="dashboard-soft flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm text-slate-300">
                    <Search className="h-4 w-4 text-slate-500" />
                    <input
                      className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      placeholder="搜索申请、技能或见解..."
                    />
                  </label>
                  <button className="rounded-[20px] bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.24)]">
                    更新您的 “React” 熟练度
                  </button>
                </div>
              </div>
            </DashboardCard>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
              {statCards.map((item) => (
                <DashboardCard key={item.label} className="p-5 sm:p-6">
                  <div className="text-sm text-slate-400">{item.label}</div>
                  <div className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">{item.value}</div>
                  <div className="mt-3 text-sm text-slate-500">{item.hint}</div>
                </DashboardCard>
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] xl:gap-6">
              <DashboardCard className="p-5 sm:p-6 lg:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">最近分析</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">匹配趋势</h2>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                    较上周 +12%
                  </div>
                </div>

                <div className="dashboard-soft mt-8 rounded-[24px] p-5">
                  <div className="flex items-end justify-between gap-4 text-[11px] uppercase tracking-[0.24em] text-slate-500 sm:text-xs">
                    <span>周一</span>
                    <span>周日</span>
                  </div>
                  <div className="mt-6 flex h-44 items-end gap-3">
                    {[42, 70, 55, 82, 64, 90, 74].map((height, index) => (
                      <div key={index} className="flex flex-1 flex-col items-center gap-3">
                        <div
                          className="w-full rounded-t-[16px] bg-gradient-to-t from-indigo-500 via-violet-400 to-cyan-300"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {analysisItems.map((item) => (
                    <div key={item.title} className="dashboard-soft rounded-[22px] p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-lg font-semibold text-white">{item.title}</div>
                          <div className="mt-1 text-sm text-slate-400">
                            {item.company} • {item.time}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="rounded-[18px] bg-emerald-500/10 px-4 py-3 text-right">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-300 sm:text-xs">匹配度</div>
                            <div className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-emerald-300">{item.score}</div>
                          </div>
                          <button className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
                            查看详情
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              <div className="space-y-4 xl:space-y-6">
                <DashboardCard className="p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">快捷操作</div>
                      <div className="mt-1 text-xl font-semibold text-white">立即开始</div>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-3">
                    {quickActions.map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        className="dashboard-soft flex items-center justify-between rounded-[20px] px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10"
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-indigo-300" /> {label}
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </DashboardCard>

                <DashboardCard className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-400">投递流程</div>
                      <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">管理</div>
                    </div>
                    <BriefcaseBusiness className="h-5 w-5 text-indigo-300" />
                  </div>
                  <div className="mt-6 space-y-3">
                    {pipeline.map(([label, value]) => (
                      <div key={label} className="dashboard-soft flex items-center justify-between rounded-[20px] px-4 py-3">
                        <span className="text-sm text-slate-300">{label}</span>
                        <span className="text-lg font-semibold text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </DashboardCard>

                <DashboardCard className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-400">AI 见解</div>
                      <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">学习路径</div>
                    </div>
                    <BarChart3 className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div className="mt-6 rounded-[24px] bg-gradient-to-br from-cyan-500/15 to-indigo-500/10 p-5">
                    <div className="flex items-center gap-2 text-sm text-cyan-200">
                      <Clock3 className="h-4 w-4" /> 未来 7 天建议
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-200">
                      聚焦 React 复杂状态管理、设计系统案例表达和跨团队影响力叙述，优先提升高匹配岗位的胜率。
                    </p>
                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-white">
                      新建申请 <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </DashboardCard>
              </div>
            </section>
          </main>
        </div>

        <footer className="mt-6 px-2 pb-3 text-center text-sm text-slate-500">
          GapPilot AI © 2024 GapPilot AI. 精准智能助力职业发展。隐私政策 · 服务条款 · 邮件订阅 · 联系我们
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;
