import { revalidateTag } from 'next/cache';
import { NOTE_MAX } from '@/lib/config';
import { getNotes } from '@/lib/data';
import { cleanName, ipHash, isBot, noteError, rateLimited } from '@/lib/guard';
import { db } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const page = Math.max(0, parseInt(new URL(req.url).searchParams.get('page') || '0', 10) || 0);
  return Response.json(await getNotes(page));
}

export async function POST(req: Request) {
  const input = await req.json().catch(() => null) as { name?: unknown; body?: unknown; website?: unknown } | null;
  if (!input) return Response.json({ error: 'Bad request.' }, { status: 400 });

  const body = String(input.body ?? '').trim();
  const name = cleanName(input.name);
  // Honeypot: real people never see the `website` field. Pretend it worked.
  if (input.website) return Response.json({ id: crypto.randomUUID(), name, body, created_at: new Date().toISOString() });
  const err = noteError(body, name, NOTE_MAX);
  if (err) return Response.json({ error: err }, { status: 400 });
  if (await isBot()) return Response.json({ error: 'Something went wrong. Try again?' }, { status: 403 });

  const c = db();
  if (!c) return Response.json({ id: crypto.randomUUID(), name, body, created_at: new Date().toISOString() });

  const ip_hash = ipHash(req);
  if (await rateLimited(c, 'notes', ip_hash, 3)) return Response.json({ error: 'That’s a lot of notes! Try again in a few minutes.' }, { status: 429 });

  const { data, error } = await c.from('notes').insert({ name, body, ip_hash }).select('id, name, body, created_at').single();
  if (error) return Response.json({ error: 'Could not pin your note. Try again?' }, { status: 500 });

  revalidateTag('notes', { expire: 0 });
  revalidateTag('stats', { expire: 0 });
  return Response.json(data);
}
