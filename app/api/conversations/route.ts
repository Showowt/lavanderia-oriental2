import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { conversationFilterSchema } from '@/lib/validations';
import { calculatePagination } from '@/lib/utils';
import type { PaginatedResponse, ConversationListItem } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = conversationFilterSchema.parse({
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      page: searchParams.get('page') || 1,
      pageSize: searchParams.get('pageSize') || 20,
    });

    const { from, to } = calculatePagination(params.page, params.pageSize, 0);

    // Build query
    let query = supabaseAdmin
      .from('conversations')
      .select(
        `
        *,
        customer:customers(id, name, phone)
      `,
        { count: 'exact' }
      )
      .order('updated_at', { ascending: false })
      .range(from, from + params.pageSize - 1);

    // Apply filters
    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.customerId) {
      query = query.eq('customer_id', params.customerId);
    }

    if (params.search) {
      // Search by customer phone or name
      query = query.or(
        `customer.phone.ilike.%${params.search}%,customer.name.ilike.%${params.search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Error al obtener conversaciones', message: error.message },
        { status: 500 }
      );
    }

    // Get last message for each conversation
    const conversationsWithLastMessage: ConversationListItem[] = await Promise.all(
      (data || []).map(async (conv) => {
        const { data: lastMessage } = await supabaseAdmin
          .from('messages')
          .select('content, direction, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...conv,
          last_message: lastMessage || undefined,
        } as ConversationListItem;
      })
    );

    const total = count || 0;
    const response: PaginatedResponse<ConversationListItem> = {
      data: conversationsWithLastMessage,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in conversations API:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
