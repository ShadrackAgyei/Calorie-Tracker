-- ─────────────────────────────────────────────────────────────────────────────
-- Foods table  (publicly readable, only service-role can write)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.foods (
  id                  text primary key,          -- e.g. 'banku', 'jollof_rice'
  name                text not null,
  name_local          text,
  calories_per_100g   numeric(7,2) not null,
  protein_per_100g    numeric(7,2) not null,
  carbs_per_100g      numeric(7,2) not null,
  fat_per_100g        numeric(7,2) not null,
  fiber_per_100g      numeric(7,2),
  typical_serving_g   integer not null,
  category            text not null,
  source              text not null check (source in ('wafct','recipe','ai','user')),
  created_at          timestamptz default now()
);

alter table public.foods enable row level security;

-- Everyone can read foods
create policy "foods_read_all" on public.foods
  for select using (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- Profiles table
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  name                text,
  email               text,
  weight_kg           numeric(5,2),
  height_cm           numeric(5,2),
  age                 integer,
  daily_calorie_goal  integer not null default 2200,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

-- Auto-create profile row on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────────
-- Meal logs table
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.meal_logs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  logged_at           date not null,
  meal_type           text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  items               jsonb not null default '[]',   -- LoggedItem[]
  photo_url           text,
  total_calories      numeric(7,2) not null default 0,
  total_protein_g     numeric(7,2) not null default 0,
  total_carbs_g       numeric(7,2) not null default 0,
  total_fat_g         numeric(7,2) not null default 0,
  created_at          timestamptz default now()
);

alter table public.meal_logs enable row level security;

create policy "meal_logs_own" on public.meal_logs
  for all using (auth.uid() = user_id);

create index if not exists meal_logs_user_date
  on public.meal_logs (user_id, logged_at desc);
