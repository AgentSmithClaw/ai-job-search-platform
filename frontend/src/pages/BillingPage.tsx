import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '../components/layout/PageContainer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuthStore, useToastStore } from '../store';
import { createCheckout, getOrders, getPricing, mockPurchase, refundOrder } from '../services/analysis';
import { formatDate } from '../utils/format';

function statusBadge(status: string): 'success' | 'warning' | 'secondary' | 'error' {
  if (status === 'completed') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'refunded') return 'secondary';
  return 'error';
}

export default function BillingPage() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  const { addToast } = useToastStore();

  const { data: pricing = [], isLoading: pricingLoading } = useQuery({
    queryKey: ['pricing'],
    queryFn: getPricing,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['payment-orders'],
    queryFn: getOrders,
  });

  const mockPurchaseMutation = useMutation({
    mutationFn: mockPurchase,
    onSuccess: (data) => {
      if (user) setUser({ ...user, credits: data.credits_total });
      queryClient.invalidateQueries({ queryKey: ['payment-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast({ type: 'success', message: `已购买 ${data.package_name}` });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || '购买失败' }),
  });

  const stripeMutation = useMutation({
    mutationFn: createCheckout,
    onSuccess: (data) => {
      window.location.href = data.checkout_url;
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || '无法创建结账会话' }),
  });

  const refundMutation = useMutation({
    mutationFn: refundOrder,
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['payment-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast({ type: 'success', message: `订单 ${orderId} 已退款` });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || '退款失败' }),
  });

  const completedOrders = useMemo(() => orders.filter((o) => o.status === 'completed').length, [orders]);
  const totalSpent = useMemo(
    () => orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.price_cny, 0),
    [orders],
  );

  const credits = user?.credits ?? 0;
  const quotaMax = 1000;

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
            账户管理 / 账单与额度
          </p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">账单与额度</h1>
        </div>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
          style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
        >
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          额度将随套餐与消耗动态变化
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-sm)', background: 'var(--color-bg-surface)' }}>
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            可用额度（积分）
          </p>
          <p className="text-4xl font-black tracking-tight">
            <span style={{ color: 'var(--color-primary)' }}>{credits}</span>
            <span className="text-xl font-bold mx-1" style={{ color: 'var(--color-text-tertiary)' }}>
              /
            </span>
            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-secondary)' }}>
              {quotaMax}
            </span>
          </p>
          <div className="mt-4 h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-subtle)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (credits / quotaMax) * 100)}%`, background: 'var(--gradient-hero)' }} />
          </div>
          <p className="mt-3 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            已完成订单 {completedOrders} 笔 · 累计消费 ¥{totalSpent}
          </p>
        </div>

        <div className="rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-sm)', background: 'var(--color-bg-surface)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                当前方案
              </p>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">按需积分包</h2>
                <Badge variant="primary">进行中</Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                通过下方套餐充值积分，用于岗位分析、导出与面试生成等功能。
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => pricing[0] && mockPurchaseMutation.mutate(pricing[0].code)} disabled={!pricing.length}>
              快速充值
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-4">选择会员方案</h2>
        {pricingLoading ? (
          <div className="text-sm py-8" style={{ color: 'var(--color-text-secondary)' }}>
            加载套餐中…
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricing.map((plan, idx) => {
              const buying = mockPurchaseMutation.isPending && mockPurchaseMutation.variables === plan.code;
              const stripe = stripeMutation.isPending && stripeMutation.variables === plan.code;
              const recommended = idx === 1;

              return (
                <div
                  key={plan.code}
                  className="rounded-2xl p-6 border relative flex flex-col"
                  style={{
                    borderColor: recommended ? 'var(--color-primary)' : 'var(--color-border)',
                    background: 'var(--color-bg-surface)',
                    boxShadow: recommended ? '0 0 0 1px var(--color-primary)' : 'var(--shadow-sm)',
                  }}
                >
                  {recommended ? (
                    <span
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: 'var(--gradient-hero)' }}
                    >
                      推荐
                    </span>
                  ) : null}
                  <p className="text-lg font-bold">{plan.name}</p>
                  <p className="text-2xl font-black mt-2" style={{ color: 'var(--color-primary)' }}>
                    ¥{plan.price_cny}
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
                      {' '}
                      / 次
                    </span>
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {plan.credits} 积分
                  </p>
                  <p className="text-sm mt-3 flex-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {plan.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.includes.map((line) => (
                      <li key={line} className="text-xs flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] mt-0.5" style={{ color: 'var(--color-primary)' }}>
                          check_circle
                        </span>
                        {line}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 space-y-2">
                    <Button className="w-full" loading={buying} onClick={() => mockPurchaseMutation.mutate(plan.code)}>
                      模拟购买（即时到账）
                    </Button>
                    <Button className="w-full" variant="secondary" loading={stripe} onClick={() => stripeMutation.mutate(plan.code)}>
                      Stripe 结账
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">使用记录</h2>
        </div>
        {ordersLoading ? (
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            加载订单…
          </div>
        ) : orders.length === 0 ? (
          <EmptyState icon="receipt_long" title="暂无支付记录" description="购买套餐后，订单会出现在这里。" />
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-bg-subtle)' }}>
                  <th className="text-left py-3 px-4 font-semibold">套餐</th>
                  <th className="text-left py-3 px-4 font-semibold">日期</th>
                  <th className="text-left py-3 px-4 font-semibold">状态</th>
                  <th className="text-right py-3 px-4 font-semibold">金额 / 积分</th>
                  <th className="text-right py-3 px-4 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const refunding = refundMutation.isPending && refundMutation.variables === order.order_id;
                  return (
                    <tr key={order.order_id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="py-3 px-4 font-medium">{order.package_name}</td>
                      <td className="py-3 px-4" style={{ color: 'var(--color-text-secondary)' }}>
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusBadge(order.status)}>{order.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        ¥{order.price_cny} · {order.credits} 分
                      </td>
                      <td className="py-3 px-4 text-right">
                        {order.status === 'completed' ? (
                          <Button variant="ghost" size="sm" loading={refunding} onClick={() => refundMutation.mutate(order.order_id)}>
                            退款
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
   </PageContainer>
  );
}
