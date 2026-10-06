import { NextResponse } from 'next/server';
import { authClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (code) await (await authClient()).auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL('/admin', url.origin));
}
