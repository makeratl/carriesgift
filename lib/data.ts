import 'server-only';
import { unstable_cache } from 'next/cache';
import { FUNDRAISER_URL } from './config';
import { fetchRaised } from './rallybound';
import { db } from './db';

export type Stats = { raised: number; gifts: number; registered: number; notes: number };
export type Note = { id: string; name: string; body: string; created_at: string; via_gift?: boolean };
export type Update = {
  id: string; who: string; title: string; body: string; date_label: string;
  image?: { src: string; alt: string; width: number; height: number };
};

export const PAGE_SIZE = 24;

// Shown when the database isn't configured (local design work), so the page still renders.
const DEMO = !process.env.DATABASE_URL;
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
  const [live, [s]] = await Promise.all([
    getLiveRaised(),
    c`select raised, gifts_offset, registered_offset,
        (select count(*)::int from gifts where not hidden) as gifts,
        (select count(*)::int from registrations) as registered,
        (select count(*)::int from notes where not hidden) as notes
      from stats where id = 1`,
  ]);
  return {
    raised: live ?? s.raised,
    gifts: s.gifts + s.gifts_offset,
    registered: s.registered + s.registered_offset,
    notes: s.notes,
  };
}, ['stats'], { tags: ['stats'], revalidate: 60 });

export const getNotes = unstable_cache(async (page = 0): Promise<Note[]> => {
  const c = db();
  if (!c) return page === 0 ? demoNotes : [];
  return await c`select id, name, body, created_at, via_gift from notes where not hidden
    order by created_at desc limit ${PAGE_SIZE} offset ${page * PAGE_SIZE}` as Note[];
}, ['notes'], { tags: ['notes'], revalidate: 60 });

export const getUpdates = unstable_cache(async (): Promise<Update[]> => {
  const c = db();
  if (!c) return [
    { id: 'u1', who: 'Steven', date_label: 'Oct 5', title: 'Why this page exists', body: "Carrie's surgery is October 20 and her birthday is November 3. Instead of gifts, we're asking for support in her name: a bead for her necklace, a donor registration, or a note on her wall." },
  ];
  const rows = await c`select id, who, title, body, date_label, image_path, image_alt, image_w, image_h
    from updates order by created_at desc`;
  return rows.map(({ image_path, image_alt, image_w, image_h, ...u }) => image_path && image_w && image_h
    ? { ...u, image: { src: `/photos/${image_path}`, alt: image_alt ?? u.title, width: image_w, height: image_h } }
    : u) as Update[];
}, ['updates'], { tags: ['updates'], revalidate: 60 });

export { DEMO };
