import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { DashboardData, DashboardStats, ConversationListItem, OrderListItem, EscalationWithDetails } from '@/types';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Fetch all stats in parallel
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
      // Active conversations count
      supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),

      // Pending escalations count
      supabaseAdmin
        .from('escalations')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'claimed']),

      // Today's orders count
      supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO),

      // Today's revenue
      supabaseAdmin
        .from('orders')
        .select('total')
        .gte('created_at', todayISO)
        .neq('status', 'cancelled'),

      // Total customers
      supabaseAdmin
        .from('customers')
        .select('*', { count: 'exact', head: true }),

      // Resolved today
      supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved')
        .gte('updated_at', todayISO),

      // Recent conversations (last 5)
      supabaseAdmin
        .from('conversations')
        .select(`
          *,
          customer:customers(id, name, phone)
        `)
        .order('updated_at', { ascending: false })
        .limit(5),

      // Recent orders (last 5)
      supabaseAdmin
        .from('orders')
        .select(`
          *,
          customer:customers(id, name, phone),
          location:locations(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(5),

      // Pending escalations (for display)
      supabaseAdmin
        .from('escalations')
        .select(`
          *,
          conversation:conversations(
            *,
            customer:customers(*)
          )
        `)
        .in('status', ['pending', 'claimed'])
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    // Calculate today's revenue
    const todayRevenue = todayRevenueResult.data?.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    ) || 0;

    // Build stats object
    const stats: DashboardStats = {
      activeConversations: activeConversationsResult.count || 0,
      pendingEscalations: pendingEscalationsResult.count || 0,
      todayOrders: todayOrdersResult.count || 0,
      todayRevenue,
      totalCustomers: totalCustomersResult.count || 0,
      resolvedToday: resolvedTodayResult.count || 0,
    };

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

    const response: DashboardData = {
      stats,
      recentConversations,
      recentOrders: (recentOrdersResult.data || []) as OrderListItem[],
      pendingEscalations: (escalationsResult.data || []) as EscalationWithDetails[],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al obtener datos del dashboard' },
      { status: 500 }
    );
  }
}
