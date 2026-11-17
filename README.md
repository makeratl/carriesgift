# Carrie's Gift

Birthday tribute + fundraiser page for Carrie (kidney donation Oct 20, 2026; birthday Nov 3).
Next.js 16 (App Router) on Vercel, Neon Postgres for data and Neon Auth for admin sign-in. Money never touches this site —
every Donate CTA opens the charity's own tribute page (Rallybound).

- **Necklace fill** = the real total, read from the Rallybound page every 5 min (`lib/rallybound.ts`);
  falls back to the total entered in `/admin` if the page can't be read.
- **Gift count** = honor-system "Yes, I gave" confirmations from the gift sheet (+ an admin offset).
  Confirming can pin a birthday note, which shows a bead marker on the wall. Amounts are admin-only.

Design reference: `design/` (Claude Design handoff; open `design/prototype/*.dc.html` in a browser).

## Setup
1. Neon project (created from Vercel → Storage, so `DATABASE_URL` is set for you). Run `db/schema.sql` once.
2. Neon → Auth: enable Managed Better Auth and the Magic Link plugin, and add the site origins
   (`https://kidney.carrieburns.net`, `http://localhost:3077`) as trusted domains.
3. `cp .env.example .env.local` and fill it in. Same vars go into Vercel → Settings → Environment Variables.
4. `npm run dev` (port 3077). Without `DATABASE_URL` the page renders with demo data.

Update photos are stored in the `photos` table and served from `/photos/<name>` with immutable caching.
`supabase/migrations/` is the pre-Neon history, kept for reference.

## Admin
`/admin` → magic link (only `ADMIN_EMAILS`). See the live total, set fallbacks/offsets, review and hide confirmed gifts, post updates, hide wall notes.

## Checks
`npm test` (necklace geometry vs the prototype, NY-timezone date logic) · `npm run lint` · `npm run build`
