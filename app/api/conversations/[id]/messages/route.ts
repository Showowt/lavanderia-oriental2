import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendMessageSchema } from '@/lib/validations';
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = sendMessageSchema.parse(body);

    // Get conversation with customer
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select(
        `
        id,
        channel,
        customer:customers(id, phone)
      `
      )
      .eq('id', id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'No encontrado', message: 'Conversación no encontrada' },
        { status: 404 }
      );
    }

    // Save message to database
    const { data: message, error: msgError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: id,
        direction: 'outbound',
        content: data.content,
        message_type: 'text',
        ai_generated: false,
      })
      .select()
      .single();

    if (msgError) {
      throw msgError;
    }

    // Update conversation
    await supabaseAdmin
      .from('conversations')
      .update({
        message_count: (conversation as { message_count?: number }).message_count
          ? (conversation as { message_count?: number }).message_count! + 1
          : 1,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Send via WhatsApp if channel is whatsapp
    if (conversation.channel === 'whatsapp' && conversation.customer) {
      try {
        const customer = conversation.customer as unknown as { phone: string } | { phone: string }[];
        const customerPhone = Array.isArray(customer) ? customer[0]?.phone : customer.phone;
        await twilioClient.messages.create({
          body: data.content,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: `whatsapp:${customerPhone}`,
        });

        // Update message with external ID
        // Note: Twilio's response includes a sid we could store
      } catch (twilioError) {
        console.error('Error sending WhatsApp message:', twilioError);
        // Message is saved, but delivery failed
        return NextResponse.json({
          success: true,
          data: message,
          warning: 'Mensaje guardado pero no enviado por WhatsApp',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: message,
      message: 'Mensaje enviado exitosamente',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al enviar el mensaje' },
      { status: 500 }
    );
  }
}
