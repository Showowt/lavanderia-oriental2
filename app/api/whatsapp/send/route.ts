import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWhatsAppMessage } from '@/lib/notifications';

const sendMessageSchema = z.object({
  to: z.string().min(10, 'Phone number required'),
  message: z.string().min(1, 'Message is required').max(4096, 'Message too long'),
  conversationId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = sendMessageSchema.parse(body);

    // Normalize phone number
    let phoneNumber = data.to.replace(/\D/g, '');
    // Handle El Salvador numbers (503 country code)
    if (!phoneNumber.startsWith('503') && phoneNumber.length === 8) {
      phoneNumber = '503' + phoneNumber;
    }
    // Add + prefix if not present
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    // Send via WhatsApp using notification service
    const result = await sendWhatsAppMessage(phoneNumber, data.message);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Error al enviar mensaje', message: result.error || 'Twilio no configurado' },
        { status: 500 }
      );
    }

    // Save message to conversation if conversationId provided
    if (data.conversationId) {
      try {
        await supabaseAdmin.from('messages').insert({
          conversation_id: data.conversationId,
          direction: 'outbound',
          content: data.message,
          message_type: 'text',
          ai_generated: false,
          external_id: result.messageId || null,
        });

        // Update conversation
        const { data: conv } = await supabaseAdmin
          .from('conversations')
          .select('message_count')
          .eq('id', data.conversationId)
          .single();

        await supabaseAdmin
          .from('conversations')
          .update({
            message_count: (conv?.message_count || 0) + 1,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.conversationId);
      } catch (e) {
        console.error('Error saving message to conversation:', e);
      }
    }

    // Log notification for dashboard
    try {
      await supabaseAdmin.from('notifications').insert({
        type: 'message',
        title: 'Mensaje enviado',
        message: `WhatsApp enviado a ${phoneNumber}`,
        metadata: {
          phone: phoneNumber,
          message_preview: data.message.substring(0, 100),
          message_id: result.messageId,
          customer_id: data.customerId,
          conversation_id: data.conversationId,
        },
      });
    } catch (e) {
      console.error('Error logging notification:', e);
    }

    return NextResponse.json({
      success: true,
      data: {
        sid: result.messageId,
        status: 'sent',
      },
      message: 'Mensaje enviado exitosamente',
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', message: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno', message: 'Error al enviar mensaje' },
      { status: 500 }
    );
  }
}
