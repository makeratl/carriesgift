import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// Keeps the admin's Neon Auth session fresh and completes magic-link sign-in. Only runs on /admin.
// /admin is public here because the page itself shows the sign-in form when there's no session.
const handler = auth?.middleware({ loginUrl: '/admin', publicRoutes: ['/admin'] });

export function proxy(request: NextRequest) {
  return handler ? handler(request) : NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
