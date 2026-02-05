export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RecentConversations } from '@/components/conversations/ConversationList';
import { RecentOrders } from '@/components/orders/OrderList';
import { EscalationAlerts } from '@/components/escalations/EscalationQueue';
import type { DashboardData, ConversationListItem, OrderListItem, EscalationWithDetails } from '@/types';

async function getDashboardData(): Promise<DashboardData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [
    activeConversationsResult,
    pendingEscalationsResult,
    todayOrdersResult,
    todayRevenueResult,
    totalCustomersResult,
    resolvedTodayResult,
    recentConversationsResult,
    recentOrdersResult,
    escalationsResult,
  ] = await Promise.all([
    supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabaseAdmin
      .from('escalations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'claimed']),
    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO),
    supabaseAdmin
      .from('orders')
      .select('total')
      .gte('created_at', todayISO)
      .neq('status', 'cancelled'),
    supabaseAdmin
      .from('customers')
      .select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved')
      .gte('updated_at', todayISO),
    supabaseAdmin
      .from('conversations')
      .select(`*, customer:customers(id, name, phone)`)
      .order('updated_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('orders')
      .select(`*, customer:customers(id, name, phone), location:locations(id, name)`)
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('escalations')
      .select(`*, conversation:conversations(*, customer:customers(*))`)
      .in('status', ['pending', 'claimed'])
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const todayRevenue = todayRevenueResult.data?.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  ) || 0;

  // Get last message for recent conversations
  const recentConversations: ConversationListItem[] = await Promise.all(
    (recentConversationsResult.data || []).map(async (conv) => {
      const { data: lastMessage } = await supabaseAdmin
        .from('messages')
        .select('content, direction, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        ...conv,
        last_message: lastMessage || undefined,
      } as ConversationListItem;
    })
  );

  return {
    stats: {
      activeConversations: activeConversationsResult.count || 0,
      pendingEscalations: pendingEscalationsResult.count || 0,
      todayOrders: todayOrdersResult.count || 0,
      todayRevenue,
      totalCustomers: totalCustomersResult.count || 0,
      resolvedToday: resolvedTodayResult.count || 0,
    },
    recentConversations,
    recentOrders: (recentOrdersResult.data || []) as OrderListItem[],
    pendingEscalations: (escalationsResult.data || []) as EscalationWithDetails[],
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Resumen de actividad de Lavandería Oriental
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/conversations">
            <Button variant="secondary">Ver conversaciones</Button>
          </Link>
          <Link href="/orders">
            <Button>Nueva orden</Button>
          </Link>
        </div>
      </div>

      {/* Escalation Alert */}
      {data.pendingEscalations.length > 0 && (
        <div className="mb-6">
          <EscalationAlerts escalations={data.pendingEscalations} />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Conversaciones Activas"
          value={data.stats.activeConversations}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
        <StatsCard
          title="Órdenes Hoy"
          value={data.stats.todayOrders}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <StatsCard
          title="Ingresos Hoy"
          value={formatCurrency(data.stats.todayRevenue)}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Clientes Totales"
          value={data.stats.totalCustomers}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatsCard
          title="Escalaciones Pendientes"
          value={data.stats.pendingEscalations}
          color={data.stats.pendingEscalations > 0 ? 'red' : 'green'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatsCard
          title="Resueltas Hoy"
          value={data.stats.resolvedToday}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Conversaciones Recientes"
            actions={
              <Link href="/conversations">
                <Button variant="ghost" size="sm">
                  Ver todas
                </Button>
              </Link>
            }
          />
          <CardContent noPadding>
            <RecentConversations conversations={data.recentConversations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Órdenes Recientes"
            actions={
              <Link href="/orders">
                <Button variant="ghost" size="sm">
                  Ver todas
                </Button>
              </Link>
            }
          />
          <CardContent noPadding>
            <RecentOrders orders={data.recentOrders} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
