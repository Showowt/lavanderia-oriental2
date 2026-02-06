import twilio from 'twilio';
import { supabaseAdmin } from './supabase';
import type { Order, Customer } from '@/types';

// Twilio client initialization
function getTwilioClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Message templates for different notification types
const messageTemplates = {
  es: {
    order_created: (orderNumber: string, total: string) =>
      `¡Hola! Tu orden #${orderNumber} ha sido creada por ${total}. Te avisaremos cuando esté lista. - Lavandería Oriental`,
    order_ready: (orderNumber: string, location?: string) =>
      `¡Tu orden #${orderNumber} está lista para recoger!${location ? ` Puedes pasar a recogerla en ${location}.` : ''} Horario: L-V 7am-8pm, Sáb 8am-6pm. - Lavandería Oriental`,
    order_completed: (orderNumber: string) =>
      `Gracias por tu visita. Tu orden #${orderNumber} ha sido entregada. ¡Esperamos verte pronto! - Lavandería Oriental`,
    order_in_progress: (orderNumber: string) =>
      `Tu orden #${orderNumber} está siendo procesada. Te notificaremos cuando esté lista. - Lavandería Oriental`,
    pickup_reminder: (orderNumber: string, daysAgo: number) =>
      `Recordatorio: Tu orden #${orderNumber} está lista desde hace ${daysAgo} día(s). Por favor pasa a recogerla pronto. - Lavandería Oriental`,
    followup: (customerName: string) =>
      `¡Hola${customerName ? ` ${customerName}` : ''}! Ha pasado un tiempo desde tu última visita. ¿Necesitas nuestros servicios de lavandería? Responde para más info. - Lavandería Oriental`,
  },
  en: {
    order_created: (orderNumber: string, total: string) =>
      `Hello! Your order #${orderNumber} has been created for ${total}. We'll notify you when it's ready. - Lavandería Oriental`,
    order_ready: (orderNumber: string, location?: string) =>
      `Your order #${orderNumber} is ready for pickup!${location ? ` Pick it up at ${location}.` : ''} Hours: M-F 7am-8pm, Sat 8am-6pm. - Lavandería Oriental`,
    order_completed: (orderNumber: string) =>
      `Thank you for your visit. Your order #${orderNumber} has been delivered. See you soon! - Lavandería Oriental`,
    order_in_progress: (orderNumber: string) =>
      `Your order #${orderNumber} is being processed. We'll notify you when it's ready. - Lavandería Oriental`,
    pickup_reminder: (orderNumber: string, daysAgo: number) =>
      `Reminder: Your order #${orderNumber} has been ready for ${daysAgo} day(s). Please pick it up soon. - Lavandería Oriental`,
    followup: (customerName: string) =>
      `Hello${customerName ? ` ${customerName}` : ''}! It's been a while since your last visit. Need our laundry services? Reply for more info. - Lavandería Oriental`,
  },
};

export type NotificationType =
  | 'order_created'
  | 'order_ready'
  | 'order_completed'
  | 'order_in_progress'
  | 'pickup_reminder'
  | 'followup';

export interface SendNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Send WhatsApp message
export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<SendNotificationResult> {
  const client = getTwilioClient();

  if (!client || !process.env.TWILIO_WHATSAPP_NUMBER) {
    console.log('Twilio not configured - message not sent:', message.substring(0, 50));
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    // Ensure phone has whatsapp: prefix
    const toNumber = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
    const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

    const result = await client.messages.create({
      from: fromNumber,
      to: toNumber,
      body: message,
    });

    console.log('WhatsApp message sent:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Send order notification
export async function sendOrderNotification(
  order: Order,
  customer: Customer,
  notificationType: NotificationType,
  locationName?: string
): Promise<SendNotificationResult> {
  const language = customer.language || 'es';
  const templates = messageTemplates[language] || messageTemplates.es;

  let message: string;
  const orderNumber = order.id.slice(-8).toUpperCase();

  switch (notificationType) {
    case 'order_created':
      message = templates.order_created(orderNumber, `$${order.total?.toFixed(2) || '0.00'}`);
      break;
    case 'order_ready':
      message = templates.order_ready(orderNumber, locationName);
      break;
    case 'order_completed':
      message = templates.order_completed(orderNumber);
      break;
    case 'order_in_progress':
      message = templates.order_in_progress(orderNumber);
      break;
    default:
      return { success: false, error: 'Invalid notification type' };
  }

  // Send the WhatsApp message
  const result = await sendWhatsAppMessage(customer.phone, message);

  // Log the notification in database
  try {
    await supabaseAdmin.from('notifications').insert({
      type: 'order',
      title: `Order ${notificationType.replace('_', ' ')}`,
      message: message,
      link: `/orders/${order.id}`,
      metadata: {
        order_id: order.id,
        customer_id: customer.id,
        notification_type: notificationType,
        whatsapp_sent: result.success,
        message_id: result.messageId,
      },
    });
  } catch (e) {
    console.error('Error logging notification:', e);
  }

  // Also save as outbound message in conversation if exists
  if (order.conversation_id) {
    try {
      await supabaseAdmin.from('messages').insert({
        conversation_id: order.conversation_id,
        direction: 'outbound',
        content: message,
        message_type: 'notification',
        ai_generated: false,
        external_id: result.messageId || null,
      });
    } catch (e) {
      console.error('Error saving notification to conversation:', e);
    }
  }

  return result;
}

// Send pickup reminder
export async function sendPickupReminder(
  order: Order,
  customer: Customer,
  daysAgo: number
): Promise<SendNotificationResult> {
  const language = customer.language || 'es';
  const templates = messageTemplates[language] || messageTemplates.es;
  const orderNumber = order.id.slice(-8).toUpperCase();
  const message = templates.pickup_reminder(orderNumber, daysAgo);

  return sendWhatsAppMessage(customer.phone, message);
}

// Send follow-up message
export async function sendFollowUpMessage(
  customer: Customer
): Promise<SendNotificationResult> {
  const language = customer.language || 'es';
  const templates = messageTemplates[language] || messageTemplates.es;
  const message = templates.followup(customer.name || '');

  return sendWhatsAppMessage(customer.phone, message);
}

// Get orders ready for pickup reminder (orders in 'ready' status for more than X days)
export async function getOrdersNeedingReminder(daysThreshold: number = 2) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      customer:customers(*)
    `)
    .eq('status', 'ready')
    .lt('updated_at', thresholdDate.toISOString());

  if (error) {
    console.error('Error fetching orders for reminder:', error);
    return [];
  }

  return orders || [];
}

// Get customers who haven't visited in X days
export async function getInactiveCustomers(daysThreshold: number = 30) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  const { data: customers, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .lt('last_order_at', thresholdDate.toISOString())
    .gte('total_orders', 1); // Only customers who have ordered before

  if (error) {
    console.error('Error fetching inactive customers:', error);
    return [];
  }

  return customers || [];
}
