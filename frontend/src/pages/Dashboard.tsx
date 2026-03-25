import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  CreditCard,
  FilePlus2,
  Target,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardCard, DashboardLayout, MetricCard } from '../components/ui';

const statCards = [
  { label: '总分析数', value: '12', hint: '本周新增 3 个职位匹配' },
  { label: '待办任务', value: '5', hint: '优先处理高匹配职位' },
  { label: '已投递职位', value: '8', hint: '较上周 +2' },
  { label: '剩余积分', value: '4', hint: '建议补充额度' },
];

const analysisItems = [
  { title: '高级产品设计师', company: 'Google', time: '2 小时前分析', score: '94%', href: '/analysis/google-product-designer' },
  { title: 'UX 策略主管', company: 'Microsoft', time: '1 天前分析', score: '82%', href: '/analysis/microsoft-ux-strategy' },
  { title: '设计系统架构师', company: 'Amazon', time: '3 天前分析', score: '68%', href: '/analysis/amazon-design-system' },
];

const quickActions = [
  { icon: FilePlus2, label: '新建分析', href: '/analysis/new' },
  { icon: Upload, label: '上传简历', href: '/analysis/new' },
  { icon: CreditCard, label: '购买积分', href: '/billing' },
  { icon: CheckCircle2, label: '创建任务', href: '/applications' },
];

const pipeline = [
  ['总计', '8'],
  ['面试中', '3'],
  ['评估中', '4'],
  ['已归档', '1'],
];

function Dashboard() {
  return (
    <DashboardLayout
      title="控制台"
      subtitle="您的 AI 职业管家昨晚处理了 3 个新的职位匹配。您目前在高级产品职位中排名前 5%，可以直接推进新分析、投递管理和账单操作。"
      activePath="/dashboard"
      action={
        <Link
          to="/analysis/new"
          className="rounded-[20px] bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.24)]"
        >
          更新您的 “React” 熟练度
        </Link>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        {statCards.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] xl:gap-6">
        <DashboardCard className="p-5 sm:p-6 lg:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">最近分析</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">匹配趋势</h2>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">较上周 +12%</div>
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
                    <Link to={item.href} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
                      查看详情
                    </Link>
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
              {quickActions.map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  to={href}
                  className="dashboard-soft flex items-center justify-between rounded-[20px] px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-indigo-300" /> {label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </Link>
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
              <Link to="/applications" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                新建申请 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </DashboardCard>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default Dashboard;
