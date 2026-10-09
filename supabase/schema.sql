-- Run this in the Supabase SQL Editor before deploying the app.
create table if not exists public.user_diagrams (
    id text primary key,
    owner_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    updated_at timestamptz not null default now(),
    diagram jsonb not null,
    is_shared boolean not null default false
);

alter table public.user_diagrams
    add column if not exists is_shared boolean not null default false;

alter table public.user_diagrams enable row level security;

drop policy if exists "Users can read their own diagrams" on public.user_diagrams;
drop policy if exists "Users can create their own diagrams" on public.user_diagrams;
drop policy if exists "Users can update their own diagrams" on public.user_diagrams;
drop policy if exists "Users can delete their own diagrams" on public.user_diagrams;

create policy "Users can read their own diagrams"
    on public.user_diagrams for select using (auth.uid() = owner_id or is_shared);
create policy "Users can create their own diagrams"
    on public.user_diagrams for insert with check (auth.uid() = owner_id);
create policy "Users can update their own diagrams"
    on public.user_diagrams for update
    using (auth.uid() = owner_id or is_shared)
    with check (auth.uid() = owner_id or is_shared);
create policy "Users can delete their own diagrams"
    on public.user_diagrams for delete using (auth.uid() = owner_id);

-- Supabase Realtime must be enabled for this table to deliver live diagram updates.
do $$ begin
    alter publication supabase_realtime add table public.user_diagrams;
exception when duplicate_object then null;
end $$;
