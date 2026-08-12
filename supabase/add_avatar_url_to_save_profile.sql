-- The "avatar_url" column on profiles already existed in the original
-- schema, but save_own_profile never wrote to it (Edit Profile now uploads
-- a photo and needs to). Extends the RPC with an optional, defaulted
-- parameter — same safe "create or replace" pattern as
-- add_terms_acceptance.sql. Run once in Supabase Dashboard -> SQL Editor.
-- Safe to re-run.

create or replace function public.save_own_profile(
  p_id uuid,
  p_name text,
  p_role text,
  p_phone text,
  p_location text default null,
  p_district text default null,
  p_state text default null,
  p_has_whatsapp boolean default true,
  p_accepted_terms_and_policies timestamptz default null,
  p_avatar_url text default null
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
    has_whatsapp,
    accepted_terms_and_policies,
    avatar_url
  )
  values (
    p_id,
    coalesce(p_name, ''),
    case when p_role in ('farmer', 'owner') then p_role::user_role else 'farmer'::user_role end,
    p_phone,
    p_location,
    p_district,
    p_state,
    coalesce(p_has_whatsapp, true),
    p_accepted_terms_and_policies,
    p_avatar_url
  )
  on conflict (id) do update set
    name = excluded.name,
    role = excluded.role,
    phone = excluded.phone,
    location = excluded.location,
    district = excluded.district,
    state = excluded.state,
    has_whatsapp = excluded.has_whatsapp,
    accepted_terms_and_policies = coalesce(excluded.accepted_terms_and_policies, public.profiles.accepted_terms_and_policies),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
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
  boolean,
  timestamptz,
  text
) to authenticated;
