# Carrie's Gift

Birthday tribute + fundraiser page for Carrie (kidney donation Oct 20, 2026; birthday Nov 3).
Next.js 16 (App Router) on Vercel, Supabase for data and admin auth. Money never touches this site —
every Donate CTA opens the charity's own tribute page (Rallybound).

- **Necklace fill** = the real total, read from the Rallybound page every 5 min (`lib/rallybound.ts`);
  falls back to the total entered in `/admin` if the page can't be read.
- **Gift count** = honor-system "Yes, I gave" confirmations from the gift sheet (+ an admin offset).
  Confirming can pin a birthday note, which shows a bead marker on the wall. Amounts are admin-only.

Design reference: `design/` (Claude Design handoff; open `design/prototype/*.dc.html` in a browser).

## Setup
1. Create a Supabase project. Run `supabase/migrations/20261005000000_init.sql` (SQL editor or `supabase db push`).
2. Supabase → Auth → URL configuration: add `https://kidney.carrieburns.net/auth/callback` and `http://localhost:3077/auth/callback` to redirect URLs.
3. `cp .env.example .env.local` and fill it in. Same vars go into Vercel → Settings → Environment Variables.
4. `npm run dev` (port 3077). Without Supabase env vars the page renders with demo data.

## Admin
`/admin` → magic link (only `ADMIN_EMAILS`). See the live total, set fallbacks/offsets, review and hide confirmed gifts, post updates, hide wall notes.

## Checks
`npm test` (necklace geometry vs the prototype, NY-timezone date logic) · `npm run lint` · `npm run build`
