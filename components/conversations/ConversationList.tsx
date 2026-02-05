'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ChatIcon } from '@/components/ui/EmptyState';
import { formatRelativeTime, truncate, formatPhone } from '@/lib/utils';
import type { ConversationListItem } from '@/types';

interface ConversationListProps {
  conversations: ConversationListItem[];
  selectedId?: string;
}

export function ConversationList({
  conversations,
  selectedId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={<ChatIcon />}
        title="Sin conversaciones"
        description="Las conversaciones de WhatsApp aparecerán aquí"
      />
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          isSelected={conversation.id === selectedId}
        />
      ))}
    </div>
  );
}

interface ConversationListItemProps {
  conversation: ConversationListItem;
  isSelected?: boolean;
}

function ConversationListItem({
  conversation,
  isSelected,
}: ConversationListItemProps) {
  const customerName = conversation.customer?.name || 'Cliente';
  const customerPhone = conversation.customer?.phone
    ? formatPhone(conversation.customer.phone)
    : 'Sin teléfono';
  const lastMessagePreview = conversation.last_message?.content
    ? truncate(conversation.last_message.content, 50)
    : 'Sin mensajes';
  const lastMessageTime = conversation.last_message?.created_at
    ? formatRelativeTime(conversation.last_message.created_at)
    : formatRelativeTime(conversation.created_at);

  return (
    <Link
      href={`/conversations/${conversation.id}`}
      className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {customerName}
            </p>
            <Badge status={conversation.status} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{customerPhone}</p>
          <p className="text-sm text-gray-600 mt-1 truncate">
            {conversation.last_message?.direction === 'outbound' && (
              <span className="text-gray-400">Tú: </span>
            )}
            {lastMessagePreview}
          </p>
        </div>
        <div className="flex-shrink-0 ml-4 text-right">
          <p className="text-xs text-gray-500">{lastMessageTime}</p>
          {conversation.message_count > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {conversation.message_count} msgs
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// Compact version for dashboard
interface RecentConversationsProps {
  conversations: ConversationListItem[];
}

export function RecentConversations({ conversations }: RecentConversationsProps) {
  if (conversations.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Sin conversaciones recientes
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.slice(0, 5).map((conversation) => (
        <Link
          key={conversation.id}
          href={`/conversations/${conversation.id}`}
          className="flex items-center justify-between py-3 px-1 hover:bg-gray-50 transition-colors rounded"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {conversation.customer?.name || formatPhone(conversation.customer?.phone || '')}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {conversation.last_message?.content || 'Sin mensajes'}
            </p>
          </div>
          <div className="flex-shrink-0 ml-2">
            <Badge status={conversation.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
