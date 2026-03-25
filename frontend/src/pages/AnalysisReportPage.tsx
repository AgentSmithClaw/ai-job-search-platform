import { ArrowRight, Download, Share2, TriangleAlert } from 'lucide-react';
import { DashboardCard, DashboardLayout, MetricCard } from '../components/ui';

const strengths = ['9 项匹配', '系统性思维', 'Figma 专家级应用', '用户研究'];
const risks = ['经验差距：需要 8 年以上经验', '证书缺失：HCID 认证', '技术差距：Framer / React / Design Tokens'];
const nextActions = [
  '生成定制简历：针对 Google L5 职级评估标准，自动创建个性化履历。',
  '学习任务：策划为期 7 天的 Framer 和设计 Tokens 冲刺计划。',
  '生成面试问题：基于岗位要求模拟 10 个技术与行为面试问题。',
];

function AnalysisReportPage() {
  return (
    <DashboardLayout
      title="岗位分析报告"
      subtitle="围绕高级产品设计师岗位的整体匹配度、核心优势、关键风险和下一步行动都已归纳在这份单页报告里。页面支持分享摘要和导出 PDF / DOCX。"
      activePath="/analysis/new"
      action={
        <button className="rounded-[20px] bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.24)]">
          重新生成摘要
        </button>
      }
    >
      <section className="grid gap-4 md:grid-cols-3 xl:gap-6">
        <MetricCard label="职位" value="高级产品设计师" hint="Google · 山景城，加州" />
        <MetricCard label="整体匹配度" value="85%" hint="较目标岗位基线高 12%" />
        <MetricCard label="导出" value="PDF / DOCX" hint="支持分享摘要与下载" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr] xl:gap-6">
        <div className="space-y-4 xl:space-y-6">
          <DashboardCard className="p-5 sm:p-6 lg:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">公司</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Google</h2>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-right">
                <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-300 sm:text-xs">整体匹配度</div>
                <div className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-emerald-300">85%</div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <div className="text-sm font-semibold text-white">核心优势</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {strengths.map((item) => (
                    <span key={item} className="rounded-full bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-white">关键风险</div>
                <div className="mt-3 space-y-3">
                  {risks.map((item) => (
                    <div key={item} className="dashboard-soft flex items-start gap-3 rounded-[18px] px-4 py-3 text-sm text-slate-300">
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard className="p-5 sm:p-6 lg:p-7">
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">分享摘要</button>
              <button className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200">
                <Download className="mr-2 inline h-4 w-4" /> PDF
              </button>
              <button className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200">
                <Share2 className="mr-2 inline h-4 w-4" /> DOCX
              </button>
            </div>
          </DashboardCard>
        </div>

        <DashboardCard className="p-5 sm:p-6 lg:p-7">
          <p className="text-sm text-slate-400">AI 驱动的下一步行动</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">推荐行动序列</h2>

          <div className="mt-8 space-y-4">
            {nextActions.map((item, index) => (
              <div key={item} className="dashboard-soft rounded-[22px] p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-sm font-semibold text-indigo-300">
                    0{index + 1}
                  </div>
                  <div>
                    <div className="text-sm leading-7 text-slate-200">{item}</div>
                    <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                      立即执行 <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>
    </DashboardLayout>
  );
}

export default AnalysisReportPage;
