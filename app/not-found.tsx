'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const [sockCount, setSockCount] = useState(0);
  const [message, setMessage] = useState('');

  const messages = [
    '¿Buscando un calcetín perdido?',
    'Esta página se fue con la lavada...',
    'Parece que alguien se llevó esta página',
    '404: Página en el ciclo de secado',
    'Esta ruta necesita planchado',
  ];

  useEffect(() => {
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, []);

  const handleSockClick = () => {
    setSockCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-50 overflow-hidden">
      {/* Floating socks background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-float text-4xl"
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${10 + (i * 10)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + (i % 4)}s`,
              opacity: 0.3,
            }}
          >
            🧦
          </div>
        ))}
      </div>

      <div className="relative text-center px-4 animate-fade-in-up">
        {/* Washing machine animation */}
        <div className="relative inline-block mb-8">
          <div className="w-40 h-40 bg-white rounded-3xl shadow-strong border-4 border-slate-200 relative overflow-hidden">
            {/* Door frame */}
            <div className="absolute inset-4 rounded-full border-4 border-slate-300 bg-gradient-to-br from-brand-100 to-brand-200">
              {/* Spinning clothes */}
              <div className="absolute inset-2 rounded-full bg-brand-50 animate-wash-spin flex items-center justify-center">
                <span className="text-4xl">👕</span>
              </div>
            </div>
            {/* Control panel */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <div className="w-2 h-2 rounded-full bg-error-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-slate-300" />
            </div>
          </div>
          {/* Steam */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="text-xl animate-steam" style={{ animationDelay: '0s' }}>💨</span>
            <span className="text-xl animate-steam" style={{ animationDelay: '0.5s' }}>💨</span>
            <span className="text-xl animate-steam" style={{ animationDelay: '1s' }}>💨</span>
          </div>
        </div>

        {/* Error code */}
        <div className="mb-4">
          <span className="text-8xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {message}
        </h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          La página que buscas no existe o fue movida a otra ubicación.
          Pero no te preocupes, tu ropa está segura con nosotros.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg">
              Volver al Dashboard
            </Button>
          </Link>
          <Link href="/conversations">
            <Button variant="secondary" size="lg">
              Ver Conversaciones
            </Button>
          </Link>
        </div>

        {/* Easter egg: Clickable sock */}
        <div className="mt-12">
          <button
            onClick={handleSockClick}
            className="text-4xl hover:scale-125 transition-transform cursor-pointer focus:outline-none"
            title="¿Encontraste el calcetín?"
          >
            🧦
          </button>
          {sockCount > 0 && (
            <p className="text-sm text-brand-600 mt-2 animate-fade-in">
              {sockCount === 1 && '¡Encontraste un calcetín perdido!'}
              {sockCount > 1 && sockCount < 5 && `${sockCount} calcetines encontrados...`}
              {sockCount >= 5 && sockCount < 10 && '¡Eres un experto encontrando calcetines!'}
              {sockCount >= 10 && '🎉 ¡INCREÍBLE! Has encontrado todos los calcetines perdidos del mundo.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
