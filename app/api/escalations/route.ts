import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { escalationFilterSchema } from '@/lib/validations';
import { calculatePagination } from '@/lib/utils';
import type { PaginatedResponse, EscalationWithDetails } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = escalationFilterSchema.parse({
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      page: searchParams.get('page') || 1,
      pageSize: searchParams.get('pageSize') || 20,
    });

    const { from } = calculatePagination(params.page, params.pageSize, 0);

    // Build query - order by priority (urgent first) then by created_at
    let query = supabaseAdmin
      .from('escalations')
      .select(
        `
        *,
        conversation:conversations(
          *,
          customer:customers(*)
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, from + params.pageSize - 1);

    // Apply filters
    if (params.status) {
      query = query.eq('status', params.status);
    } else {
      // Default to pending escalations
      query = query.in('status', ['pending', 'claimed']);
    }

    if (params.priority) {
      query = query.eq('priority', params.priority);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching escalations:', error);
      return NextResponse.json(
        { error: 'Error al obtener escalaciones', message: error.message },
        { status: 500 }
      );
    }

    // Sort by priority (urgent > high > medium > low) then by date
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const sortedData = (data || []).sort((a, b) => {
      const priorityDiff =
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const total = count || 0;
    const response: PaginatedResponse<EscalationWithDetails> = {
      data: sortedData as EscalationWithDetails[],
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in escalations API:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
