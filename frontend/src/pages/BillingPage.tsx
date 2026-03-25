import { CheckCircle2, Download, Receipt, Wallet } from 'lucide-react';
import { DashboardCard, DashboardLayout, MetricCard } from '../components/ui';

const plans = [
  { name: '基础版', price: '$19', detail: '/单次购买', perks: ['5 AI 积分', '简历优化', '基础支持'], featured: false, cta: '选择' },
  { name: '专业版', price: '$49', detail: '/单次购买', perks: ['20 AI 积分', '深度分析', '档案审计'], featured: true, cta: '立即购买' },
  { name: '企业版', price: '$99', detail: '/按月付费', perks: ['∞ 积分', '专属人工管家', '团队共享'], featured: false, cta: '订阅' },
];

const billingRows = [
  ['2024年10月12日', '专业版 (20 积分)', '$49.00', '成功'],
  ['2024年09月05日', '基础版 (5 积分)', '$19.00', '成功'],
];

const usageRows = [
  ['2024年11月14日', 'AI 分析 - Meta 高级产品经理'],
  ['2024年11月12日', '面试模拟'],
  ['2024年11月10日', '简历优化'],
];

function BillingPage() {
  return (
    <DashboardLayout
      title="账单与积分管理"
      subtitle="管理您的订阅、购买积分并跟踪使用情况。页面包含套餐卡片、支付方式表单、购买历史和最近 30 天的使用记录。"
      activePath="/billing"
      action={
        <button className="rounded-[20px] bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.24)]">
          支付 $49.00
        </button>
      }
    >
      <section className="grid gap-4 md:grid-cols-3 xl:gap-6">
        <MetricCard label="当前余额" value="4 积分" hint="可用于新分析" />
        <MetricCard label="最近30天" value="3 次使用" hint="包含分析 / 面试 / 简历优化" />
        <MetricCard label="支付方式" value="4242" hint="Visa 尾号 4242" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr] xl:gap-6">
        <div className="space-y-4 xl:space-y-6">
          <DashboardCard className="p-5 sm:p-6 lg:p-7">
            <div>
              <p className="text-sm text-slate-400">选择套餐</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">积分与订阅</h2>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-[24px] border p-5 ${
                    plan.featured
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_20px_50px_rgba(79,70,229,0.18)]'
                      : 'border-slate-800 bg-slate-950/20'
                  }`}
                >
                  {plan.featured ? (
                    <div className="mb-4 inline-flex rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-200 sm:text-xs">
                      最受欢迎
                    </div>
                  ) : null}
                  <div className="text-lg font-semibold text-white">{plan.name}</div>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-3xl font-semibold tracking-[-0.04em] text-white">{plan.price}</span>
                    <span className="pb-1 text-sm text-slate-400">{plan.detail}</span>
                  </div>
                  <div className="mt-5 space-y-3 text-sm text-slate-300">
                    {plan.perks.map((perk) => (
                      <div key={perk} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" /> {perk}
                      </div>
                    ))}
                  </div>
                  <button className={`mt-6 w-full rounded-full px-4 py-3 text-sm font-semibold ${plan.featured ? 'bg-white text-slate-950' : 'bg-slate-900 text-white'}`}>
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard className="p-5 sm:p-6 lg:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">购买历史</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">账单记录</h2>
              </div>
              <button className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
                <Download className="mr-2 inline h-4 w-4" /> 下载发票
              </button>
            </div>
            <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-800">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-950/40 text-slate-400">
                  <tr>
                    <th className="px-4 py-4 font-medium">日期</th>
                    <th className="px-4 py-4 font-medium">套餐</th>
                    <th className="px-4 py-4 font-medium">金额</th>
                    <th className="px-4 py-4 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {billingRows.map((row) => (
                    <tr key={row.join('-')} className="border-t border-slate-800 bg-slate-950/20 text-slate-200">
                      {row.map((cell, index) => (
                        <td key={cell + index} className="px-4 py-4">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-4 xl:space-y-6">
          <DashboardCard className="p-5 sm:p-6 lg:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-slate-400">支付方式</div>
                <div className="text-lg font-semibold text-white">信用卡信息</div>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[
                ['持卡人姓名', 'Alex Rivera'],
                ['卡号', '4242 4242 4242 4242'],
              ].map(([label, value]) => (
                <label key={label} className="space-y-2">
                  <span className="text-sm text-slate-400">{label}</span>
                  <input className="dashboard-soft w-full rounded-[18px] border-none px-4 py-3 text-sm text-white outline-none" defaultValue={value} />
                </label>
              ))}
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-slate-400">有效期</span>
                  <input className="dashboard-soft w-full rounded-[18px] border-none px-4 py-3 text-sm text-white outline-none" defaultValue="MM/YY" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-400">CVC</span>
                  <input className="dashboard-soft w-full rounded-[18px] border-none px-4 py-3 text-sm text-white outline-none" defaultValue="***" />
                </label>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard className="p-5 sm:p-6 lg:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-slate-400">使用记录</div>
                <div className="text-lg font-semibold text-white">最近 30 天</div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {usageRows.map(([date, action]) => (
                <div key={date + action} className="dashboard-soft rounded-[20px] px-4 py-3">
                  <div className="text-sm text-slate-400">{date}</div>
                  <div className="mt-1 text-sm text-slate-200">{action}</div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default BillingPage;
