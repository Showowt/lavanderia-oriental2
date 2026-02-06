'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@lavanderiaoriental.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setDebugInfo('Session found, redirecting...');
          window.location.href = '/dashboard';
        }
      } catch (e) {
        console.error('Session check error:', e);
      }
    };
    checkSession();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDebugInfo('Starting login...');

    try {
      // Validate inputs
      if (!email || !password) {
        setError('Email y contraseña son requeridos');
        setLoading(false);
        return;
      }

      setDebugInfo('Creating Supabase client...');

      // Create fresh Supabase client
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });

      setDebugInfo('Attempting sign in...');

      // Sign in
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        setError(authError.message);
        setDebugInfo(`Auth error: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError('No session returned');
        setDebugInfo('No session in response');
        setLoading(false);
        return;
      }

      setDebugInfo('Login successful! Redirecting...');

      // Small delay then redirect
      setTimeout(() => {
        window.location.replace('/dashboard');
      }, 500);

    } catch (err: any) {
      console.error('Login exception:', err);
      setError(err.message || 'Error al iniciar sesión');
      setDebugInfo(`Exception: ${err.message}`);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" strokeWidth="2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Lavandería Oriental</h1>
          <p className="text-gray-500">Panel de Administración</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="admin@lavanderiaoriental.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Debug info */}
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600 font-mono">
            {debugInfo}
          </div>
        )}

        {/* Help */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Credenciales:</p>
          <p className="font-mono text-xs mt-1">admin@lavanderiaoriental.com</p>
          <p className="font-mono text-xs">Lavanderia2024</p>
        </div>
      </div>
    </div>
  );
}
