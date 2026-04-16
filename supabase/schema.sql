-- ============================================================
-- AXIS Fintech — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ── Profiles ─────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text,
  created_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Categories ───────────────────────────────────────────────
create table if not exists public.categories (
  id           text primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  name         text not null,
  key          text not null,
  color        text not null,
  budgeted     numeric default 0 not null,
  icon         text not null,
  auto_created boolean default false,
  created_at   timestamptz default now() not null
);

alter table public.categories enable row level security;

create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);


-- ── Transactions ─────────────────────────────────────────────
create table if not exists public.transactions (
  id          text primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  amount      numeric not null,
  category    text not null,
  description text not null,
  date        timestamptz not null,
  source      text check (source in ('manual', 'ai', 'webhook')) not null,
  status      text check (status in ('pending', 'confirmed', 'failed')) not null,
  created_at  timestamptz default now() not null
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);
