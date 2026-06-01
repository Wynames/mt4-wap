-- file: supabase-schema.sql
-- Run this in the Supabase SQL Editor

-- Create the public users table that mirrors auth.users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'owner')),
  daily_build_count integer not null default 0,
  last_build_date date not null default current_date
);

-- Create the projects table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  app_name text not null,
  target_url text not null,
  package_name text not null,
  status text not null default 'waiting' check (status in ('waiting', 'processing', 'completed', 'failed')),
  config jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.projects enable row level security;

-- Policies for users table
create policy "Users can read own profile"
  on public.users for select
  using ( auth.uid() = id );

create policy "Owners can read all profiles"
  on public.users for select
  using ( exists ( select 1 from public.users where id = auth.uid() and role = 'owner' ) );

-- Policies for projects table
create policy "Users can select own projects"
  on public.projects for select
  using ( auth.uid() = user_id );

create policy "Users can insert own projects"
  on public.projects for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own projects"
  on public.projects for update
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

create policy "Owners can manage all projects"
  on public.projects for all
  using ( exists ( select 1 from public.users where id = auth.uid() and role = 'owner' ) );

-- Trigger function to auto‑create a public user row on sign‑up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger to auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
