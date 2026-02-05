export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils';
import { OrderStatusActions } from './OrderStatusActions';
import type { OrderWithDetails } from '@/types';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getOrder(id: string): Promise<OrderWithDetails | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`*, customer:customers(*), location:locations(*)`)
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as OrderWithDetails;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="p-6">
      <Header
        title={`Orden #${order.id.slice(0, 8)}`}
        breadcrumbs={[
          { label: 'Órdenes', href: '/orders' },
          { label: `#${order.id.slice(0, 8)}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Badge status={order.status} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader title="Servicios" />
            <CardContent noPadding>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(order.items || []).map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.service_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-sm text-gray-600 text-right">
                      Subtotal
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(order.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-sm text-gray-600 text-right">
                      IVA (16%)
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(order.tax)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-base font-bold text-gray-900 text-right">
                      Total
                    </td>
                    <td className="px-6 py-3 text-base font-bold text-blue-600 text-right">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader title="Notas" />
              <CardContent>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Status Actions */}
          <OrderStatusActions orderId={order.id} currentStatus={order.status} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader title="Cliente" />
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.customer?.name || 'Sin nombre'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatPhone(order.customer?.phone || '')}
                  </p>
                </div>
                {order.customer?.email && (
                  <p className="text-sm text-gray-500">{order.customer.email}</p>
                )}
                <Link href={`/customers/${order.customer?.id}`}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Ver perfil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          {order.location && (
            <Card>
              <CardHeader title="Ubicación" />
              <CardContent>
                <p className="text-sm font-medium text-gray-900">
                  {order.location.name}
                </p>
                <p className="text-sm text-gray-500">{order.location.address}</p>
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <Card>
            <CardHeader title="Fechas" />
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Creada</span>
                  <span className="text-gray-900">{formatDate(order.created_at)}</span>
                </div>
                {order.pickup_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recolección</span>
                    <span className="text-gray-900">{formatDate(order.pickup_date)}</span>
                  </div>
                )}
                {order.delivery_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Entrega</span>
                    <span className="text-gray-900">{formatDate(order.delivery_date)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
