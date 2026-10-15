import 'server-only';
import { unstable_cache } from 'next/cache';
import { FUNDRAISER_URL } from './config';
import { UPDATE_PHOTOS } from './photo';
import { fetchRaised } from './rallybound';
import { db } from './supabase/admin';

export type Stats = { raised: number; gifts: number; registered: number; notes: number };
export type Note = { id: string; name: string; body: string; created_at: string; via_gift?: boolean };
export type Update = {
  id: string; who: string; title: string; body: string; date_label: string;
  image?: { src: string; alt: string; width: number; height: number };
};

export const PAGE_SIZE = 24;

// Shown when Supabase isn't configured (local design work), so the page still renders.
const DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL;
const demoNotes: Note[] = [
  { id: 'd1', name: 'Jen M.', body: 'Happy birthday to the bravest person I know.', created_at: '' },
  { id: 'd2', name: 'The Thompsons', body: "You're giving someone years. We love you.", created_at: '' },
  { id: 'd3', name: 'Dana', body: 'Gave in your honor. Can’t wait to celebrate you!', created_at: '', via_gift: true },
  { id: 'd4', name: 'Mike & Liz', body: 'Rest up first. Then cake.', created_at: '' },
];

/** Live total from the charity's page, cached 5 minutes. Null if it can't be read. */
export const getLiveRaised = unstable_cache(() => fetchRaised(FUNDRAISER_URL), ['live-raised'], { tags: ['live-raised'], revalidate: 300 });

export const getStats = unstable_cache(async (): Promise<Stats> => {
  const c = db();
  if (!c) return { raised: (await getLiveRaised()) ?? 1840, gifts: 27, registered: 12, notes: demoNotes.length };
  const [live, s, g, r, n] = await Promise.all([
    getLiveRaised(),
    c.from('stats').select('raised, gifts_offset, registered_offset').eq('id', 1).single(),
    c.from('gifts').select('id', { count: 'exact', head: true }).eq('hidden', false),
    c.from('registrations').select('id', { count: 'exact', head: true }),
    c.from('notes').select('id', { count: 'exact', head: true }).eq('hidden', false),
  ]);
  if (s.error) throw s.error;
  return {
    raised: live ?? s.data.raised,
    gifts: (g.count ?? 0) + s.data.gifts_offset,
    registered: (r.count ?? 0) + s.data.registered_offset,
    notes: n.count ?? 0,
  };
}, ['stats'], { tags: ['stats'], revalidate: 60 });

export const getNotes = unstable_cache(async (page = 0): Promise<Note[]> => {
  const c = db();
  if (!c) return page === 0 ? demoNotes : [];
  const { data, error } = await c.from('notes').select('id, name, body, created_at, via_gift').eq('hidden', false)
    .order('created_at', { ascending: false }).range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
  if (error) throw error;
  return data;
}, ['notes'], { tags: ['notes'], revalidate: 60 });

export const getUpdates = unstable_cache(async (): Promise<Update[]> => {
  const c = db();
  if (!c) return [
    { id: 'u1', who: 'Steven', date_label: 'Oct 5', title: 'Why this page exists', body: "Carrie's surgery is October 20 and her birthday is November 3. Instead of gifts, we're asking for support in her name: a bead for her necklace, a donor registration, or a note on her wall." },
  ];
  const { data, error } = await c.from('updates')
    .select('id, who, title, body, date_label, image_path, image_alt, image_w, image_h').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(({ image_path, image_alt, image_w, image_h, ...u }) => image_path && image_w && image_h
    ? { ...u, image: { src: c.storage.from(UPDATE_PHOTOS).getPublicUrl(image_path).data.publicUrl, alt: image_alt ?? u.title, width: image_w, height: image_h } }
    : u);
}, ['updates'], { tags: ['updates'], revalidate: 60 });

export { DEMO };
