export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { PageHeader } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, UsersIcon } from '@/components/ui/EmptyState';
import { PaginationInfo } from '@/components/ui/Pagination';
import { formatPhone, formatDate, formatCurrency } from '@/lib/utils';
import type { Customer } from '@/types';

interface CustomersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

async function getCustomers(page = 1, search?: string) {
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  let query = supabaseAdmin
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (search) {
    query = query.or(
      `phone.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching customers:', error);
    return { customers: [], total: 0 };
  }

  return {
    customers: (data || []) as Customer[],
    total: count || 0,
  };
}

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const search = params.search;

  const { customers, total } = await getCustomers(page, search);
  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6">
      <PageHeader
        title="Clientes"
        description="Directorio de clientes de Lavandería Oriental"
      />

      {/* Search */}
      <div className="mb-6">
        <form className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Buscar por nombre, teléfono o email..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <Button type="submit">Buscar</Button>
        </form>
      </div>

      {/* Customers List */}
      {customers.length === 0 ? (
        <EmptyState
          icon={<UsersIcon />}
          title="Sin clientes"
          description={
            search
              ? 'No se encontraron clientes con ese criterio'
              : 'Los clientes aparecerán aquí cuando interactúen por WhatsApp'
          }
        />
      ) : (
        <Card>
          <CardContent noPadding>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Órdenes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total gastado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Desde
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {customer.name || 'Sin nombre'}
                        </p>
                        <Badge variant={customer.language === 'es' ? 'info' : 'default'}>
                          {customer.language === 'es' ? 'ES' : 'EN'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {formatPhone(customer.phone)}
                      </p>
                      {customer.email && (
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {(customer as Customer & { total_orders?: number }).total_orders || 0}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(
                          (customer as Customer & { total_spent?: number }).total_spent || 0
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500">
                        {formatDate(customer.created_at)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <PaginationInfo page={page} pageSize={pageSize} total={total} />
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/customers?page=${page - 1}${search ? `&search=${search}` : ''}`}
              >
                <Button variant="secondary">Anterior</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/customers?page=${page + 1}${search ? `&search=${search}` : ''}`}
              >
                <Button variant="secondary">Siguiente</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
