import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { customerFilterSchema } from '@/lib/validations';
import { calculatePagination } from '@/lib/utils';
import type { PaginatedResponse, Customer } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = customerFilterSchema.parse({
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || 1,
      pageSize: searchParams.get('pageSize') || 20,
    });

    const { from } = calculatePagination(params.page, params.pageSize, 0);

    // Build query
    let query = supabaseAdmin
      .from('customers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + params.pageSize - 1);

    // Apply search filter
    if (params.search) {
      query = query.or(
        `phone.ilike.%${params.search}%,name.ilike.%${params.search}%,email.ilike.%${params.search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json(
        { error: 'Error al obtener clientes', message: error.message },
        { status: 500 }
      );
    }

    const total = count || 0;
    const response: PaginatedResponse<Customer> = {
      data: (data || []) as Customer[],
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in customers API:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
