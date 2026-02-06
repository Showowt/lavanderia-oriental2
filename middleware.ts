import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create response early
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // Skip middleware for these paths - always allow through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/whatsapp') ||
    pathname.startsWith('/api/setup') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/debug') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return response;
  }

  // Login page - always allow, no redirect
  if (pathname === '/login') {
    return response;
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Get user from Supabase
    const { data: { user } } = await supabase.auth.getUser();

    // Also check for our custom auth cookies as backup
    const hasAccessToken = request.cookies.has('sb-access-token');

    // Home page - redirect based on auth status
    if (pathname === '/') {
      if (user || hasAccessToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Protected routes
    const protectedPaths = [
      '/dashboard',
      '/conversations',
      '/orders',
      '/escalations',
      '/customers',
      '/settings',
      '/admin',
      '/employee'
    ];

    const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

    // If protected route and not authenticated, redirect to login
    if (isProtectedRoute && !user && !hasAccessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return response;
  } catch (e) {
    console.error('Middleware error:', e);
    // On error, allow through to avoid breaking the app
    // Protected pages will handle their own auth
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
