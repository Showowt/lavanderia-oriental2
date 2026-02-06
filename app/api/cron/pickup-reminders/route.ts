import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendPickupReminder } from '@/lib/notifications';
import type { Customer, Order } from '@/types';

// Verify cron secret to prevent unauthorized access
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET) {
    // Allow if no secret configured (development)
    return true;
  }
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Running pickup reminder cron job...');

    // Get orders that are ready but haven't been picked up
    // Only remind for orders ready for more than 1 day
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('status', 'ready')
      .lt('updated_at', oneDayAgo.toISOString())
      .order('updated_at', { ascending: true });

    if (error) {
      console.error('Error fetching orders for reminder:', error);
      throw error;
    }

    console.log(`Found ${orders?.length || 0} orders needing reminders`);

    const results: { orderId: string; success: boolean; error?: string }[] = [];

    for (const order of orders || []) {
      if (!order.customer) {
        results.push({ orderId: order.id, success: false, error: 'No customer found' });
        continue;
      }

      // Calculate days since ready
      const readyDate = new Date(order.updated_at);
      const now = new Date();
      const daysAgo = Math.floor((now.getTime() - readyDate.getTime()) / (1000 * 60 * 60 * 24));

      // Don't send more than one reminder per day per order
      // Check if we already sent a reminder today
      const { data: recentNotifs } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('type', 'reminder')
        .ilike('message', `%${order.id.slice(-8)}%`)
        .gte('created_at', new Date(now.setHours(0, 0, 0, 0)).toISOString())
        .limit(1);

      if (recentNotifs && recentNotifs.length > 0) {
        console.log(`Already sent reminder for order ${order.id} today, skipping`);
        continue;
      }

      const customer = order.customer as Customer;
      const result = await sendPickupReminder(order as Order, customer, daysAgo);

      // Log the reminder
      await supabaseAdmin.from('notifications').insert({
        type: 'reminder',
        title: 'Recordatorio de recogida enviado',
        message: `Recordatorio enviado para orden ${order.id.slice(-8).toUpperCase()} (${daysAgo} días)`,
        link: `/orders/${order.id}`,
        metadata: {
          order_id: order.id,
          customer_id: customer.id,
          days_waiting: daysAgo,
          whatsapp_sent: result.success,
        },
      });

      results.push({
        orderId: order.id,
        success: result.success,
        error: result.error,
      });
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`Pickup reminders complete: ${successful} sent, ${failed} failed`);

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        successful,
        failed,
      },
      results,
    });
  } catch (error) {
    console.error('Pickup reminder cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
