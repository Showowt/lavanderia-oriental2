'use client';

import { useEffect, useRef } from 'react';
import { cn, formatTime } from '@/lib/utils';
import { useRealtimeMessages } from '@/hooks/useRealtime';
import { RealtimeIndicator } from '@/components/realtime';
import type { Message } from '@/types';

interface RealtimeChatWindowProps {
  conversationId: string;
  initialMessages: Message[];
  className?: string;
}

export function RealtimeChatWindow({
  conversationId,
  initialMessages,
  className,
}: RealtimeChatWindowProps) {
  const { messages, addOptimisticMessage } = useRealtimeMessages(
    conversationId,
    initialMessages as unknown as Record<string, unknown>[]
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      // Only auto-scroll if user is near the bottom
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // Initial scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, []);

  if (messages.length === 0) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        {/* Realtime Status */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
          <RealtimeIndicator />
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p>No hay mensajes en esta conversación</p>
            <p className="text-sm text-gray-400 mt-1">
              Los mensajes nuevos aparecerán aquí en tiempo real
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Realtime Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <RealtimeIndicator />
        <span className="text-xs text-gray-500">
          {messages.length} mensaje{messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto bg-gray-50"
      >
        {messages.map((message, index) => (
          <MessageBubble
            key={(message as unknown as Message).id || `msg-${index}`}
            message={message as unknown as Message}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === 'outbound';

  return (
    <div className={cn('flex', isOutbound ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2 shadow-sm transition-all animate-fade-in-up',
          isOutbound
            ? 'bg-brand-600 text-white rounded-br-md'
            : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={cn(
            'flex items-center justify-end gap-2 mt-1',
            isOutbound ? 'text-brand-200' : 'text-gray-400'
          )}
        >
          {message.ai_generated && (
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                isOutbound
                  ? 'bg-brand-500 text-brand-100'
                  : 'bg-brand-100 text-brand-600'
              )}
            >
              AI
            </span>
          )}
          <span className="text-xs">{formatTime(message.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
