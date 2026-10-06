import { revalidateTag } from 'next/cache';
import { NOTE_MAX } from '@/lib/config';
import { cleanName, ipHash, isBot, noteError, rateLimited } from '@/lib/guard';
import { db } from '@/lib/supabase/admin';

// Honor-system "Yes, I gave" confirmations. Counts toward the gift tally only;
// the necklace fill comes from the charity's real total.
export async function POST(req: Request) {
  const input = await req.json().catch(() => null) as { amount?: unknown; name?: unknown; body?: unknown; website?: unknown } | null;
  if (!input) return Response.json({ error: 'Bad request.' }, { status: 400 });

  const amount = Math.floor(Number(input.amount));
  const name = cleanName(input.name);
  const body = String(input.body ?? '').trim();
  if (input.website) return Response.json({ note: null });
  if (!Number.isFinite(amount) || amount < 1 || amount > 1_000_000) return Response.json({ error: 'Enter the amount you gave.' }, { status: 400 });
  if (body) {
    const err = noteError(body, name, NOTE_MAX);
    if (err) return Response.json({ error: err }, { status: 400 });
  }
  if (await isBot()) return Response.json({ error: 'Something went wrong. Try again?' }, { status: 403 });

  const c = db();
  const now = new Date().toISOString();
  if (!c) return Response.json({ note: body ? { id: crypto.randomUUID(), name, body, created_at: now, via_gift: true } : null });

  const ip_hash = ipHash(req);
  if (await rateLimited(c, 'gifts', ip_hash, 5)) return Response.json({ error: 'That’s a lot of gifts! Try again in a few minutes.' }, { status: 429 });

  let note = null;
  if (body) {
    const { data, error } = await c.from('notes').insert({ name, body, ip_hash, via_gift: true })
      .select('id, name, body, created_at, via_gift').single();
    if (error) return Response.json({ error: 'Could not pin your note. Try again?' }, { status: 500 });
    note = data;
  }
  const { error } = await c.from('gifts').insert({ amount, name, ip_hash, note_id: note?.id ?? null });
  if (error) return Response.json({ error: 'Could not count your gift. Try again?' }, { status: 500 });

  revalidateTag('stats', { expire: 0 });
  if (note) revalidateTag('notes', { expire: 0 });
  return Response.json({ note });
}
