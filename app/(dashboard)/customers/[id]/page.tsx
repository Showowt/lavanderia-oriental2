export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CustomerCard } from '@/components/customers/CustomerCard';
import { formatCurrency, formatDate, formatPhone, truncate } from '@/lib/utils';
import type { CustomerWithHistory } from '@/types';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getCustomer(id: string): Promise<CustomerWithHistory | null> {
  const { data: customer, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (customerError || !customer) {
    return null;
  }

  const [conversationsResult, ordersResult, totalOrdersResult, orderTotalsResult] =
    await Promise.all([
      supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabaseAdmin
        .from('orders')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', id),
      supabaseAdmin
        .from('orders')
        .select('total')
        .eq('customer_id', id)
        .neq('status', 'cancelled'),
    ]);

  const totalSpent =
    orderTotalsResult.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

  return {
    ...customer,
    conversations: conversationsResult.data || [],
    orders: ordersResult.data || [],
    total_orders: totalOrdersResult.count || 0,
    total_spent: totalSpent,
  } as CustomerWithHistory;
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="p-6">
      <Header
        title={customer.name || 'Cliente'}
        breadcrumbs={[
          { label: 'Clientes', href: '/customers' },
          { label: customer.name || formatPhone(customer.phone) },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Card */}
          <CustomerCard customer={customer} showActions={false} />

          {/* Recent Orders */}
          <Card>
            <CardHeader
              title="Órdenes Recientes"
              actions={
                <Link href={`/orders?customerId=${customer.id}`}>
                  <Button variant="ghost" size="sm">
                    Ver todas
                  </Button>
                </Link>
              }
            />
            <CardContent noPadding>
              {customer.orders.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  Sin órdenes
                </p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {customer.orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(order.total)}
                        </p>
                        <Badge status={order.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Conversations */}
          <Card>
            <CardHeader
              title="Conversaciones Recientes"
              actions={
                <Link href={`/conversations?customerId=${customer.id}`}>
                  <Button variant="ghost" size="sm">
                    Ver todas
                  </Button>
                </Link>
              }
            />
            <CardContent noPadding>
              {customer.conversations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  Sin conversaciones
                </p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {customer.conversations.map((conv) => (
                    <Link
                      key={conv.id}
                      href={`/conversations/${conv.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm text-gray-900">
                          {conv.message_count} mensajes
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(conv.created_at)}
                        </p>
                      </div>
                      <Badge status={conv.status} />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader title="Resumen" />
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total de órdenes</span>
                  <span className="text-lg font-bold text-gray-900">
                    {customer.total_orders}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total gastado</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(customer.total_spent)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Conversaciones</span>
                  <span className="text-lg font-bold text-gray-900">
                    {customer.conversations.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader title="Acciones" />
            <CardContent>
              <div className="space-y-2">
                <Link href={`/orders/new?customerId=${customer.id}`}>
                  <Button className="w-full">Nueva orden</Button>
                </Link>
                <Button variant="secondary" className="w-full">
                  Enviar mensaje
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
