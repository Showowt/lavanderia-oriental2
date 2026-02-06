import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Skip middleware for static files and API routes (except protected ones)
  const pathname = req.nextUrl.pathname;

  // Always allow these paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/whatsapp') ||
    pathname.startsWith('/api/setup') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/cron') ||
    pathname.includes('.') // Static files
  ) {
    return res;
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    // Public routes
    if (pathname === '/login' || pathname === '/') {
      if (session) {
        // Already logged in, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return res;
    }

    // Protected routes - require auth
    const protectedPaths = ['/dashboard', '/conversations', '/orders', '/escalations', '/customers', '/settings', '/admin', '/employee'];
    const isProtected = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtected && !session) {
      // Not logged in, redirect to login
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow request to proceed
    return res;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
