import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if exists
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/auth', '/api/whatsapp/webhook'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Admin-only routes
  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // Employee routes (employees can access)
  const employeeRoutes = ['/employee'];
  const isEmployeeRoute = employeeRoutes.some(route => pathname.startsWith(route));

  // Legacy dashboard routes - redirect to role-based dashboard
  const legacyRoutes = ['/dashboard', '/conversations', '/orders', '/escalations', '/customers', '/settings'];
  const isLegacyRoute = legacyRoutes.some(route => pathname.startsWith(route));

  // If not authenticated and trying to access protected route
  if (!session && (isAdminRoute || isEmployeeRoute || isLegacyRoute)) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated
  if (session) {
    // Redirect from login to appropriate dashboard
    if (pathname === '/login') {
      // Get user role from employees table
      const { data: employee, error } = await supabase
        .from('employees')
        .select('role')
        .eq('auth_id', session.user.id)
        .single();

      // If table doesn't exist or no record, let login page handle it
      if (error) {
        return res;
      }

      if (employee?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      } else if (employee) {
        return NextResponse.redirect(new URL('/employee/dashboard', req.url));
      }
    }

    // Handle legacy routes - redirect to role-based routes
    if (isLegacyRoute) {
      const { data: employee, error } = await supabase
        .from('employees')
        .select('role')
        .eq('auth_id', session.user.id)
        .single();

      // If error, redirect to admin by default for first-time setup
      if (error) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }

      if (employee?.role === 'admin') {
        // Map legacy routes to admin routes
        const newPath = pathname.replace(/^\/(dashboard|conversations|orders|escalations|customers|settings)/, '/admin$&');
        return NextResponse.redirect(new URL(newPath, req.url));
      } else if (employee) {
        // Employees go to their limited dashboard
        return NextResponse.redirect(new URL('/employee/dashboard', req.url));
      }
    }

    // Check admin route access
    if (isAdminRoute) {
      const { data: employee, error } = await supabase
        .from('employees')
        .select('role')
        .eq('auth_id', session.user.id)
        .single();

      // If error (table doesn't exist or no record), allow access for first-time setup
      if (error) {
        return res;
      }

      if (employee?.role !== 'admin') {
        // Not an admin, redirect to employee dashboard
        return NextResponse.redirect(new URL('/employee/dashboard', req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
