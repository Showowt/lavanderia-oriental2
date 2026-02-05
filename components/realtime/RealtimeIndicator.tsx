'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';

interface RealtimeIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export function RealtimeIndicator({ className = '', showLabel = true }: RealtimeIndicatorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Create a presence channel to check connection
    const channel = supabase.channel('connection-status');

    channel
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
        setIsConnecting(false);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setIsConnecting(false);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setIsConnecting(false);
        }
      });

    // Check connection after timeout
    const timeout = setTimeout(() => {
      setIsConnecting(false);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
  }, []);

  if (isConnecting) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>
        {showLabel && <span className="text-xs text-amber-600">Conectando...</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
          isConnected ? 'bg-success-500' : 'bg-slate-400'
        }`} />
      </span>
      {showLabel && (
        <span className={`text-xs ${isConnected ? 'text-success-600' : 'text-slate-500'}`}>
          {isConnected ? 'En tiempo real' : 'Desconectado'}
        </span>
      )}
    </div>
  );
}
