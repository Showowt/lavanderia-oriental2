import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { updateOrderSchema } from '@/lib/validations';
import type { OrderWithDetails, OrderItem } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(
        `
        *,
        customer:customers(*),
        location:locations(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No encontrado', message: 'Orden no encontrada' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(order as OrderWithDetails);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al obtener la orden' },
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
    const data = updateOrderSchema.parse(body);

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.status) {
      updateData.status = data.status;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    if (data.pickup_date !== undefined) {
      updateData.pickup_date = data.pickup_date;
    }

    if (data.delivery_date !== undefined) {
      updateData.delivery_date = data.delivery_date;
    }

    // If items are being updated, recalculate totals
    if (data.items) {
      const serviceIds = data.items.map((item) => item.service_id);
      const { data: services, error: servicesError } = await supabaseAdmin
        .from('services')
        .select('id, name, price')
        .in('id', serviceIds);

      if (servicesError) {
        throw servicesError;
      }

      const serviceMap = new Map(services?.map((s) => [s.id, s]));
      const items: OrderItem[] = data.items.map((item) => {
        const service = serviceMap.get(item.service_id);
        if (!service) {
          throw new Error(`Servicio no encontrado: ${item.service_id}`);
        }
        return {
          service_id: item.service_id,
          service_name: service.name,
          quantity: item.quantity,
          unit_price: service.price,
          subtotal: service.price * item.quantity,
        };
      });

      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const tax = subtotal * 0.16;
      const total = subtotal + tax;

      updateData.items = items;
      updateData.subtotal = subtotal;
      updateData.tax = tax;
      updateData.total = total;
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No encontrado', message: 'Orden no encontrada' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Orden actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al actualizar la orden' },
      { status: 500 }
    );
  }
}
