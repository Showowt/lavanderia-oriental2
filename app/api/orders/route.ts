import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { orderFilterSchema, createOrderSchema } from '@/lib/validations';
import { calculatePagination } from '@/lib/utils';
import type { PaginatedResponse, OrderListItem, OrderItem } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = orderFilterSchema.parse({
      status: searchParams.get('status') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      locationId: searchParams.get('locationId') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: searchParams.get('page') || 1,
      pageSize: searchParams.get('pageSize') || 20,
    });

    const { from } = calculatePagination(params.page, params.pageSize, 0);

    // Build query
    let query = supabaseAdmin
      .from('orders')
      .select(
        `
        *,
        customer:customers(id, name, phone),
        location:locations(id, name)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, from + params.pageSize - 1);

    // Apply filters
    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.customerId) {
      query = query.eq('customer_id', params.customerId);
    }

    if (params.locationId) {
      query = query.eq('location_id', params.locationId);
    }

    if (params.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }

    if (params.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Error al obtener órdenes', message: error.message },
        { status: 500 }
      );
    }

    const total = count || 0;
    const response: PaginatedResponse<OrderListItem> = {
      data: (data || []) as OrderListItem[],
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    // Get services to calculate prices
    const serviceIds = data.items.map((item) => item.service_id);
    const { data: services, error: servicesError } = await supabaseAdmin
      .from('services')
      .select('id, name, price')
      .in('id', serviceIds);

    if (servicesError) {
      throw servicesError;
    }

    // Calculate order totals
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
    const tax = subtotal * 0.16; // 16% IVA
    const total = subtotal + tax;

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: data.customer_id,
        location_id: data.location_id || null,
        conversation_id: data.conversation_id || null,
        items,
        status: 'pending',
        subtotal,
        tax,
        total,
        notes: data.notes || null,
        pickup_date: data.pickup_date || null,
        delivery_date: data.delivery_date || null,
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Update customer stats - fetch current values first
    try {
      const { data: customer } = await supabaseAdmin
        .from('customers')
        .select('total_orders, total_spent')
        .eq('id', data.customer_id)
        .single();

      await supabaseAdmin
        .from('customers')
        .update({
          total_orders: (customer?.total_orders || 0) + 1,
          total_spent: (customer?.total_spent || 0) + total,
          last_order_at: new Date().toISOString(),
        })
        .eq('id', data.customer_id);
    } catch (e) {
      console.error('Error updating customer stats:', e);
    }

    // Create notification
    await supabaseAdmin.from('notifications').insert({
      type: 'order',
      title: 'Nueva orden',
      message: `Orden creada por $${total.toFixed(2)}`,
      link: `/orders/${order.id}`,
    });

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Orden creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al crear la orden' },
      { status: 500 }
    );
  }
}
