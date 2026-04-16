-- ── Recurring Transactions ───────────────────────────────────
-- Run this in Supabase SQL Editor after schema.sql

create table if not exists public.recurring_transactions (
  id           text primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  amount       numeric not null,           -- signed: negative = expense
  category     text not null,
  description  text not null,
  day_of_month int check (day_of_month between 1 and 28) not null,
  active       boolean default true not null,
  created_at   timestamptz default now() not null
);

alter table public.recurring_transactions enable row level security;

create policy "Users can view own recurring"
  on public.recurring_transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own recurring"
  on public.recurring_transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recurring"
  on public.recurring_transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own recurring"
  on public.recurring_transactions for delete
  using (auth.uid() = user_id);
