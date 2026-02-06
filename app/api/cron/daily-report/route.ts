import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
    console.log('Running daily report cron job...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get metrics for yesterday
    // 1. Total messages
    const { count: totalMessages } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterdayStr)
      .lt('created_at', todayStr);

    // 2. AI handled messages
    const { count: aiMessages } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('ai_generated', true)
      .gte('created_at', yesterdayStr)
      .lt('created_at', todayStr);

    // 3. New conversations
    const { count: newConversations } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterdayStr)
      .lt('created_at', todayStr);

    // 4. Resolved conversations
    const { count: resolvedConversations } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved')
      .gte('updated_at', yesterdayStr)
      .lt('updated_at', todayStr);

    // 5. Escalations
    const { count: escalations } = await supabaseAdmin
      .from('escalations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterdayStr)
      .lt('created_at', todayStr);

    // 6. Orders and revenue
    const { data: ordersData } = await supabaseAdmin
      .from('orders')
      .select('total, status')
      .gte('created_at', yesterdayStr)
      .lt('created_at', todayStr);

    const totalOrders = ordersData?.length || 0;
    const totalRevenue = ordersData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    const completedOrders = ordersData?.filter((o) => o.status === 'completed').length || 0;

    // 7. New customers
    const { count: newCustomers } = await supabaseAdmin
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterdayStr)
      .lt('created_at', todayStr);

    // Calculate average response time (simplified - would need message timestamps)
    const avgResponseTime = 0; // TODO: Calculate from message pairs

    const metrics = {
      total_messages: totalMessages || 0,
      ai_handled_messages: aiMessages || 0,
      total_conversations: newConversations || 0,
      resolved_conversations: resolvedConversations || 0,
      escalations: escalations || 0,
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      completed_orders: completedOrders,
      new_customers: newCustomers || 0,
      avg_response_time: avgResponseTime,
    };

    // Save daily report
    const { data: report, error: reportError } = await supabaseAdmin
      .from('daily_reports')
      .upsert({
        report_date: yesterdayStr,
        metrics,
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error saving daily report:', reportError);
      throw reportError;
    }

    // Send report to owner via email if configured
    if (process.env.OWNER_EMAIL && process.env.SENDGRID_API_KEY) {
      try {
        await sendReportEmail(yesterdayStr, metrics);
        console.log('Daily report email sent to owner');
      } catch (emailError) {
        console.error('Error sending report email:', emailError);
      }
    }

    // Create notification for dashboard
    await supabaseAdmin.from('notifications').insert({
      type: 'report',
      title: 'Reporte diario generado',
      message: `Reporte del ${yesterdayStr}: ${totalOrders} órdenes, $${totalRevenue.toFixed(2)} ingresos`,
      link: '/analytics',
      metadata: { report_date: yesterdayStr, ...metrics },
    });

    console.log('Daily report generated successfully:', metrics);

    return NextResponse.json({
      success: true,
      report_date: yesterdayStr,
      metrics,
    });
  } catch (error) {
    console.error('Daily report cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Send report via email (placeholder - install @sendgrid/mail to enable)
async function sendReportEmail(
  date: string,
  metrics: Record<string, number>
): Promise<void> {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  // Log report summary (email can be enabled by installing @sendgrid/mail)
  console.log('Daily Report Summary:', {
    date,
    orders: metrics.total_orders,
    revenue: formatCurrency(metrics.total_revenue),
    conversations: metrics.total_conversations,
    escalations: metrics.escalations,
  });

  // To enable email reports:
  // 1. npm install @sendgrid/mail
  // 2. Set SENDGRID_API_KEY and OWNER_EMAIL in environment
  // 3. Uncomment the SendGrid code below

  /*
  if (process.env.SENDGRID_API_KEY && process.env.OWNER_EMAIL) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const emailContent = `
      <h2>Reporte Diario - Lavandería Oriental</h2>
      <p><strong>Fecha:</strong> ${date}</p>
      <h3>Ventas: ${metrics.total_orders} órdenes, ${formatCurrency(metrics.total_revenue)}</h3>
    `;

    await sgMail.send({
      to: process.env.OWNER_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL || 'reportes@lavanderiaoriental.com',
      subject: 'Reporte Diario - Lavandería Oriental',
      html: emailContent,
    });
  }
  */
}
