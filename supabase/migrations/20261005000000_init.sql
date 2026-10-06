-- Carrie's Gift: initial schema.
-- All writes go through the Next.js server using the service-role key.
-- RLS is on with no policies, so the public anon key can't touch data.

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'A friend' check (char_length(name) <= 60),
  body text not null check (char_length(body) between 1 and 180),
  via_gift boolean not null default false,
  hidden boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index notes_visible_idx on public.notes (created_at desc) where not hidden;
create index notes_ip_idx on public.notes (ip_hash, created_at desc);

-- Honor-system gift confirmations ("Yes, I gave"). Drives the gift count only;
-- the necklace fill comes from the charity's real total.
create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  amount int not null check (amount between 1 and 1000000),
  name text not null default 'A friend' check (char_length(name) <= 60),
  note_id uuid references public.notes (id) on delete set null,
  hidden boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index gifts_ip_idx on public.gifts (ip_hash, created_at desc);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  created_at timestamptz not null default now()
);

create table public.updates (
  id uuid primary key default gen_random_uuid(),
  who text not null check (who in ('Steven', 'Carrie')),
  title text not null,
  body text not null,
  date_label text not null,
  created_at timestamptz not null default now()
);

create table public.stats (
  id int primary key default 1 check (id = 1),
  -- Fallback total, used only when the Rallybound page can't be read.
  raised int not null default 0 check (raised >= 0),
  -- Gifts made without confirming on the site (added to the confirmed count).
  gifts_offset int not null default 0,
  registered_offset int not null default 0,
  updated_at timestamptz not null default now()
);
insert into public.stats (id) values (1);

insert into public.updates (who, title, body, date_label) values
  ('Steven', 'Why this page exists',
   'Carrie''s surgery is October 20 and her birthday is November 3. Instead of gifts, we''re asking for support in her name: a bead for her necklace, a donor registration, or a note on her wall.',
   'Oct 5');

alter table public.notes enable row level security;
alter table public.gifts enable row level security;
alter table public.registrations enable row level security;
alter table public.updates enable row level security;
alter table public.stats enable row level security;

-- No policies: the anon/authenticated roles get nothing. The server reads and
-- writes with the service role and only ever returns public columns.
