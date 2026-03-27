import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
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

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="p-6">
      <p className="editorial-kicker mb-2">{label}</p>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {hint}
      </p>
    </Card>
  );
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
    mutationFn: (packageCode: string) => mockPurchase(packageCode),
    onSuccess: (data) => {
      if (user) {
        setUser({ ...user, credits: data.credits_total });
      }
      queryClient.invalidateQueries({ queryKey: ['payment-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast({ type: 'success', message: `${data.package_name} purchased successfully.` });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Purchase failed.' }),
  });

  const stripeMutation = useMutation({
    mutationFn: (packageCode: string) => createCheckout(packageCode),
    onSuccess: (data) => {
      window.location.href = data.checkout_url;
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Could not create checkout session.' }),
  });

  const refundMutation = useMutation({
    mutationFn: (orderId: string) => refundOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['payment-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast({ type: 'success', message: `Refund completed for ${orderId}.` });
    },
    onError: (error: Error) => addToast({ type: 'error', message: error.message || 'Refund failed.' }),
  });

  const completedOrders = useMemo(() => orders.filter((order) => order.status === 'completed').length, [orders]);
  const totalSpent = useMemo(
    () => orders.filter((order) => order.status === 'completed').reduce((sum, order) => sum + order.price_cny, 0),
    [orders],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Billing and credits"
        description="Manage credit packages, review order history, and keep payment activity aligned with real usage."
        action={
          <Button
            className="w-full md:w-auto"
            onClick={() => pricing[0] && mockPurchaseMutation.mutate(pricing[0].code)}
            loading={mockPurchaseMutation.isPending && mockPurchaseMutation.variables === pricing[0]?.code}
            disabled={!pricing.length}
          >
            Quick top-up
          </Button>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard label="Available credits" value={String(user?.credits ?? 0)} hint="Ready for new analyses" />
        <MetricCard label="Completed orders" value={String(completedOrders)} hint="Successful purchases on this account" />
        <MetricCard label="Total spent" value={`CNY ${totalSpent}`} hint="Based on completed orders only" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.08fr_0.92fr] gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="editorial-kicker mb-2">Pricing</p>
              <h2 className="text-2xl font-bold tracking-tight">Choose a package</h2>
            </div>
            <Badge variant="primary">{user?.credits ?? 0} credits</Badge>
          </div>

          {pricingLoading ? (
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading pricing...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricing.map((plan) => {
                const buyingInstantly = mockPurchaseMutation.isPending && mockPurchaseMutation.variables === plan.code;
                const buyingWithStripe = stripeMutation.isPending && stripeMutation.variables === plan.code;

                return (
                  <div key={plan.code} className="rounded-[var(--radius-xl)] p-5" style={{ background: 'var(--color-surface-container-low)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">{plan.name}</p>
                        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{plan.credits} credits</p>
                      </div>
                      <Badge variant="secondary">CNY {plan.price_cny}</Badge>
                    </div>

                    <p className="mt-4 text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>{plan.description}</p>

                    <div className="mt-4 space-y-2">
                      {plan.includes.map((item) => (
                        <div key={item} className="text-sm flex items-start gap-2">
                          <span className="material-symbols-outlined text-base mt-0.5" style={{ color: 'var(--color-primary)' }}>
                            check_circle
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button className="w-full" loading={buyingInstantly} onClick={() => mockPurchaseMutation.mutate(plan.code)}>
                        Buy instantly
                      </Button>
                      <Button className="w-full" variant="secondary" loading={buyingWithStripe} onClick={() => stripeMutation.mutate(plan.code)}>
                        Checkout with Stripe
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-6">
            <p className="editorial-kicker mb-2">Order history</p>
            <h2 className="text-2xl font-bold tracking-tight">Recent payments</h2>
          </div>

          {ordersLoading ? (
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon="receipt_long"
              title="No payment records yet"
              description="Your purchases will appear here as soon as you top up."
            />
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const refunding = refundMutation.isPending && refundMutation.variables === order.order_id;

                return (
                  <div key={order.order_id} className="rounded-[var(--radius-xl)] p-4" style={{ background: 'var(--color-surface-container-low)' }}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{order.package_name}</p>
                        <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {formatDate(order.created_at)} · {order.payment_method}
                        </p>
                      </div>
                      <Badge variant={statusBadge(order.status)}>{order.status}</Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm">
                        {order.credits} credits · CNY {order.price_cny}
                      </div>
                      {order.status === 'completed' ? (
                        <Button variant="ghost" loading={refunding} onClick={() => refundMutation.mutate(order.order_id)}>
                          Refund
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>
    </PageContainer>
  );
}
