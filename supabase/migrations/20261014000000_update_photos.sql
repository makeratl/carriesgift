-- Optional photo on an update, uploaded from /admin.
-- Files live in a public-read bucket; only the server (service role) writes to it,
-- since storage.objects has no policies for anon/authenticated.

alter table public.updates
  add column image_path text,
  add column image_alt text check (char_length(image_alt) <= 300),
  add column image_w int,
  add column image_h int;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('update-photos', 'update-photos', true, 2097152, array['image/jpeg'])
on conflict (id) do nothing;
