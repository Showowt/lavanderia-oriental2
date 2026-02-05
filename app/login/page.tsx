'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BubbleBackground } from '@/components/effects/BubbleBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciales inválidas. Por favor intente de nuevo.');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 overflow-hidden">
      {/* Interactive Bubble Background - Signature Experience */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-100/50 via-transparent to-accent-100/30">
        <BubbleBackground bubbleCount={30} interactive={true} />
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-brand-300/20 rounded-full blur-3xl animate-fresh-breeze" />
      </div>

      <div className="relative w-full max-w-md px-4 animate-fade-in-up">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-strong border border-white/60 p-8 hover-fabric-fold">
          {/* Logo with signature glow */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mb-4 animate-glow-pulse shadow-glow">
              {/* Washing machine icon */}
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="13" r="7" strokeWidth="2" />
                <circle cx="12" cy="13" r="3" strokeWidth="2" className="animate-wash-spin origin-center" style={{ transformBox: 'fill-box' }} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 6h14M8 6V4h8v2" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 animate-text-reveal">
              Lavandería Oriental
            </h1>
            <p className="text-slate-500 mt-1">Panel de Administración</p>

            {/* Signature tagline */}
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-brand-600">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-brand-300" />
              <span className="font-medium tracking-wide uppercase">Ropa Impecable, Siempre</span>
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-brand-300" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-shake">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lavanderiaoriental.com"
                required
                autoComplete="email"
                className="ripple-effect"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="ripple-effect"
              />
            </div>

            <Button
              type="submit"
              className="w-full ripple-effect group"
              size="lg"
              loading={loading}
            >
              <span className="flex items-center gap-2">
                Iniciar sesión
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Button>
          </form>

          {/* Footer with animated sparkles on hover */}
          <div className="mt-8 text-center group">
            <p className="text-xs text-slate-400 transition-colors group-hover:text-brand-500">
              Plataforma de gestión con IA para WhatsApp
            </p>
            {/* AI indicator */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full text-xs text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              Powered by AI
            </div>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-6 text-center text-sm text-slate-500 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p>¿Primera vez? Contacta al administrador para obtener acceso.</p>
        </div>

        {/* Easter Egg: Click counter hint */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-slate-300 hover:text-brand-400 transition-colors cursor-default select-none">
            Click the bubbles
          </p>
        </div>
      </div>
    </div>
  );
}
