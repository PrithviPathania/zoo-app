-- =============================================================================
-- supabase/schema.sql — Database schema for the Calgary Zoo Explorer.
-- Author: Ricky Mormor | Date: 2026-08-10
--
-- Defines the two tables that back the web application and the security rules that
-- govern them. Input is an empty Supabase Postgres database; processing creates the
-- animals table holding one row per zoo resident, the profiles table linking each
-- authenticated user to a role and a favourite animal, a trigger that provisions a
-- profile the moment somebody signs up, and the Row Level Security policies that
-- decide who may read and write; output is a database where anyone may browse the
-- animals but only administrators may change them.
--
-- Run this whole file once in the Supabase dashboard -> SQL Editor -> New query.
-- It is written to be re-runnable: existing objects are dropped first.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Section 1: Tables
-- -----------------------------------------------------------------------------

-- The habitat CHECK constraint deliberately mirrors the Habitat union type in
-- lib/validation.ts so the database and the TypeScript types cannot drift apart.
create table if not exists public.animals (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  species             text not null,
  habitat             text not null check (habitat in
                        ('Canadian Wilds', 'Penguin Plunge', 'Destination Africa', 'Eurasia')),
  diet                text not null,
  conservation_status text not null,
  image_url           text not null,
  description         text not null,
  created_at          timestamptz not null default now()
);

-- One row per authenticated user. Deleting the auth user removes the profile.
-- Deleting an animal that somebody favourited nulls the reference rather than
-- blocking the delete.
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  role                text not null default 'user' check (role in ('user', 'admin')),
  favourite_animal_id uuid references public.animals(id) on delete set null,
  created_at          timestamptz not null default now()
);


-- -----------------------------------------------------------------------------
-- Section 2: Provision a profile automatically on sign-up
--
-- Without this trigger a brand new user has no profiles row, so every role lookup
-- returns nothing and they cannot save a favourite animal.
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill anyone who signed up before this trigger existed.
insert into public.profiles (id)
  select id from auth.users
  on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- Section 3: Admin helper
--
-- SECURITY DEFINER is required. A policy on public.profiles that queried
-- public.profiles directly would recurse; running as the definer bypasses RLS
-- for this one lookup and breaks the cycle.
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;


-- -----------------------------------------------------------------------------
-- Section 4: Row Level Security
--
-- RLS is the real enforcement layer. The API route handlers also check the
-- caller's role so they can return a clean 403, but even if that check were
-- removed these policies would still refuse the write.
-- -----------------------------------------------------------------------------

alter table public.animals  enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "animals readable by everyone" on public.animals;
drop policy if exists "only admins insert animals"   on public.animals;
drop policy if exists "only admins update animals"   on public.animals;
drop policy if exists "only admins delete animals"   on public.animals;
drop policy if exists "users read own profile"       on public.profiles;
drop policy if exists "users update own profile"     on public.profiles;

-- The gallery is public, so reads are open to anonymous visitors.
create policy "animals readable by everyone"
  on public.animals for select
  using (true);

create policy "only admins insert animals"
  on public.animals for insert to authenticated
  with check ((select public.is_admin()));

create policy "only admins update animals"
  on public.animals for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "only admins delete animals"
  on public.animals for delete to authenticated
  using ((select public.is_admin()));

-- A user may only ever see and change their own profile row.
create policy "users read own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "users update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);


-- -----------------------------------------------------------------------------
-- Section 5: Close the privilege-escalation hole
--
-- IMPORTANT. The "users update own profile" policy above lets a user modify their
-- own row, which would include setting role = 'admin' on themselves. RLS policies
-- cannot restrict individual columns, so column-level grants are used instead.
-- Supabase grants the authenticated role full table access by default, so the
-- blanket grant must be revoked before the narrow one is issued.
-- -----------------------------------------------------------------------------

revoke update on public.profiles from authenticated;
grant  update (favourite_animal_id) on public.profiles to authenticated;


-- -----------------------------------------------------------------------------
-- Section 6: Seed data
--
-- The six original animals, carried over verbatim from the static lib/animals.ts
-- array so the gallery looks identical after the switch to the database.
-- -----------------------------------------------------------------------------

insert into public.animals (name, species, habitat, diet, conservation_status, image_url, description)
select * from (values
  ('Skoki', 'Grizzly Bear', 'Canadian Wilds', 'Omnivore', 'Special Concern',
   'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800',
   'Skoki lives in the Canadian Wilds habitat at Calgary Zoo, representing native Canadian wildlife.'),
  ('Sven', 'King Penguin', 'Penguin Plunge', 'Carnivore (Fish)', 'Least Concern',
   'https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=800',
   'Sven is a King Penguin at the Penguin Plunge exhibit, thriving in climate-controlled polar pools.'),
  ('Amba', 'Amur Tiger', 'Eurasia', 'Carnivore', 'Endangered',
   'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800',
   'Amba is an Amur Tiger in the Eurasia section, part of global endangered species conservation initiatives.'),
  ('Lodo', 'Hippopotamus', 'Destination Africa', 'Herbivore', 'Vulnerable',
   'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800',
   'Lodo enjoys the spacious aquatic pools in the Destination Africa habitat.'),
  ('Darian', 'African Lion', 'Destination Africa', 'Carnivore', 'Vulnerable',
   'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=800',
   'Darian is the pride leader at the Calgary Zoo African savanna exhibit.'),
  ('Kazi', 'Red Panda', 'Eurasia', 'Herbivore (Bamboo)', 'Endangered',
   'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800',
   'Kazi loves climbing trees in the forested Eurasia outdoor habitat.')
) as seed(name, species, habitat, diet, conservation_status, image_url, description)
where not exists (select 1 from public.animals);


-- -----------------------------------------------------------------------------
-- Section 7: Promote an administrator  (RUN THIS PART MANUALLY)
--
-- Sign in to the app once first so your auth.users row exists, then run the
-- SELECT to find your id and the UPDATE to grant yourself the admin role.
-- Leave your teammates as 'user' so the access levels can be demonstrated.
-- -----------------------------------------------------------------------------

-- select u.id, u.email, p.role
--   from auth.users u
--   join public.profiles p on p.id = u.id;

-- update public.profiles set role = 'admin' where id = '<paste-your-uuid-here>';
