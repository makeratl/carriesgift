import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** Cookie-bound client used only for admin auth (magic link sessions). */
export async function authClient() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: list => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* called from a Server Component; proxy.ts refreshes the session */ }
      },
    },
  });
}

export const adminEmails = () =>
  (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

/** Returns the signed-in admin's email, or null if not signed in / not allowed. */
export async function currentAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const { data } = await (await authClient()).auth.getUser();
  const email = data.user?.email?.toLowerCase();
  return email && adminEmails().includes(email) ? email : null;
}
