import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { updateConversationSchema } from '@/lib/validations';
import type { ConversationWithMessages } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get conversation with customer
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select(
        `
        *,
        customer:customers(*)
      `
      )
      .eq('id', id)
      .single();

    if (convError) {
      if (convError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No encontrado', message: 'Conversación no encontrada' },
          { status: 404 }
        );
      }
      throw convError;
    }

    // Get messages
    const { data: messages, error: msgError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (msgError) {
      throw msgError;
    }

    const result: ConversationWithMessages = {
      ...conversation,
      messages: messages || [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al obtener la conversación' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateConversationSchema.parse(body);

    const { data: conversation, error } = await supabaseAdmin
      .from('conversations')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No encontrado', message: 'Conversación no encontrada' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al actualizar la conversación' },
      { status: 500 }
    );
  }
}
