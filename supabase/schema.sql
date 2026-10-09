-- Run this in the Supabase SQL Editor before deploying the app.
create table if not exists public.user_diagrams (
    id text primary key,
    owner_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    updated_at timestamptz not null default now(),
    diagram jsonb not null
);

alter table public.user_diagrams enable row level security;

create policy "Users can read their own diagrams"
    on public.user_diagrams for select using (auth.uid() = owner_id);
create policy "Users can create their own diagrams"
    on public.user_diagrams for insert with check (auth.uid() = owner_id);
create policy "Users can update their own diagrams"
    on public.user_diagrams for update
    using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Users can delete their own diagrams"
    on public.user_diagrams for delete using (auth.uid() = owner_id);
