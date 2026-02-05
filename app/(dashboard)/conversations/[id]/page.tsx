export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ChatWindow } from '@/components/conversations/ChatWindow';
import { CustomerInfo } from '@/components/customers/CustomerCard';
import { ConversationActions } from './ConversationActions';
import type { ConversationWithMessages } from '@/types';

interface ConversationDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getConversation(id: string): Promise<ConversationWithMessages | null> {
  const { data: conversation, error: convError } = await supabaseAdmin
    .from('conversations')
    .select(`*, customer:customers(*)`)
    .eq('id', id)
    .single();

  if (convError || !conversation) {
    return null;
  }

  const { data: messages } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  return {
    ...conversation,
    messages: messages || [],
  } as ConversationWithMessages;
}

export default async function ConversationDetailPage({
  params,
}: ConversationDetailPageProps) {
  const { id } = await params;
  const conversation = await getConversation(id);

  if (!conversation) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Header
        title={conversation.customer?.name || 'Conversación'}
        breadcrumbs={[
          { label: 'Conversaciones', href: '/conversations' },
          { label: conversation.customer?.name || 'Detalle' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Badge status={conversation.status} />
          </div>
        }
      />

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          <ChatWindow
            messages={conversation.messages}
            className="flex-1"
          />
          <ConversationActions
            conversationId={conversation.id}
            status={conversation.status}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Información del Cliente
            </h3>
            {conversation.customer && (
              <CustomerInfo customer={conversation.customer} />
            )}
          </div>

          <div className="border-t border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Detalles de Conversación
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Canal</span>
                <span className="text-gray-900 capitalize">
                  {conversation.channel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mensajes</span>
                <span className="text-gray-900">{conversation.message_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Agente</span>
                <span className="text-gray-900">
                  {conversation.assigned_agent || 'Sin asignar'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
