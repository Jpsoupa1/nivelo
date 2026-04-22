-- ── Financial Goals ──────────────────────────────────────────
-- Run this in Supabase SQL Editor after schema.sql

create table if not exists public.goals (
  id             text primary key,
  user_id        uuid references public.profiles(id) on delete cascade not null,
  name           text not null,
  target_amount  numeric not null,
  saved_amount   numeric default 0 not null,
  deadline       date,
  color          text default '#58A6FF' not null,
  icon           text default 'Target' not null,
  created_at     timestamptz default now() not null
);

alter table public.goals enable row level security;

create policy "Users can view own goals"
  on public.goals for select using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete using (auth.uid() = user_id);
