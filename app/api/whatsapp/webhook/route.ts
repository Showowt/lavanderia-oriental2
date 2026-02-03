import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateAIResponse } from '@/lib/ai-engine';
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const from = body.get('From') as string;
    const messageBody = body.get('Body') as string;
    const messageId = body.get('MessageSid') as string;

    if (!from || !messageBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Extract phone number (remove WhatsApp prefix)
    const phone = from.replace('whatsapp:', '');

    // Get or create customer
    let { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (customerError && customerError.code === 'PGRST116') {
      // Customer doesn't exist, create one
      const { data: newCustomer } = await supabaseAdmin
        .from('customers')
        .insert({
          phone,
          language: 'es',
        })
        .select()
        .single();

      customer = newCustomer;
    }

    if (!customer) {
      throw new Error('Failed to get or create customer');
    }

    // Get or create active conversation
    let { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!conversation) {
      const { data: newConversation } = await supabaseAdmin
        .from('conversations')
        .insert({
          customer_id: customer.id,
          channel: 'whatsapp',
          ai_handled: true,
        })
        .select()
        .single();

      conversation = newConversation;
    }

    // Save incoming message
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      direction: 'inbound',
      content: messageBody,
      whatsapp_message_id: messageId,
    });

    // Update message count
    await supabaseAdmin
      .from('conversations')
      .update({
        message_count: (conversation.message_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation.id);

    // Get conversation history for context
    const { data: messages } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(20);

    const conversationHistory = (messages || []).map((msg) => ({
      role: msg.direction === 'inbound' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Generate AI response
    const { response: aiResponse, shouldEscalate, intent } = await generateAIResponse(
      messageBody,
      {
        customerId: customer.id,
        customerName: customer.name,
        conversationHistory,
        language: customer.language || 'es',
      }
    );

    // Save AI response
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      direction: 'outbound',
      content: aiResponse,
      ai_generated: true,
    });

    // Send WhatsApp response
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: from,
      body: aiResponse,
    });

    // Handle escalation if needed
    if (shouldEscalate) {
      await supabaseAdmin
        .from('conversations')
        .update({
          status: 'escalated',
          ai_handled: false,
        })
        .eq('id', conversation.id);

      await supabaseAdmin.from('escalations').insert({
        conversation_id: conversation.id,
        customer_id: customer.id,
        reason: intent || 'AI detected need for human assistance',
        priority: 'medium',
        status: 'pending',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
