export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { RecentOrders } from '@/components/orders/OrderList';
import type { OrderListItem } from '@/types';

async function getEmployeeData() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get employee details
  const { data: employee } = await supabaseAdmin
    .from('employees')
    .select('*, location:locations(*)')
    .eq('auth_id', user.id)
    .single();

  if (!employee) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // Get orders for employee's location (if assigned)
  let ordersQuery = supabaseAdmin
    .from('orders')
    .select(`*, customer:customers(id, name, phone), location:locations(id, name)`)
    .order('created_at', { ascending: false })
    .limit(10);

  if (employee.location_id) {
    ordersQuery = ordersQuery.eq('location_id', employee.location_id);
  }

  const [ordersResult, todayOrdersResult, pendingOrdersResult] = await Promise.all([
    ordersQuery,
    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)
      .eq('location_id', employee.location_id || ''),
    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed', 'in_progress'])
      .eq('location_id', employee.location_id || ''),
  ]);

  return {
    employee,
    orders: (ordersResult.data || []) as OrderListItem[],
    stats: {
      todayOrders: todayOrdersResult.count || 0,
      pendingOrders: pendingOrdersResult.count || 0,
    },
  };
}

export default async function EmployeeDashboardPage() {
  const data = await getEmployeeData();

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          Error al cargar datos del empleado
        </div>
      </div>
    );
  }

  const { employee, orders, stats } = data;
  const locationName = employee.location?.name || 'Sin ubicación asignada';

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Bienvenido, {employee.name}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {locationName}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatsCard
          title="Órdenes Hoy"
          value={stats.todayOrders}
          color="brand"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <StatsCard
          title="Órdenes Pendientes"
          value={stats.pendingOrders}
          color={stats.pendingOrders > 5 ? 'error' : 'success'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader
          title="Órdenes Recientes"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <CardContent noPadding>
          {orders.length > 0 ? (
            <RecentOrders orders={orders} />
          ) : (
            <div className="p-8 text-center text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>No hay órdenes todavía</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
