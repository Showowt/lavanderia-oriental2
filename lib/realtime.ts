import { createClient } from '@/lib/supabase-browser';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Types for realtime events
export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

// Subscribe to table changes
export function subscribeToTable<T extends Record<string, unknown>>(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  filter?: { column: string; value: string }
): RealtimeSubscription {
  const supabase = createClient();

  const channelConfig: {
    event: '*';
    schema: 'public';
    table: string;
    filter?: string;
  } = {
    event: '*',
    schema: 'public',
    table,
  };

  if (filter) {
    channelConfig.filter = `${filter.column}=eq.${filter.value}`;
  }

  const channel = supabase
    .channel(`${table}-changes${filter ? `-${filter.value}` : ''}`)
    .on(
      'postgres_changes',
      channelConfig,
      (payload) => callback(payload as RealtimePostgresChangesPayload<T>)
    )
    .subscribe();

  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

// Subscribe to new messages in a conversation
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: Record<string, unknown>) => void,
  onError?: (error: Error) => void
): RealtimeSubscription {
  return subscribeToTable(
    'messages',
    (payload) => {
      if (payload.eventType === 'INSERT') {
        onNewMessage(payload.new);
      }
    },
    { column: 'conversation_id', value: conversationId }
  );
}

// Subscribe to conversation updates (status changes, etc.)
export function subscribeToConversations(
  onUpdate: (conversation: Record<string, unknown>, event: RealtimeEvent) => void
): RealtimeSubscription {
  return subscribeToTable(
    'conversations',
    (payload) => {
      const event = payload.eventType as RealtimeEvent;
      const data = payload.eventType === 'DELETE' ? payload.old : payload.new;
      onUpdate(data, event);
    }
  );
}

// Subscribe to escalation updates
export function subscribeToEscalations(
  onUpdate: (escalation: Record<string, unknown>, event: RealtimeEvent) => void
): RealtimeSubscription {
  return subscribeToTable(
    'escalations',
    (payload) => {
      const event = payload.eventType as RealtimeEvent;
      const data = payload.eventType === 'DELETE' ? payload.old : payload.new;
      onUpdate(data, event);
    }
  );
}

// Subscribe to order updates
export function subscribeToOrders(
  onUpdate: (order: Record<string, unknown>, event: RealtimeEvent) => void,
  customerId?: string
): RealtimeSubscription {
  return subscribeToTable(
    'orders',
    (payload) => {
      const event = payload.eventType as RealtimeEvent;
      const data = payload.eventType === 'DELETE' ? payload.old : payload.new;
      onUpdate(data, event);
    },
    customerId ? { column: 'customer_id', value: customerId } : undefined
  );
}

// Subscribe to notifications
export function subscribeToNotifications(
  onNewNotification: (notification: Record<string, unknown>) => void
): RealtimeSubscription {
  return subscribeToTable(
    'notifications',
    (payload) => {
      if (payload.eventType === 'INSERT') {
        onNewNotification(payload.new);
      }
    }
  );
}
