-- Adds the Stories feature (24h-ephemeral media) + storage RLS policies.
-- Run once in Supabase Dashboard -> SQL Editor. Safe to re-run.

-- Stories: 24h-ephemeral media, own-only (no multi-author feed yet).
create table if not exists stories (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references profiles(id) on delete cascade,
  media_type   text not null check (media_type in ('image', 'video')),
  media_url    text not null,
  media_path   text not null, -- storage object path, used to delete the file on expiry
  duration_sec int,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null
);
create index if not exists stories_author_idx on stories(author_id);
create index if not exists stories_expires_idx on stories(expires_at);

alter table stories enable row level security;

do $$ begin
  create policy "stories read"   on stories for select using (expires_at > now());
  create policy "stories insert" on stories for insert with check (auth.uid() = author_id);
  create policy "stories delete" on stories for delete using (auth.uid() = author_id);
exception when duplicate_object then null; end $$;

insert into storage.buckets (id, name, public)
values ('stories', 'stories', true)
on conflict (id) do nothing;

-- Storage RLS: uploads/deletes require the object's first path segment to be
-- the caller's own uid (matches the `${userId}/...` path convention used by
-- storageApi.ts). Without this, uploads are default-denied by RLS even though
-- the bucket itself is public-read — same class of bug as the earlier
-- profiles fix. (RLS is already enabled on storage.objects by default on
-- every Supabase project — only project owners can toggle that, so we don't
-- need to and can't run `alter table storage.objects enable row level security`.)

do $$ begin
  create policy "media read" on storage.objects for select
    using (bucket_id in ('farm-media', 'post-media', 'land-images', 'avatars', 'stories'));

  create policy "media insert" on storage.objects for insert
    with check (
      bucket_id in ('farm-media', 'post-media', 'land-images', 'avatars', 'stories')
      and auth.uid()::text = (storage.foldername(name))[1]
    );

  create policy "media delete" on storage.objects for delete
    using (
      bucket_id in ('farm-media', 'post-media', 'land-images', 'avatars', 'stories')
      and auth.uid()::text = (storage.foldername(name))[1]
    );
exception when duplicate_object then null; end $$;
