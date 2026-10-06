'use server';

import { updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { adminEmails, authClient, currentAdmin } from '@/lib/supabase/server';

async function requireAdmin() {
  const email = await currentAdmin();
  if (!email) redirect('/admin');
  const c = db();
  if (!c) throw new Error('Supabase is not configured.');
  return c;
}

const int = (v: FormDataEntryValue | null) => Math.max(0, parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10) || 0);

export async function sendMagicLink(_: unknown, form: FormData): Promise<{ sent: boolean; error?: string }> {
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  // Same answer either way, so the form doesn't reveal who's on the list.
  const ok = { sent: true };
  if (!adminEmails().includes(email)) return ok;
  const h = await headers();
  const origin = h.get('origin') ?? `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}`;
  const { error } = await (await authClient()).auth.signInWithOtp({
    email, options: { emailRedirectTo: `${origin}/auth/callback`, shouldCreateUser: true },
  });
  if (error) return { sent: false, error: error.message };
  return ok;
}

export async function signOut() {
  await (await authClient()).auth.signOut();
  redirect('/admin');
}

export async function saveStats(form: FormData) {
  const c = await requireAdmin();
  const { error } = await c.from('stats').update({
    raised: int(form.get('raised')), gifts_offset: int(form.get('gifts_offset')),
    registered_offset: int(form.get('registered_offset')), updated_at: new Date().toISOString(),
  }).eq('id', 1);
  if (error) throw error;
  updateTag('stats');
}

export async function postUpdate(form: FormData) {
  const c = await requireAdmin();
  const who = String(form.get('who'));
  const title = String(form.get('title') ?? '').trim(), body = String(form.get('body') ?? '').trim();
  const date_label = String(form.get('date_label') ?? '').trim()
    || new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric' }).format(new Date());
  if (!title || !body || !['Steven', 'Carrie'].includes(who)) return;
  const { error } = await c.from('updates').insert({ who, title, body, date_label });
  if (error) throw error;
  updateTag('updates');
}

export async function deleteUpdate(form: FormData) {
  const c = await requireAdmin();
  const { error } = await c.from('updates').delete().eq('id', String(form.get('id')));
  if (error) throw error;
  updateTag('updates');
}

export async function setGiftHidden(form: FormData) {
  const c = await requireAdmin();
  const { error } = await c.from('gifts').update({ hidden: form.get('hidden') === 'true' }).eq('id', String(form.get('id')));
  if (error) throw error;
  updateTag('stats');
}

export async function setNoteHidden(form: FormData) {
  const c = await requireAdmin();
  const { error } = await c.from('notes').update({ hidden: form.get('hidden') === 'true' }).eq('id', String(form.get('id')));
  if (error) throw error;
  updateTag('notes');
  updateTag('stats');
}
