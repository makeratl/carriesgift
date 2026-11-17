import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// Keeps the admin's Neon Auth session fresh and completes magic-link sign-in. Only runs on /admin.
// /admin is public here because the page itself shows the sign-in form when there's no session.
const handler = auth?.middleware({ loginUrl: '/admin', publicRoutes: ['/admin'] });

const VERIFIER = 'neon_auth_session_verifier';

export async function proxy(request: NextRequest) {
  if (!handler) return NextResponse.next();

  // A magic link lands on /admin?neon_auth_session_verifier=… . The SDK middleware only trades that
  // code for a session when an OAuth challenge cookie is present, which magic links never set, so
  // trade it here through our own /api/auth proxy (which also mints the signed session cookie).
  // The code is one-time and short-lived, and this works in whatever browser opens the email.
  const verifier = request.nextUrl.searchParams.get(VERIFIER);
  if (verifier) {
    const exchange = new URL('/api/auth/get-session', request.nextUrl.origin);
    exchange.searchParams.set(VERIFIER, verifier);
    const r = await fetch(exchange, {
      headers: { cookie: request.headers.get('cookie') ?? '', origin: request.nextUrl.origin },
      cache: 'no-store',
    });
    const clean = request.nextUrl.clone();
    clean.searchParams.delete(VERIFIER);
    const response = NextResponse.redirect(clean);
    if (r.ok) for (const c of r.headers.getSetCookie()) response.headers.append('set-cookie', c);
    return response;
  }

  return handler(request);
}

export const config = { matcher: ['/admin/:path*'] };
