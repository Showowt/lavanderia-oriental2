'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
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

  // Check if user exists in employees table
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('*')
    .eq('auth_id', authData.user.id)
    .single();

  if (employeeError || !employee) {
    // User authenticated but not in employees table
    await supabase.auth.signOut();
    return { error: 'No tienes acceso al sistema. Contacta al administrador.' };
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
