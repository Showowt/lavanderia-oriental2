'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPhone, formatCurrency, formatDate, getInitials } from '@/lib/utils';
import type { Customer, CustomerWithHistory } from '@/types';

interface CustomerCardProps {
  customer: Customer | CustomerWithHistory;
  showActions?: boolean;
}

export function CustomerCard({ customer, showActions = true }: CustomerCardProps) {
  const hasHistory = 'total_orders' in customer;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-medium text-blue-700">
              {getInitials(customer.name)}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900">
                {customer.name || 'Sin nombre'}
              </h3>
              <Badge variant={customer.language === 'es' ? 'info' : 'default'}>
                {customer.language === 'es' ? 'Español' : 'English'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatPhone(customer.phone)}
            </p>
            {customer.email && (
              <p className="text-sm text-gray-500">{customer.email}</p>
            )}

            {/* Stats */}
            {hasHistory && (
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-500">Órdenes</p>
                  <p className="text-sm font-medium">
                    {(customer as CustomerWithHistory).total_orders}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total gastado</p>
                  <p className="text-sm font-medium">
                    {formatCurrency((customer as CustomerWithHistory).total_spent)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cliente desde</p>
                  <p className="text-sm font-medium">
                    {formatDate(customer.created_at)}
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {customer.notes && (
              <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                {customer.notes}
              </p>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex-shrink-0">
              <Link href={`/customers/${customer.id}`}>
                <Button variant="secondary" size="sm">
                  Ver perfil
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact info display for conversation sidebar
interface CustomerInfoProps {
  customer: Customer;
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-blue-700">
            {getInitials(customer.name)}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {customer.name || 'Sin nombre'}
          </p>
          <p className="text-xs text-gray-500">{formatPhone(customer.phone)}</p>
        </div>
      </div>

      {customer.email && (
        <div>
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-sm text-gray-900">{customer.email}</p>
        </div>
      )}

      <div>
        <p className="text-xs text-gray-500">Idioma</p>
        <p className="text-sm text-gray-900">
          {customer.language === 'es' ? 'Español' : 'English'}
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-500">Cliente desde</p>
        <p className="text-sm text-gray-900">{formatDate(customer.created_at)}</p>
      </div>

      {customer.notes && (
        <div>
          <p className="text-xs text-gray-500">Notas</p>
          <p className="text-sm text-gray-600">{customer.notes}</p>
        </div>
      )}

      <Link href={`/customers/${customer.id}`}>
        <Button variant="secondary" size="sm" className="w-full">
          Ver perfil completo
        </Button>
      </Link>
    </div>
  );
}
