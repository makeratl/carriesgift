import { db } from '@/lib/db';

// Update photos are stored in Postgres and served here. Each path is a random,
// never-reused name, so the CDN can cache it forever and the database is only
// touched on the first view.
export async function GET(_: Request, { params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  const sql = db();
  if (!sql || !/^[\w-]+\.jpg$/.test(path)) return new Response('Not found', { status: 404 });
  const rows = await sql`select data from photos where path = ${path}`;
  if (!rows.length) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(rows[0].data as Buffer), {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
