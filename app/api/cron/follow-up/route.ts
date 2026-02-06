import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendFollowUpMessage, getInactiveCustomers } from '@/lib/notifications';
import type { Customer } from '@/types';

// Verify cron secret to prevent unauthorized access
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET) {
    return true;
  }
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Running follow-up cron job...');

    // Get customers who haven't ordered in 30 days
    const inactiveCustomers = await getInactiveCustomers(30);

    console.log(`Found ${inactiveCustomers.length} inactive customers`);

    // Limit to 50 per run to avoid overwhelming the system
    const customersToContact = inactiveCustomers.slice(0, 50);

    const results: { customerId: string; success: boolean; error?: string }[] = [];

    for (const customer of customersToContact) {
      // Check if we already sent a follow-up recently (within 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentFollowups } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('type', 'followup')
        .contains('metadata', { customer_id: customer.id })
        .gte('created_at', sevenDaysAgo.toISOString())
        .limit(1);

      if (recentFollowups && recentFollowups.length > 0) {
        console.log(`Already sent follow-up to customer ${customer.id} recently, skipping`);
        continue;
      }

      const result = await sendFollowUpMessage(customer as Customer);

      // Log the follow-up
      await supabaseAdmin.from('notifications').insert({
        type: 'followup',
        title: 'Follow-up enviado',
        message: `Mensaje de seguimiento enviado a ${customer.name || customer.phone}`,
        link: `/customers/${customer.id}`,
        metadata: {
          customer_id: customer.id,
          last_order_at: customer.last_order_at,
          whatsapp_sent: result.success,
        },
      });

      results.push({
        customerId: customer.id,
        success: result.success,
        error: result.error,
      });

      // Small delay between messages to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`Follow-up complete: ${successful} sent, ${failed} failed`);

    return NextResponse.json({
      success: true,
      summary: {
        totalInactive: inactiveCustomers.length,
        processed: results.length,
        successful,
        failed,
      },
      results,
    });
  } catch (error) {
    console.error('Follow-up cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
