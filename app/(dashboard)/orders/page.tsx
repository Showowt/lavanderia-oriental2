export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { PageHeader } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Pagination, PaginationInfo } from '@/components/ui/Pagination';
import { OrderList } from '@/components/orders/OrderList';
import type { OrderListItem } from '@/types';

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

async function getOrders(status?: string, page = 1) {
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  let query = supabaseAdmin
    .from('orders')
    .select(
      `*, customer:customers(id, name, phone), location:locations(id, name)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return { orders: [], total: 0 };
  }

  return {
    orders: (data || []) as OrderListItem[],
    total: count || 0,
  };
}

async function getStatusCounts() {
  const statuses = ['pending', 'confirmed', 'in_progress', 'ready', 'delivered'];
  const results = await Promise.all([
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
    ...statuses.map((s) =>
      supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', s)
    ),
  ]);

  return {
    all: results[0].count || 0,
    pending: results[1].count || 0,
    confirmed: results[2].count || 0,
    in_progress: results[3].count || 0,
    ready: results[4].count || 0,
    delivered: results[5].count || 0,
  };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const status = params.status || 'all';
  const page = parseInt(params.page || '1');

  const [{ orders, total }, statusCounts] = await Promise.all([
    getOrders(status, page),
    getStatusCounts(),
  ]);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  const tabs = [
    { id: 'all', label: 'Todas', count: statusCounts.all },
    { id: 'pending', label: 'Pendientes', count: statusCounts.pending },
    { id: 'confirmed', label: 'Confirmadas', count: statusCounts.confirmed },
    { id: 'in_progress', label: 'En Proceso', count: statusCounts.in_progress },
    { id: 'ready', label: 'Listas', count: statusCounts.ready },
    { id: 'delivered', label: 'Entregadas', count: statusCounts.delivered },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Órdenes"
        description="Gestiona las órdenes de servicio"
        actions={
          <Link href="/orders/new">
            <Button>Nueva Orden</Button>
          </Link>
        }
      />

      {/* Status Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/orders?status=${tab.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              status === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Orders List */}
      <Card>
        <CardContent noPadding>
          <OrderList orders={orders} />
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <PaginationInfo page={page} pageSize={pageSize} total={total} />
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/orders?status=${status}&page=${page - 1}`}>
                <Button variant="secondary">Anterior</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/orders?status=${status}&page=${page + 1}`}>
                <Button variant="secondary">Siguiente</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
