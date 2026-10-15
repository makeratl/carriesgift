'use server';

import { updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { MAX_UPLOAD, UPDATE_PHOTOS, processPhoto } from '@/lib/photo';
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

export async function postUpdate(_: unknown, form: FormData): Promise<{ ok?: boolean; error?: string }> {
  const c = await requireAdmin();
  const who = String(form.get('who'));
  const title = String(form.get('title') ?? '').trim(), body = String(form.get('body') ?? '').trim();
  const date_label = String(form.get('date_label') ?? '').trim()
    || new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric' }).format(new Date());
  if (!title || !body || !['Steven', 'Carrie'].includes(who)) return { error: 'Title and text are required.' };

  const file = form.get('photo');
  let image: { image_path: string; image_alt: string; image_w: number; image_h: number } | null = null;
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith('image/')) return { error: 'That file isn\u2019t a photo.' };
    if (file.size > MAX_UPLOAD) return { error: 'That photo is too large. Try a smaller one.' };
    let photo;
    try { photo = await processPhoto(Buffer.from(await file.arrayBuffer())); }
    catch { return { error: 'Couldn\u2019t read that photo. Try a JPEG or PNG.' }; }
    const path = `${crypto.randomUUID()}.jpg`;
    const up = await c.storage.from(UPDATE_PHOTOS).upload(path, photo.data, { contentType: 'image/jpeg', cacheControl: '31536000' });
    if (up.error) return { error: `Photo upload failed: ${up.error.message}` };
    const alt = String(form.get('image_alt') ?? '').trim().slice(0, 300) || title;
    image = { image_path: path, image_alt: alt, image_w: photo.width, image_h: photo.height };
  }

  const { error } = await c.from('updates').insert({ who, title, body, date_label, ...image });
  if (error) {
    if (image) await c.storage.from(UPDATE_PHOTOS).remove([image.image_path]);
    return { error: error.message };
  }
  updateTag('updates');
  return { ok: true };
}

export async function deleteUpdate(form: FormData) {
  const c = await requireAdmin();
  const { data, error } = await c.from('updates').delete().eq('id', String(form.get('id'))).select('image_path');
  if (error) throw error;
  const paths = (data ?? []).map(r => r.image_path).filter(Boolean);
  if (paths.length) await c.storage.from(UPDATE_PHOTOS).remove(paths);
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
