export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { PageHeader } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Pagination, PaginationInfo } from '@/components/ui/Pagination';
import { ConversationList } from '@/components/conversations/ConversationList';
import type { ConversationListItem } from '@/types';

interface ConversationsPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
    search?: string;
  }>;
}

async function getConversations(
  status?: string,
  page = 1,
  search?: string
) {
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  let query = supabaseAdmin
    .from('conversations')
    .select(`*, customer:customers(id, name, phone)`, { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching conversations:', error);
    return { conversations: [], total: 0 };
  }

  // Get last message for each conversation
  const conversations: ConversationListItem[] = await Promise.all(
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

  return {
    conversations,
    total: count || 0,
  };
}

async function getStatusCounts() {
  const [all, active, escalated, resolved] = await Promise.all([
    supabaseAdmin.from('conversations').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('conversations').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('conversations').select('*', { count: 'exact', head: true }).eq('status', 'escalated'),
    supabaseAdmin.from('conversations').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
  ]);

  return {
    all: all.count || 0,
    active: active.count || 0,
    escalated: escalated.count || 0,
    resolved: resolved.count || 0,
  };
}

export default async function ConversationsPage({
  searchParams,
}: ConversationsPageProps) {
  const params = await searchParams;
  const status = params.status || 'all';
  const page = parseInt(params.page || '1');
  const search = params.search;

  const [{ conversations, total }, statusCounts] = await Promise.all([
    getConversations(status, page, search),
    getStatusCounts(),
  ]);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  const tabs = [
    { id: 'all', label: 'Todas', count: statusCounts.all },
    { id: 'active', label: 'Activas', count: statusCounts.active },
    { id: 'escalated', label: 'Escaladas', count: statusCounts.escalated },
    { id: 'resolved', label: 'Resueltas', count: statusCounts.resolved },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Conversaciones"
        description="Gestiona las conversaciones de WhatsApp con clientes"
      />

      {/* Status Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/conversations?status=${tab.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Conversations List */}
      <Card>
        <CardContent noPadding>
          <ConversationList conversations={conversations} />
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <PaginationInfo page={page} pageSize={pageSize} total={total} />
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/conversations?status=${status}&page=${page - 1}`}>
                <Button variant="secondary">Anterior</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/conversations?status=${status}&page=${page + 1}`}>
                <Button variant="secondary">Siguiente</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
