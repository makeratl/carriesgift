import 'server-only';
import { createNeonAuth } from '@neon/auth/next/server';

/** Neon Auth (magic-link sessions) for /admin. Null when it isn't configured. */
export const auth = process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET
  ? createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL,
    // `lax` so the session survives the click-through from the magic-link email.
    cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET, sameSite: 'lax' },
  })
  : null;

export const adminEmails = () =>
  (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

/** Returns the signed-in admin's email, or null if not signed in / not allowed. */
export async function currentAdmin() {
  if (!auth) return null;
  const { data } = await auth.getSession();
  const email = data?.user?.email?.toLowerCase();
  return email && adminEmails().includes(email) ? email : null;
}
