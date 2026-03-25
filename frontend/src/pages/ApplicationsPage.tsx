import { ArrowUpRight, BrainCircuit, FilePlus2, Filter, MessageSquareQuote, SlidersHorizontal } from 'lucide-react';
import { DashboardCard, DashboardLayout, MetricCard } from '../components/ui';

const jobs = [
  ['Linear', '产品设计师', '进行中', '2024年10月12日', '$16.5w - $19w'],
  ['Stripe', '主任工程师', '已投递', '2024年10月14日', '$22w - $25w'],
  ['Notion', '增长负责人', 'Offer', '2024年10月08日', '$18w + 期权'],
  ['Meta', '产品经理', '未通过', '2024年10月02日', '$21w - $24w'],
];

const interviewQuestions = [
  '请描述一次你根据数据调整产品策略的经历。',
  '描述一次你与利益相关者发生冲突的情况。',
  '你会如何为 Stripe 设计一个可扩展的通知系统？',
];

function ApplicationsPage() {
  return (
    <DashboardLayout
      title="投递追踪与面试准备"
      subtitle="管理您的活跃投递，并利用 AI 策划的准备资料打磨职业故事。页面融合了投递表格、岗位详情和行为/技术面试问题卡片。"
      activePath="/applications"
      action={
        <button className="rounded-[20px] bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.24)]">
          新建申请
        </button>
      }
    >
      <section className="grid gap-4 md:grid-cols-4 xl:gap-6">
        <MetricCard label="活跃投递总计" value="24" hint="环比上月增长 2%" />
        <MetricCard label="初筛" value="08" hint="持续推进中" />
        <MetricCard label="正在面试" value="12%" hint="需要强化故事表达" />
        <MetricCard label="AI 驱动准备" value="14/20" hint="已掌握核心问题" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr] xl:gap-6">
        <DashboardCard className="p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">职位申请</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">岗位流水线</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="dashboard-soft rounded-full px-4 py-2 text-sm text-slate-200">
                <Filter className="mr-2 inline h-4 w-4" /> 筛选
              </button>
              <button className="dashboard-soft rounded-full px-4 py-2 text-sm text-slate-200">
                <SlidersHorizontal className="mr-2 inline h-4 w-4" /> 排序
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-800">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-950/40 text-slate-400">
                <tr>
                  <th className="px-4 py-4 font-medium">职位</th>
                  <th className="px-4 py-4 font-medium">状态</th>
                  <th className="px-4 py-4 font-medium">投递日期</th>
                  <th className="px-4 py-4 font-medium">薪资</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(([company, role, status, date, salary]) => (
                  <tr key={company + role} className="border-t border-slate-800 bg-slate-950/20 text-slate-200">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white">{company}</div>
                      <div className="mt-1 text-slate-400">{role}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">{status}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{date}</td>
                    <td className="px-4 py-4 text-slate-300">{salary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        <div className="space-y-4 xl:space-y-6">
          <DashboardCard className="p-5 sm:p-6 lg:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">岗位详情</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">面试准备</h2>
              </div>
              <BrainCircuit className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="mt-6 rounded-[24px] bg-gradient-to-br from-indigo-500/12 to-cyan-500/10 p-5">
              <div className="text-sm text-slate-300">已提交申请 • 2024年10月14日 • 上午 10:42</div>
              <div className="mt-4 text-lg font-semibold text-white">行为面试</div>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                重点关注第三季度的增长实验。提到转化率下降 12% 的情况，以及我们如何切换到分层引导流程的。
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {interviewQuestions.map((question) => (
                <div key={question} className="dashboard-soft rounded-[20px] p-4 text-sm leading-7 text-slate-200">
                  {question}
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard className="p-5 sm:p-6 lg:p-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">操作</div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">状态更新</div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-indigo-300" />
            </div>
            <div className="mt-6 grid gap-3">
              {[
                '添加笔记',
                '归档职位',
                '重新生成 AI 问题',
                '新建申请',
              ].map((item) => (
                <button key={item} className="dashboard-soft rounded-[20px] px-4 py-3 text-left text-sm text-slate-200">
                  {item}
                </button>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard className="p-5 sm:p-6 lg:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                <MessageSquareQuote className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-slate-400">AI 备注</div>
                <div className="text-lg font-semibold text-white">职业故事建议</div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              把“结果”讲得更具体：每个案例优先突出业务影响、协作范围和你主导的关键决策，再补充数据和复盘。
            </p>
            <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
              <FilePlus2 className="h-4 w-4" /> 添加到准备清单
            </button>
          </DashboardCard>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default ApplicationsPage;
