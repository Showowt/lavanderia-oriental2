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

  // Skip middleware for these paths
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
            cookiesToSet.forEach(({ name, value, options }) =>
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

    // IMPORTANT: getUser() is more reliable than getSession() for middleware
    const { data: { user }, error } = await supabase.auth.getUser();

    // Login page - always allow access, let client handle redirect
    if (pathname === '/login') {
      return response;
    }

    // Home page - redirect based on auth status
    if (pathname === '/') {
      if (user) {
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

    if (isProtectedRoute && !user) {
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (e) {
    console.error('Middleware error:', e);
    // On error, redirect to login for protected routes
    const protectedPaths = ['/dashboard', '/conversations', '/orders', '/escalations', '/customers', '/settings', '/admin', '/employee'];
    if (protectedPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
