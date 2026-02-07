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

  // Public routes - always allow through without auth
  const publicPaths = [
    '/',
    '/servicios',
    '/ubicaciones',
    '/franquicias',
    '/legal',
    '/login',
  ];

  const isPublicRoute = publicPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  );

  // Skip middleware for static assets, API routes, and public pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/whatsapp') ||
    pathname.startsWith('/api/setup') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/debug') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    isPublicRoute
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
