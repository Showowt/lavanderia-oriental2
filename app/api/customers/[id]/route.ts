import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { updateCustomerSchema } from '@/lib/validations';
import type { CustomerWithHistory } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get customer
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (customerError) {
      if (customerError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No encontrado', message: 'Cliente no encontrado' },
          { status: 404 }
        );
      }
      throw customerError;
    }

    // Get conversations
    const { data: conversations } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get orders
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate totals
    const { count: totalOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', id);

    const { data: orderTotals } = await supabaseAdmin
      .from('orders')
      .select('total')
      .eq('customer_id', id)
      .neq('status', 'cancelled');

    const totalSpent = orderTotals?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    const result: CustomerWithHistory = {
      ...customer,
      conversations: conversations || [],
      orders: orders || [],
      total_orders: totalOrders || 0,
      total_spent: totalSpent,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al obtener el cliente' },
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
    const data = updateCustomerSchema.parse(body);

    const { data: customer, error } = await supabaseAdmin
      .from('customers')
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
          { error: 'No encontrado', message: 'Cliente no encontrado' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Cliente actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al actualizar el cliente' },
      { status: 500 }
    );
  }
}
