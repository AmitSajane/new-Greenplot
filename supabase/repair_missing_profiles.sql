-- Repair old Supabase Auth users that do not have a public.profiles row.
-- Run this once in Supabase Dashboard -> SQL Editor.

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

update public.profiles p
set
  name = coalesce(nullif(p.name, ''), nullif(u.raw_user_meta_data->>'name', ''), nullif(u.raw_user_meta_data->>'full_name', ''), ''),
  phone = coalesce(p.phone, u.phone, nullif(u.raw_user_meta_data->>'phone', ''), regexp_replace(coalesce(u.email, ''), '@greenplot\.app$', '')),
  role = case
    when u.raw_user_meta_data->>'role' in ('farmer', 'owner')
      then (u.raw_user_meta_data->>'role')::user_role
    else p.role
  end,
  location = coalesce(p.location, nullif(u.raw_user_meta_data->>'location', '')),
  district = coalesce(p.district, nullif(u.raw_user_meta_data->>'district', '')),
  state = coalesce(p.state, nullif(u.raw_user_meta_data->>'state', '')),
  has_whatsapp = coalesce(p.has_whatsapp, (u.raw_user_meta_data->>'has_whatsapp')::boolean, true)
from auth.users u
where p.id = u.id;

drop policy if exists "profiles insert" on public.profiles;
create policy "profiles insert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles update" on public.profiles;
create policy "profiles update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

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

-- Uncomment to physically drop the now-unused email column (irreversible, deletes existing data):
-- alter table public.profiles drop column if exists email;
