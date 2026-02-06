'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runTests() {
      const testResults: any = {};

      // Test 1: Check env vars are available
      testResults.envVars = {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
      };

      // Test 2: Test auth API
      try {
        const authRes = await fetch('/api/auth/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@lavanderiaoriental.com',
            password: 'Lavanderia2024'
          })
        });
        testResults.authApi = await authRes.json();
      } catch (e: any) {
        testResults.authApi = { error: e.message };
      }

      // Test 3: Try direct Supabase connection
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@lavanderiaoriental.com',
          password: 'Lavanderia2024'
        });

        testResults.directAuth = {
          success: !!data.session,
          userId: data.user?.id,
          error: error?.message
        };

        // Check current session
        const { data: sessionData } = await supabase.auth.getSession();
        testResults.currentSession = {
          hasSession: !!sessionData.session,
          userId: sessionData.session?.user?.id
        };

      } catch (e: any) {
        testResults.directAuth = { error: e.message };
      }

      // Test 4: Check cookies
      testResults.cookies = document.cookie || 'No cookies found';

      // Test 5: Check localStorage
      try {
        const storage: any = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes('supabase')) {
            storage[key] = localStorage.getItem(key)?.substring(0, 100) + '...';
          }
        }
        testResults.localStorage = Object.keys(storage).length > 0 ? storage : 'No Supabase data in localStorage';
      } catch (e: any) {
        testResults.localStorage = { error: e.message };
      }

      setResults(testResults);
      setLoading(false);
    }

    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>

        {loading ? (
          <div className="text-center py-8">Running tests...</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(results).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h2>
                <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-sm">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-4">
          <a
            href="/login"
            className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
          >
            Go to Login Page
          </a>
          <a
            href="/dashboard"
            className="block w-full py-3 px-4 bg-green-600 text-white text-center rounded-lg hover:bg-green-700"
          >
            Try Dashboard (Protected)
          </a>
        </div>
      </div>
    </div>
  );
}
