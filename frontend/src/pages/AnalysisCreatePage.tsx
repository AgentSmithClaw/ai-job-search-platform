import { LoaderCircle, Sparkles, Upload } from 'lucide-react';
import { DashboardCard, DashboardLayout, MetricCard } from '../components/ui';

const progress = [
  { label: '解析简历中...', value: '100%' },
  { label: '分析 JD 中...', value: '64%' },
  { label: '匹配技能中...', value: '等待中' },
  { label: '生成行动项中...', value: '等待中' },
];

function AnalysisCreatePage() {
  return (
    <DashboardLayout
      title="精准分析引擎"
      subtitle="我们的 AI 通过您的职业 DNA 与特定职位要求进行比对，为您指出通往录用的唯一路径。第一步是上传简历并补充目标岗位描述。"
      activePath="/analysis/new"
      action={
        <button className="rounded-[20px] bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.24)]">
          开始智能分析
        </button>
      }
    >
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr] xl:gap-6">
        <div className="space-y-4 xl:space-y-6">
          <div className="grid gap-4 md:grid-cols-3 xl:gap-6">
            <MetricCard label="分析流" value="v2.4" hint="桥接职业差距" />
            <MetricCard label="申请进度" value="34" hint="剩余可用积分" />
            <MetricCard label="技能提升" value="7 天" hint="建议冲刺周期" />
          </div>

          <DashboardCard className="p-5 sm:p-6 lg:p-7">
            <div>
              <p className="text-sm text-slate-400">1. 简历来源</p>
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">支持: PDF, DOCX, TXT, MD</p>
            </div>
            <div className="mt-6 rounded-[28px] border border-dashed border-slate-700 bg-slate-950/35 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                <Upload className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">拖拽上传您的职业简历</h3>
              <p className="mt-2 text-sm text-slate-400">或点击浏览本地文件</p>
            </div>
          </DashboardCard>

          <DashboardCard className="p-5 sm:p-6 lg:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">2. 目标职位描述 (JD)</p>
                <p className="mt-2 text-xs text-slate-500">0 / 10,000 字符</p>
              </div>
              <div className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">AI 职能识别</div>
            </div>

            <textarea
              className="dashboard-soft mt-6 h-52 w-full rounded-[24px] border-none px-5 py-4 text-sm leading-7 text-slate-200 outline-none placeholder:text-slate-500"
              placeholder="在此粘贴完整的职位描述..."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ['职位名称 (可选)', '例如：高级产品设计师'],
                ['公司 (可选)', '例如：Acme Corp'],
                ['工作地点 (可选)', '例如：上海 / 远程'],
              ].map(([label, placeholder]) => (
                <label key={label} className="space-y-2">
                  <span className="text-sm text-slate-400">{label}</span>
                  <input
                    className="dashboard-soft w-full rounded-[18px] border-none px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    placeholder={placeholder}
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950">开始智能分析</button>
              <div className="text-sm text-slate-400">消耗 1 积分 • 剩余 34 积分</div>
            </div>
          </DashboardCard>
        </div>

        <DashboardCard className="p-5 sm:p-6 lg:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">AI 智能调度</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">正在处理匹配指标...</h2>
            </div>
            <Sparkles className="h-5 w-5 text-cyan-300" />
          </div>

          <div className="mt-8 space-y-4">
            {progress.map((item, index) => (
              <div key={item.label} className="dashboard-soft rounded-[22px] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                      <LoaderCircle className={`h-4 w-4 ${index < 2 ? 'animate-spin' : ''}`} />
                    </div>
                    <span className="text-sm text-slate-200">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{item.value}</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-300"
                    style={{ width: item.value.includes('%') ? item.value : '20%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>
    </DashboardLayout>
  );
}

export default AnalysisCreatePage;
