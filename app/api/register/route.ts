import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { getStats } from '@/lib/data';
import { isBot } from '@/lib/guard';
import { db } from '@/lib/db';

// Readable by the page (not httpOnly) so the button can show its state on a
// static page. The token only lets this browser undo its own registration.
const COOKIE = 'cg_reg';
const YEAR = 60 * 60 * 24 * 365;

async function respond() {
  revalidateTag('stats', { expire: 0 });
  const { registered } = await getStats();
  return Response.json({ registered });
}

export async function POST() {
  const store = await cookies();
  if (store.get(COOKIE)) return Response.json({ registered: (await getStats()).registered });
  if (await isBot()) return Response.json({ error: 'Access denied' }, { status: 403 });

  const token = crypto.randomUUID();
  const c = db();
  if (c) {
    try { await c`insert into registrations (token) values (${token})`; }
    catch { return Response.json({ error: 'Could not count you. Try again?' }, { status: 500 }); }
  }
  store.set(COOKIE, token, { maxAge: YEAR, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  return respond();
}

export async function DELETE() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  const c = db();
  if (token && c) await c`delete from registrations where token = ${token}`;
  store.delete(COOKIE);
  return respond();
}
