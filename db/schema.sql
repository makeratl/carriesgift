-- Carrie's Gift: Neon schema (moved from Supabase, Nov 2026).
-- All reads and writes go through the Next.js server with DATABASE_URL.
-- Admin sign-in lives in Neon Auth (its own `neon_auth` schema), not here.

create table notes (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'A friend' check (char_length(name) <= 60),
  body text not null check (char_length(body) between 1 and 180),
  via_gift boolean not null default false,
  hidden boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index notes_visible_idx on notes (created_at desc) where not hidden;
create index notes_ip_idx on notes (ip_hash, created_at desc);

-- Honor-system gift confirmations ("Yes, I gave"). Drives the gift count only;
-- the necklace fill comes from the charity's real total.
create table gifts (
  id uuid primary key default gen_random_uuid(),
  amount int not null check (amount between 1 and 1000000),
  name text not null default 'A friend' check (char_length(name) <= 60),
  note_id uuid references notes (id) on delete set null,
  hidden boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index gifts_ip_idx on gifts (ip_hash, created_at desc);

create table registrations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  created_at timestamptz not null default now()
);

create table updates (
  id uuid primary key default gen_random_uuid(),
  who text not null check (who in ('Steven', 'Carrie')),
  title text not null,
  body text not null,
  date_label text not null,
  -- Optional photo; image_path is the key into `photos`, served at /photos/<image_path>.
  image_path text,
  image_alt text check (char_length(image_alt) <= 300),
  image_w int,
  image_h int,
  created_at timestamptz not null default now()
);

-- Update photos (JPEG, already resized to <= 1600px by lib/photo.ts).
create table photos (
  path text primary key,
  data bytea not null check (octet_length(data) <= 2097152),
  created_at timestamptz not null default now()
);

create table stats (
  id int primary key default 1 check (id = 1),
  -- Fallback total, used only when the Rallybound page can't be read.
  raised int not null default 0 check (raised >= 0),
  -- Gifts made without confirming on the site (added to the confirmed count).
  gifts_offset int not null default 0,
  registered_offset int not null default 0,
  updated_at timestamptz not null default now()
);
