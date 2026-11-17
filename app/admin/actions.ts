'use server';

import { updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { MAX_UPLOAD, processPhoto } from '@/lib/photo';
import { db } from '@/lib/db';
import { adminEmails, auth, currentAdmin } from '@/lib/auth';

async function requireAdmin() {
  const email = await currentAdmin();
  if (!email) redirect('/admin');
  const c = db();
  if (!c) throw new Error('The database is not configured.');
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
  if (!auth) return { sent: false, error: 'Sign-in is not configured.' };
  // The server SDK supports magic links at runtime (sign-in/magic-link) but its types don't list it yet.
  const signIn = auth.signIn as typeof auth.signIn & {
    magicLink(o: { email: string; callbackURL: string }): Promise<{ error: { message?: string } | null }>;
  };
  const { error } = await signIn.magicLink({ email, callbackURL: `${origin}/admin` });
  if (error) return { sent: false, error: error.message ?? 'Could not send the link.' };
  return ok;
}

export async function signOut() {
  await auth?.signOut();
  redirect('/admin');
}

export async function saveStats(form: FormData) {
  const c = await requireAdmin();
  await c`update stats set raised = ${int(form.get('raised'))}, gifts_offset = ${int(form.get('gifts_offset'))},
    registered_offset = ${int(form.get('registered_offset'))}, updated_at = now() where id = 1`;
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
    try { await c`insert into photos (path, data) values (${path}, ${photo.data})`; }
    catch { return { error: 'Photo upload failed. Try again?' }; }
    const alt = String(form.get('image_alt') ?? '').trim().slice(0, 300) || title;
    image = { image_path: path, image_alt: alt, image_w: photo.width, image_h: photo.height };
  }

  try {
    await c`insert into updates (who, title, body, date_label, image_path, image_alt, image_w, image_h)
      values (${who}, ${title}, ${body}, ${date_label}, ${image?.image_path ?? null}, ${image?.image_alt ?? null}, ${image?.image_w ?? null}, ${image?.image_h ?? null})`;
  } catch {
    if (image) await c`delete from photos where path = ${image.image_path}`;
    return { error: 'Could not post the update. Try again?' };
  }
  updateTag('updates');
  return { ok: true };
}

export async function deleteUpdate(form: FormData) {
  const c = await requireAdmin();
  const rows = await c`delete from updates where id = ${String(form.get('id'))} returning image_path`;
  const paths = rows.map(r => r.image_path).filter(Boolean);
  if (paths.length) await c`delete from photos where path = any(${paths})`;
  updateTag('updates');
}

export async function setGiftHidden(form: FormData) {
  const c = await requireAdmin();
  await c`update gifts set hidden = ${form.get('hidden') === 'true'} where id = ${String(form.get('id'))}`;
  updateTag('stats');
}

export async function setNoteHidden(form: FormData) {
  const c = await requireAdmin();
  await c`update notes set hidden = ${form.get('hidden') === 'true'} where id = ${String(form.get('id'))}`;
  updateTag('notes');
  updateTag('stats');
}
