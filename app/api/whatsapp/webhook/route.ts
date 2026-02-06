import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateAIResponse } from '@/lib/ai-engine';
import twilio from 'twilio';

// GET handler for Twilio webhook verification
export async function GET(request: NextRequest) {
  // Twilio doesn't actually need verification like Facebook does,
  // but we return success to confirm the endpoint is working
  return NextResponse.json({ status: 'ok', message: 'WhatsApp webhook is active' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const from = body.get('From') as string;
    const messageBody = body.get('Body') as string;
    const messageId = body.get('MessageSid') as string;

    console.log('WhatsApp webhook received:', { from, messageBody: messageBody?.substring(0, 50) });

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
      const { data: newCustomer, error: createError } = await supabaseAdmin
        .from('customers')
        .insert({
          phone,
          language: 'es',
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating customer:', createError);
        throw createError;
      }
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
      const { data: newConversation, error: convError } = await supabaseAdmin
        .from('conversations')
        .insert({
          customer_id: customer.id,
          channel: 'whatsapp',
          status: 'active',
          ai_handled: true,
          message_count: 0,
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }
      conversation = newConversation;
    }

    // Save incoming message
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      direction: 'inbound',
      content: messageBody,
      message_type: 'text',
      ai_generated: false,
      external_id: messageId || null,
    });

    // Update conversation
    await supabaseAdmin
      .from('conversations')
      .update({
        message_count: (conversation.message_count || 0) + 1,
        last_message_at: new Date().toISOString(),
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

    const conversationHistory: { role: 'user' | 'assistant'; content: string }[] = (messages || []).map((msg) => ({
      role: (msg.direction === 'inbound' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content as string,
    }));

    // Get customer order history
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Generate AI response
    const { response: aiResponse, shouldEscalate, intent } = await generateAIResponse(
      messageBody,
      {
        customerId: customer.id,
        customerName: customer.name,
        conversationHistory,
        orderHistory: orders || [],
        language: customer.language || 'es',
      }
    );

    // Save AI response
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversation.id,
      direction: 'outbound',
      content: aiResponse,
      message_type: 'text',
      ai_generated: true,
    });

    // Update conversation message count
    await supabaseAdmin
      .from('conversations')
      .update({
        message_count: (conversation.message_count || 0) + 2,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversation.id);

    // Send WhatsApp response if Twilio is configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
      try {
        const twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        await twilioClient.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: from,
          body: aiResponse,
        });
      } catch (twilioError) {
        console.error('Twilio send error:', twilioError);
        // Don't throw - we still saved the response
      }
    } else {
      console.log('Twilio not configured - AI response saved but not sent:', aiResponse.substring(0, 100));
    }

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
