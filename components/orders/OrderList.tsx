'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { EmptyState, ShoppingBagIcon } from '@/components/ui/EmptyState';
import { formatDate, formatCurrency, formatPhone } from '@/lib/utils';
import type { OrderListItem } from '@/types';

interface OrderListProps {
  orders: OrderListItem[];
}

export function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBagIcon />}
        title="Sin órdenes"
        description="Las órdenes aparecerán aquí cuando se creen"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Ubicación</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id} clickable>
            <TableCell>
              <Link
                href={`/orders/${order.id}`}
                className="flex flex-col hover:text-blue-600"
              >
                <span className="font-medium">
                  {order.customer?.name || 'Cliente'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatPhone(order.customer?.phone || '')}
                </span>
              </Link>
            </TableCell>
            <TableCell>
              <span className="text-gray-600">
                {order.location?.name || 'Sin ubicación'}
              </span>
            </TableCell>
            <TableCell>
              <Badge status={order.status} />
            </TableCell>
            <TableCell>
              <span className="font-medium">{formatCurrency(order.total)}</span>
            </TableCell>
            <TableCell>
              <span className="text-gray-500">{formatDate(order.created_at)}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Compact version for dashboard
interface RecentOrdersProps {
  orders: OrderListItem[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Sin órdenes recientes
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {orders.slice(0, 5).map((order) => (
        <Link
          key={order.id}
          href={`/orders/${order.id}`}
          className="flex items-center justify-between py-3 px-1 hover:bg-gray-50 transition-colors rounded"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {order.customer?.name || formatPhone(order.customer?.phone || '')}
            </p>
            <p className="text-xs text-gray-500">
              {order.items?.length || 0} servicios
            </p>
          </div>
          <div className="flex-shrink-0 ml-2 text-right">
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(order.total)}
            </p>
            <Badge status={order.status} className="mt-1" />
          </div>
        </Link>
      ))}
    </div>
  );
}
