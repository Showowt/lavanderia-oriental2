'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // Admin client for table operations
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: 'No se pudo iniciar sesión' };
  }

  // Check if employees table exists and if user is in it
  const { data: employee, error: employeeError } = await supabaseAdmin
    .from('employees')
    .select('*')
    .eq('auth_id', authData.user.id)
    .single();

  // If table doesn't exist (PGRST205) or no employees yet, auto-setup first admin
  if (employeeError) {
    if (employeeError.code === 'PGRST205' || employeeError.code === 'PGRST116') {
      // Table doesn't exist or no rows - first user becomes admin
      // Create employees table via RPC or just insert (table should exist)
      const { error: insertError } = await supabaseAdmin
        .from('employees')
        .insert({
          auth_id: authData.user.id,
          email: authData.user.email,
          name: authData.user.email?.split('@')[0] || 'Admin',
          role: 'admin',
          is_active: true,
        });

      if (insertError) {
        // Table truly doesn't exist - need to create it first
        if (insertError.code === 'PGRST205' || insertError.code === '42P01') {
          await supabase.auth.signOut();
          return {
            error: 'Base de datos no configurada. Ejecuta el SQL de setup en Supabase.'
          };
        }
        await supabase.auth.signOut();
        return { error: `Error de configuración: ${insertError.message}` };
      }

      // Successfully created first admin - redirect to dashboard
      redirect('/admin/dashboard');
    } else {
      // Other error - user not in employees table
      await supabase.auth.signOut();
      return { error: 'No tienes acceso al sistema. Contacta al administrador.' };
    }
  }

  if (!employee.is_active) {
    await supabase.auth.signOut();
    return { error: 'Tu cuenta está desactivada. Contacta al administrador.' };
  }

  // Route based on role
  if (employee.role === 'admin') {
    redirect('/admin/dashboard');
  } else {
    redirect('/employee/dashboard');
  }
}

export async function logout() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.signOut();
  redirect('/login');
}
