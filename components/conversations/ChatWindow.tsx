'use client';

import { useEffect, useRef } from 'react';
import { cn, formatTime } from '@/lib/utils';
import type { Message } from '@/types';

interface ChatWindowProps {
  messages: Message[];
  className?: string;
}

export function ChatWindow({ messages, className }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full text-gray-500',
          className
        )}
      >
        <p>No hay mensajes en esta conversación</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col p-4 space-y-4 overflow-y-auto', className)}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === 'outbound';

  return (
    <div
      className={cn('flex', isOutbound ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2 shadow-sm',
          isOutbound
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div
          className={cn(
            'flex items-center justify-end gap-2 mt-1',
            isOutbound ? 'text-blue-200' : 'text-gray-400'
          )}
        >
          {message.ai_generated && (
            <span className="text-xs">AI</span>
          )}
          <span className="text-xs">{formatTime(message.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
