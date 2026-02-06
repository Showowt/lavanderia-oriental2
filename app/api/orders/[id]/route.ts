import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { updateOrderSchema } from '@/lib/validations';
import { sendOrderNotification } from '@/lib/notifications';
import type { OrderWithDetails, OrderItem, Service, Customer } from '@/types';

// Helper to get primary price from service
function getServicePrice(service: Service): number {
  return service.price_lavado_secado ?? service.price_solo_lavado ?? service.price_solo_secado ?? 0;
}

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

    // Get current order to check status change
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        location:locations(*)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: 'No encontrado', message: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    const previousStatus = currentOrder.status;

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
        .select('id, name, price_lavado_secado, price_solo_lavado, price_solo_secado, price_unit')
        .in('id', serviceIds);

      if (servicesError) {
        throw servicesError;
      }

      const serviceMap = new Map(services?.map((s) => [s.id, s as Service]));
      const items: OrderItem[] = data.items.map((item) => {
        const service = serviceMap.get(item.service_id);
        if (!service) {
          throw new Error(`Servicio no encontrado: ${item.service_id}`);
        }
        const unitPrice = getServicePrice(service);
        return {
          service_id: item.service_id,
          service_name: service.name,
          quantity: item.quantity,
          unit_price: unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      });

      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const tax = subtotal * 0.13; // 13% IVA El Salvador
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

    // Send notification if status changed to a notification-worthy status
    if (data.status && data.status !== previousStatus && currentOrder.customer) {
      const customer = currentOrder.customer as Customer;
      const locationName = currentOrder.location?.name;

      try {
        switch (data.status) {
          case 'ready':
            await sendOrderNotification(order, customer, 'order_ready', locationName);
            break;
          case 'delivered':
            await sendOrderNotification(order, customer, 'order_completed');
            break;
          case 'in_progress':
            await sendOrderNotification(order, customer, 'order_in_progress');
            break;
        }
      } catch (notifError) {
        console.error('Error sending order notification:', notifError);
        // Don't fail the request if notification fails
      }
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
