-- ============================================================================
-- GreenPlot — Supabase schema (Phase 0)
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (idempotent-ish: uses IF NOT EXISTS / CREATE OR REPLACE).
-- ============================================================================

-- ── Enums ───────────────────────────────────────────────────────────────────
do $$ begin
  create type user_role        as enum ('farmer', 'owner');
  create type land_status       as enum ('active', 'leased', 'inactive');
  create type lease_status       as enum ('pending', 'active', 'expired', 'cancelled');
  create type request_status     as enum ('pending', 'accepted', 'rejected');
  create type post_category      as enum ('success', 'vermicompost', 'organic', 'tips', 'pest', 'questions');
  create type post_media_type    as enum ('image', 'video', 'grid', 'text', 'blog');
  create type job_status         as enum ('open', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ── Profiles (1:1 with auth.users) ──────────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null default '',
  phone        text,
  role         user_role not null default 'farmer',
  location     text,
  district     text,
  state        text,
  whatsapp     text,
  has_whatsapp boolean not null default true,
  avatar_url   text,
  created_at   timestamptz not null default now()
);
-- For existing databases, run once:
-- alter table profiles add column if not exists whatsapp text;
-- alter table profiles add column if not exists has_whatsapp boolean not null default true;

-- ── Lands / properties ──────────────────────────────────────────────────────
create table if not exists lands (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references profiles(id) on delete cascade,
  title              text not null,
  soil_type          text,
  acres              numeric,
  location           text,
  district           text,
  state              text,
  tenure             text,
  price_per_year     text,
  lease_type         text,
  description        text,
  image_url          text,
  status             land_status not null default 'active',
  geo                jsonb,            -- plot polygon GeoJSON
  last_year_crop     text,
  last_year_earnings text,
  current_crop       text,
  survey_number      text,
  verified           boolean not null default false,
  verified_owner     text,
  created_at         timestamptz not null default now()
);
-- For existing databases, run once:
-- alter table lands add column if not exists survey_number text;
-- alter table lands add column if not exists verified boolean not null default false;
-- alter table lands add column if not exists verified_owner text;
create index if not exists lands_owner_idx on lands(owner_id);
create index if not exists lands_state_idx on lands(state);

-- ── Lease requests (farmer → owner's land) ──────────────────────────────────
create table if not exists lease_requests (
  id          uuid primary key default gen_random_uuid(),
  land_id     uuid not null references lands(id) on delete cascade,
  farmer_id   uuid not null references profiles(id) on delete cascade,
  owner_id    uuid not null references profiles(id) on delete cascade,
  message     text,
  status      request_status not null default 'pending',
  created_at  timestamptz not null default now()
);

-- ── Active leases ───────────────────────────────────────────────────────────
create table if not exists leases (
  id          uuid primary key default gen_random_uuid(),
  land_id     uuid not null references lands(id) on delete cascade,
  farmer_id   uuid not null references profiles(id) on delete cascade,
  owner_id    uuid not null references profiles(id) on delete cascade,
  status      lease_status not null default 'active',
  start_date  date,
  end_date    date,
  rent        text,
  next_payment date,
  created_at  timestamptz not null default now()
);

-- ── Community Hub: posts / likes / saves / comments ─────────────────────────
create table if not exists posts (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references profiles(id) on delete cascade,
  category      post_category not null default 'tips',
  title         text, -- blog posts only
  text          text,
  media_type    post_media_type not null default 'text',
  media_urls    text[] not null default '{}',
  earned_label  text,
  likes_count   int not null default 0,
  comments_count int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists posts_created_idx on posts(created_at desc);
create index if not exists posts_category_idx on posts(category);

create table if not exists post_likes (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  primary key (post_id, user_id)
);
create table if not exists post_saves (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  primary key (post_id, user_id)
);
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts(id) on delete cascade,
  author_id  uuid not null references profiles(id) on delete cascade,
  text       text not null,
  created_at timestamptz not null default now()
);

-- ── Labor Connect ───────────────────────────────────────────────────────────
create table if not exists labor_jobs (
  id            uuid primary key default gen_random_uuid(),
  farmer_id     uuid not null references profiles(id) on delete cascade,
  work_type     text,
  description   text,
  workers_needed int default 1,
  wage_per_day  numeric,
  work_date     date,
  status        job_status not null default 'open',
  location      text,
  created_at    timestamptz not null default now()
);
create table if not exists job_applications (
  id         uuid primary key default gen_random_uuid(),
  job_id     uuid not null references labor_jobs(id) on delete cascade,
  labor_id   uuid not null references profiles(id) on delete cascade,
  status     request_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ── Crop records / soil tests / notifications / rewards ─────────────────────
create table if not exists crop_records (
  id         uuid primary key default gen_random_uuid(),
  farmer_id  uuid not null references profiles(id) on delete cascade,
  land_id    uuid references lands(id) on delete set null,
  crop       text,
  stage      text,
  health_pct int,
  created_at timestamptz not null default now()
);
create table if not exists soil_tests (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  lat        double precision,
  lon        double precision,
  address    text,
  result     jsonb,           -- raw soil API response
  created_at timestamptz not null default now()
);
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  type       text,
  title      text,
  body       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists rewards (
  user_id     uuid primary key references profiles(id) on delete cascade,
  coins       int not null default 0,
  streak_days int not null default 0,
  level       int not null default 1,
  updated_at  timestamptz not null default now()
);

-- ── Auto-create a profile row when a user signs up ──────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (
    id,
    name,
    phone,
    role,
    location,
    district,
    state,
    has_whatsapp
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), nullif(new.raw_user_meta_data->>'full_name', ''), ''),
    coalesce(new.phone, nullif(new.raw_user_meta_data->>'phone', '')),
    case
      when new.raw_user_meta_data->>'role' in ('farmer', 'owner')
        then (new.raw_user_meta_data->>'role')::user_role
      else 'farmer'::user_role
    end,
    nullif(new.raw_user_meta_data->>'location', ''),
    nullif(new.raw_user_meta_data->>'district', ''),
    nullif(new.raw_user_meta_data->>'state', ''),
    coalesce((new.raw_user_meta_data->>'has_whatsapp')::boolean, true)
  )
  on conflict (id) do update set
    name = coalesce(nullif(excluded.name, ''), public.profiles.name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    role = coalesce(excluded.role, public.profiles.role),
    location = coalesce(excluded.location, public.profiles.location),
    district = coalesce(excluded.district, public.profiles.district),
    state = coalesce(excluded.state, public.profiles.state),
    has_whatsapp = coalesce(excluded.has_whatsapp, public.profiles.has_whatsapp);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Backfill profiles for users that existed before the trigger was installed.
insert into public.profiles (id, name, phone, role)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data->>'name', ''), nullif(u.raw_user_meta_data->>'full_name', ''), ''),
  coalesce(u.phone, nullif(u.raw_user_meta_data->>'phone', ''), regexp_replace(coalesce(u.email, ''), '@greenplot\.app$', '')),
  case
    when u.raw_user_meta_data->>'role' in ('farmer', 'owner')
      then (u.raw_user_meta_data->>'role')::user_role
    else 'farmer'::user_role
  end
from auth.users u
where not exists (
  select 1
  from public.profiles p
  where p.id = u.id
);

-- ============================================================================
-- Row Level Security (RLS) — every table locked down; policies grant access.
-- ============================================================================
alter table profiles        enable row level security;
alter table lands           enable row level security;
alter table lease_requests  enable row level security;
alter table leases          enable row level security;
alter table posts           enable row level security;
alter table post_likes      enable row level security;
alter table post_saves      enable row level security;
alter table comments        enable row level security;
alter table labor_jobs      enable row level security;
alter table job_applications enable row level security;
alter table crop_records    enable row level security;
alter table soil_tests      enable row level security;
alter table notifications   enable row level security;
alter table rewards         enable row level security;

-- Profiles: anyone signed-in can read; you can only edit your own.
create policy "profiles read"   on profiles for select using (true);
create policy "profiles insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.save_own_profile(
  p_id uuid,
  p_name text,
  p_role text,
  p_phone text,
  p_location text default null,
  p_district text default null,
  p_state text default null,
  p_has_whatsapp boolean default true
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() <> p_id then
    raise exception 'Not allowed to save this profile';
  end if;

  insert into public.profiles (
    id,
    name,
    role,
    phone,
    location,
    district,
    state,
    has_whatsapp
  )
  values (
    p_id,
    coalesce(p_name, ''),
    case when p_role in ('farmer', 'owner') then p_role::user_role else 'farmer'::user_role end,
    p_phone,
    p_location,
    p_district,
    p_state,
    coalesce(p_has_whatsapp, true)
  )
  on conflict (id) do update set
    name = excluded.name,
    role = excluded.role,
    phone = excluded.phone,
    location = excluded.location,
    district = excluded.district,
    state = excluded.state,
    has_whatsapp = excluded.has_whatsapp;
end;
$$;

grant execute on function public.save_own_profile(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean
) to authenticated;

-- Lands: public read (marketplace); only the owner can write their own.
create policy "lands read"   on lands for select using (true);
create policy "lands insert" on lands for insert with check (auth.uid() = owner_id);
create policy "lands update" on lands for update using (auth.uid() = owner_id);
create policy "lands delete" on lands for delete using (auth.uid() = owner_id);

-- Lease requests: visible to the farmer who made it or the owner who received it.
create policy "lr read"   on lease_requests for select using (auth.uid() in (farmer_id, owner_id));
create policy "lr insert" on lease_requests for insert with check (auth.uid() = farmer_id);
create policy "lr update" on lease_requests for update using (auth.uid() in (farmer_id, owner_id));

-- Leases: visible to the two parties.
create policy "lease read" on leases for select using (auth.uid() in (farmer_id, owner_id));

-- Posts: public read; author writes their own.
create policy "posts read"   on posts for select using (true);
create policy "posts insert" on posts for insert with check (auth.uid() = author_id);
create policy "posts update" on posts for update using (auth.uid() = author_id);
create policy "posts delete" on posts for delete using (auth.uid() = author_id);

-- Likes / saves: read all; a user manages only their own rows.
create policy "likes read"  on post_likes for select using (true);
create policy "likes write" on post_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "saves read"  on post_saves for select using (true);
create policy "saves write" on post_saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Comments: public read; author writes their own.
create policy "comments read"   on comments for select using (true);
create policy "comments insert" on comments for insert with check (auth.uid() = author_id);

-- Labor jobs: public read; farmer manages own.
create policy "jobs read"   on labor_jobs for select using (true);
create policy "jobs write"  on labor_jobs for all using (auth.uid() = farmer_id) with check (auth.uid() = farmer_id);
create policy "apps read"   on job_applications for select using (true);
create policy "apps write"  on job_applications for all using (auth.uid() = labor_id) with check (auth.uid() = labor_id);

-- Private-to-user tables.
create policy "crops own"   on crop_records for all using (auth.uid() = farmer_id) with check (auth.uid() = farmer_id);
create policy "soil own"    on soil_tests   for all using (auth.uid() = user_id)   with check (auth.uid() = user_id);
create policy "notif own"   on notifications for all using (auth.uid() = user_id)  with check (auth.uid() = user_id);
create policy "rewards own" on rewards      for all using (auth.uid() = user_id)   with check (auth.uid() = user_id);

-- ============================================================================
-- Storage buckets (run once). Then add policies in Dashboard → Storage.
--   land-images  (public read)
--   post-media   (public read)
--   avatars      (public read)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('land-images','land-images', true), ('post-media','post-media', true), ('avatars','avatars', true)
on conflict (id) do nothing;

-- ============================================================================
-- Lease module v2 — offers + agreements + denormalised columns + REALTIME
-- (the app evolved to multiple offers per land + a digital e-sign agreement).
-- Run this block after the section above. Idempotent.
-- ============================================================================

do $$ begin
  create type lease_type_id as enum ('cash_rent','fixed_rent','crop_share','revenue_share','flexible_share','custom');
exception when duplicate_object then null; end $$;

-- Lease OFFERS (owner attaches 1+ to a land)
create table if not exists lease_offers (
  id             uuid primary key default gen_random_uuid(),
  land_id        uuid not null references lands(id) on delete cascade,
  owner_id       uuid not null references profiles(id) on delete cascade,
  type_id        lease_type_id not null,
  terms          jsonb not null default '{}',
  tenure         text,
  available_from text,
  created_at     timestamptz not null default now()
);
create index if not exists lease_offers_land_idx on lease_offers(land_id);

-- lease_requests: add the denormalised columns the app uses
alter table lease_requests add column if not exists offer_id      uuid references lease_offers(id) on delete cascade;
alter table lease_requests add column if not exists type_id       lease_type_id;
alter table lease_requests add column if not exists land_title    text;
alter table lease_requests add column if not exists terms_summary text;
alter table lease_requests add column if not exists farmer_name   text;
alter table lease_requests add column if not exists owner_name    text;

-- Lease AGREEMENTS (created on approval, two-party e-sign)
create table if not exists lease_agreements (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid references lease_requests(id) on delete cascade,
  land_id       uuid not null,
  offer_id      uuid not null,
  type_id       lease_type_id not null,
  land_title    text,
  type_name     text,
  terms_summary text,
  full_terms    jsonb not null default '[]',
  tenure        text,
  available_from text,
  farmer_id     uuid not null references profiles(id) on delete cascade,
  farmer_name   text,
  owner_id      uuid not null references profiles(id) on delete cascade,
  owner_name    text,
  owner_signed  boolean not null default false,
  farmer_signed boolean not null default false,
  status        text not null default 'awaiting',  -- awaiting | active | cancelled
  start_date    text,
  created_at    timestamptz not null default now()
);

-- leases (active): add the denormalised columns the app shows
alter table leases add column if not exists land_title    text;
alter table leases add column if not exists offer_id      uuid;
alter table leases add column if not exists type_id       lease_type_id;
alter table leases add column if not exists type_name     text;
alter table leases add column if not exists terms_summary text;
alter table leases add column if not exists farmer_name   text;
alter table leases add column if not exists owner_name    text;

-- RLS
alter table lease_offers     enable row level security;
alter table lease_agreements enable row level security;

-- Offers: public read (marketplace); owner manages their own.
do $$ begin
  create policy "offers read"   on lease_offers for select using (true);
  create policy "offers write"  on lease_offers for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
exception when duplicate_object then null; end $$;

-- Agreements: visible to the two parties; either may update (sign).
do $$ begin
  create policy "agr read"   on lease_agreements for select using (auth.uid() in (farmer_id, owner_id));
  create policy "agr write"  on lease_agreements for all using (auth.uid() in (farmer_id, owner_id)) with check (auth.uid() in (farmer_id, owner_id));
exception when duplicate_object then null; end $$;

-- ── REALTIME: stream these tables to subscribed clients ─────────────────────
alter publication supabase_realtime add table lease_offers;
alter publication supabase_realtime add table lease_requests;
alter publication supabase_realtime add table lease_agreements;
alter publication supabase_realtime add table leases;

-- leases need an insert/update policy (farmer signing creates a lease row)
do $$ begin
  create policy "lease write" on leases for all using (auth.uid() in (farmer_id, owner_id)) with check (auth.uid() in (farmer_id, owner_id));
exception when duplicate_object then null; end $$;

-- ============================================================================
-- Community Hub: Stories (24h ephemeral) + real storage RLS for uploads
-- ============================================================================

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
-- the bucket itself is public-read — same class of bug as the profiles fix.
-- (RLS is already enabled on storage.objects by default on every Supabase
-- project — only project owners can toggle that, so we can't run
-- `alter table storage.objects enable row level security` ourselves.)

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

-- ============================================================================
-- Atomic like/unlike toggle: updates post_likes AND posts.likes_count
-- together, so the counter can't race between concurrent likers. Runs as
-- security definer since regular users can't update someone else's post row.
-- ============================================================================
create or replace function public.toggle_post_like(p_post_id uuid)
returns boolean -- true if now liked, false if now unliked
language plpgsql
security definer
set search_path = public
as $$
declare
  already_liked boolean;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  select exists(
    select 1 from post_likes where post_id = p_post_id and user_id = auth.uid()
  ) into already_liked;

  if already_liked then
    delete from post_likes where post_id = p_post_id and user_id = auth.uid();
    update posts set likes_count = greatest(likes_count - 1, 0) where id = p_post_id;
    return false;
  else
    insert into post_likes (post_id, user_id) values (p_post_id, auth.uid());
    update posts set likes_count = likes_count + 1 where id = p_post_id;
    return true;
  end if;
end;
$$;

grant execute on function public.toggle_post_like(uuid) to authenticated;
