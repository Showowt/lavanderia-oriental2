import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { escalateConversationSchema } from '@/lib/validations';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = escalateConversationSchema.parse(body);

    // Check if conversation exists
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('id, status')
      .eq('id', id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'No encontrado', message: 'Conversación no encontrada' },
        { status: 404 }
      );
    }

    // Check if already escalated
    if (conversation.status === 'escalated') {
      return NextResponse.json(
        { error: 'Conflicto', message: 'La conversación ya está escalada' },
        { status: 409 }
      );
    }

    // Create escalation record
    const { data: escalation, error: escError } = await supabaseAdmin
      .from('escalations')
      .insert({
        conversation_id: id,
        reason: data.reason,
        priority: data.priority,
        status: 'pending',
      })
      .select()
      .single();

    if (escError) {
      throw escError;
    }

    // Update conversation status
    const { error: updateError } = await supabaseAdmin
      .from('conversations')
      .update({
        status: 'escalated',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // Create notification
    await supabaseAdmin.from('notifications').insert({
      type: 'escalation',
      title: 'Nueva escalación',
      message: `Razón: ${data.reason}`,
      link: `/conversations/${id}`,
    });

    return NextResponse.json({
      success: true,
      data: escalation,
      message: 'Conversación escalada exitosamente',
    });
  } catch (error) {
    console.error('Error escalating conversation:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al escalar la conversación' },
      { status: 500 }
    );
  }
}
