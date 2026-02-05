'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  subscribeToMessages,
  subscribeToConversations,
  subscribeToEscalations,
  subscribeToOrders,
  subscribeToNotifications,
  RealtimeEvent,
} from '@/lib/realtime';

// Hook for real-time messages in a conversation
export function useRealtimeMessages(
  conversationId: string | null,
  initialMessages: Record<string, unknown>[] = []
) {
  const [messages, setMessages] = useState(initialMessages);
  const subscriptionRef = useRef<ReturnType<typeof subscribeToMessages> | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to new messages
    subscriptionRef.current = subscribeToMessages(
      conversationId,
      (newMessage) => {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    );

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [conversationId]);

  const addOptimisticMessage = useCallback((message: Record<string, unknown>) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return { messages, addOptimisticMessage };
}

// Hook for real-time conversation list
export function useRealtimeConversations(
  initialConversations: Record<string, unknown>[] = []
) {
  const [conversations, setConversations] = useState(initialConversations);
  const subscriptionRef = useRef<ReturnType<typeof subscribeToConversations> | null>(null);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    subscriptionRef.current = subscribeToConversations((conversation, event) => {
      setConversations((prev) => {
        switch (event) {
          case 'INSERT':
            return [conversation, ...prev];
          case 'UPDATE':
            return prev.map((c) =>
              c.id === conversation.id ? { ...c, ...conversation } : c
            );
          case 'DELETE':
            return prev.filter((c) => c.id !== conversation.id);
          default:
            return prev;
        }
      });
    });

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  return conversations;
}

// Hook for real-time escalations
export function useRealtimeEscalations(
  initialEscalations: Record<string, unknown>[] = []
) {
  const [escalations, setEscalations] = useState(initialEscalations);
  const [newEscalationAlert, setNewEscalationAlert] = useState(false);
  const subscriptionRef = useRef<ReturnType<typeof subscribeToEscalations> | null>(null);

  useEffect(() => {
    setEscalations(initialEscalations);
  }, [initialEscalations]);

  useEffect(() => {
    subscriptionRef.current = subscribeToEscalations((escalation, event) => {
      setEscalations((prev) => {
        switch (event) {
          case 'INSERT':
            setNewEscalationAlert(true);
            return [escalation, ...prev];
          case 'UPDATE':
            return prev.map((e) =>
              e.id === escalation.id ? { ...e, ...escalation } : e
            );
          case 'DELETE':
            return prev.filter((e) => e.id !== escalation.id);
          default:
            return prev;
        }
      });
    });

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  const dismissAlert = useCallback(() => {
    setNewEscalationAlert(false);
  }, []);

  return { escalations, newEscalationAlert, dismissAlert };
}

// Hook for real-time orders
export function useRealtimeOrders(
  initialOrders: Record<string, unknown>[] = [],
  customerId?: string
) {
  const [orders, setOrders] = useState(initialOrders);
  const subscriptionRef = useRef<ReturnType<typeof subscribeToOrders> | null>(null);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    subscriptionRef.current = subscribeToOrders((order, event) => {
      setOrders((prev) => {
        switch (event) {
          case 'INSERT':
            return [order, ...prev];
          case 'UPDATE':
            return prev.map((o) =>
              o.id === order.id ? { ...o, ...order } : o
            );
          case 'DELETE':
            return prev.filter((o) => o.id !== order.id);
          default:
            return prev;
        }
      });
    }, customerId);

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [customerId]);

  return orders;
}

// Hook for real-time notifications with toast support
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const subscriptionRef = useRef<ReturnType<typeof subscribeToNotifications> | null>(null);

  useEffect(() => {
    subscriptionRef.current = subscribeToNotifications((notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Play notification sound if available
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification((notification.title as string) || 'Nueva notificación', {
            body: (notification.message as string) || '',
            icon: '/icon.png',
          });
        }
      }
    });

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, markAsRead, clearNotifications };
}

// Hook to request notification permissions
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    } else {
      setPermission('unsupported');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'unsupported' as const;
  }, []);

  return { permission, requestPermission };
}
