import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { claimEscalationSchema, resolveEscalationSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: escalation, error } = await supabaseAdmin
      .from('escalations')
      .select(
        `
        *,
        conversation:conversations(
          *,
          customer:customers(*)
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No encontrado', message: 'Escalación no encontrada' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(escalation);
  } catch (error) {
    console.error('Error fetching escalation:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al obtener la escalación' },
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
    const action = body.action;

    // Get current escalation
    const { data: escalation, error: getError } = await supabaseAdmin
      .from('escalations')
      .select('*, conversation_id')
      .eq('id', id)
      .single();

    if (getError || !escalation) {
      return NextResponse.json(
        { error: 'No encontrado', message: 'Escalación no encontrada' },
        { status: 404 }
      );
    }

    if (action === 'claim') {
      // Claim escalation
      const data = claimEscalationSchema.parse(body);

      if (escalation.status !== 'pending') {
        return NextResponse.json(
          { error: 'Conflicto', message: 'La escalación ya fue reclamada' },
          { status: 409 }
        );
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('escalations')
        .update({
          status: 'claimed',
          claimed_by: data.claimed_by,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update conversation assigned agent
      await supabaseAdmin
        .from('conversations')
        .update({
          assigned_agent: data.claimed_by,
          updated_at: new Date().toISOString(),
        })
        .eq('id', escalation.conversation_id);

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Escalación reclamada exitosamente',
      });
    }

    if (action === 'resolve') {
      // Resolve escalation
      const data = resolveEscalationSchema.parse(body);

      if (!['pending', 'claimed'].includes(escalation.status)) {
        return NextResponse.json(
          { error: 'Conflicto', message: 'La escalación ya fue resuelta' },
          { status: 409 }
        );
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('escalations')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolution_notes: data.resolution_notes || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update conversation status to resolved
      await supabaseAdmin
        .from('conversations')
        .update({
          status: 'resolved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', escalation.conversation_id);

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Escalación resuelta exitosamente',
      });
    }

    if (action === 'cancel') {
      // Cancel escalation
      if (escalation.status === 'resolved') {
        return NextResponse.json(
          { error: 'Conflicto', message: 'No se puede cancelar una escalación resuelta' },
          { status: 409 }
        );
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('escalations')
        .update({
          status: 'cancelled',
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Return conversation to active status
      await supabaseAdmin
        .from('conversations')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', escalation.conversation_id);

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Escalación cancelada',
      });
    }

    return NextResponse.json(
      { error: 'Acción inválida', message: 'Use action: claim, resolve, o cancel' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating escalation:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al actualizar la escalación' },
      { status: 500 }
    );
  }
}
