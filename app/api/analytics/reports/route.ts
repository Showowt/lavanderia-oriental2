import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { reportFilterSchema } from '@/lib/validations';
import type { AnalyticsReport, DailyReportMetrics } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Default to last 7 days if no dates provided
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const params = reportFilterSchema.parse({
      dateFrom: searchParams.get('dateFrom') || weekAgo.toISOString().split('T')[0],
      dateTo: searchParams.get('dateTo') || today.toISOString().split('T')[0],
    });

    // Try to get cached daily reports first
    const { data: cachedReports } = await supabaseAdmin
      .from('daily_reports')
      .select('*')
      .gte('report_date', params.dateFrom)
      .lte('report_date', params.dateTo)
      .order('report_date', { ascending: true });

    // If we have cached reports, use them
    if (cachedReports && cachedReports.length > 0) {
      const totals = calculateTotals(cachedReports.map(r => r.metrics as DailyReportMetrics));

      const report: AnalyticsReport = {
        period: {
          from: params.dateFrom,
          to: params.dateTo,
        },
        totals,
        daily: cachedReports.map(r => ({
          date: r.report_date,
          metrics: r.metrics as DailyReportMetrics,
        })),
      };

      return NextResponse.json(report);
    }

    // Otherwise, calculate metrics from raw data
    const fromDate = new Date(params.dateFrom);
    const toDate = new Date(params.dateTo);
    toDate.setHours(23, 59, 59, 999);

    const [
      conversationsData,
      messagesData,
      ordersData,
    ] = await Promise.all([
      // Conversations in period
      supabaseAdmin
        .from('conversations')
        .select('id, status, created_at, updated_at')
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString()),

      // Messages in period
      supabaseAdmin
        .from('messages')
        .select('id, ai_generated, created_at')
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString()),

      // Orders in period
      supabaseAdmin
        .from('orders')
        .select('id, total, status, created_at')
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString()),
    ]);

    const conversations = conversationsData.data || [];
    const messages = messagesData.data || [];
    const orders = ordersData.data || [];

    // Calculate totals
    const totals: DailyReportMetrics = {
      total_conversations: conversations.length,
      new_conversations: conversations.length,
      resolved_conversations: conversations.filter(c => c.status === 'resolved').length,
      escalated_conversations: conversations.filter(c => c.status === 'escalated').length,
      total_messages: messages.length,
      ai_messages: messages.filter(m => m.ai_generated).length,
      agent_messages: messages.filter(m => !m.ai_generated).length,
      total_orders: orders.length,
      orders_value: orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0),
      avg_response_time_seconds: null, // Would need more complex calculation
    };

    // Group by day
    const daily: Array<{ date: string; metrics: DailyReportMetrics }> = [];
    const currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayConversations = conversations.filter(c => {
        const created = new Date(c.created_at);
        return created >= currentDate && created < nextDate;
      });

      const dayMessages = messages.filter(m => {
        const created = new Date(m.created_at);
        return created >= currentDate && created < nextDate;
      });

      const dayOrders = orders.filter(o => {
        const created = new Date(o.created_at);
        return created >= currentDate && created < nextDate;
      });

      daily.push({
        date: dateStr,
        metrics: {
          total_conversations: dayConversations.length,
          new_conversations: dayConversations.length,
          resolved_conversations: dayConversations.filter(c => c.status === 'resolved').length,
          escalated_conversations: dayConversations.filter(c => c.status === 'escalated').length,
          total_messages: dayMessages.length,
          ai_messages: dayMessages.filter(m => m.ai_generated).length,
          agent_messages: dayMessages.filter(m => !m.ai_generated).length,
          total_orders: dayOrders.length,
          orders_value: dayOrders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + (o.total || 0), 0),
          avg_response_time_seconds: null,
        },
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const report: AnalyticsReport = {
      period: {
        from: params.dateFrom,
        to: params.dateTo,
      },
      totals,
      daily,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al obtener reportes' },
      { status: 500 }
    );
  }
}

function calculateTotals(metrics: DailyReportMetrics[]): DailyReportMetrics {
  return metrics.reduce(
    (totals, day) => ({
      total_conversations: totals.total_conversations + day.total_conversations,
      new_conversations: totals.new_conversations + day.new_conversations,
      resolved_conversations: totals.resolved_conversations + day.resolved_conversations,
      escalated_conversations: totals.escalated_conversations + day.escalated_conversations,
      total_messages: totals.total_messages + day.total_messages,
      ai_messages: totals.ai_messages + day.ai_messages,
      agent_messages: totals.agent_messages + day.agent_messages,
      total_orders: totals.total_orders + day.total_orders,
      orders_value: totals.orders_value + day.orders_value,
      avg_response_time_seconds: null,
    }),
    {
      total_conversations: 0,
      new_conversations: 0,
      resolved_conversations: 0,
      escalated_conversations: 0,
      total_messages: 0,
      ai_messages: 0,
      agent_messages: 0,
      total_orders: 0,
      orders_value: 0,
      avg_response_time_seconds: null,
    }
  );
}
