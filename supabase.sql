-- Cria apenas a tabela contas_dados. Nada do que já existe no projeto é alterado.
create table if not exists public.contas_dados (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dados jsonb not null default '{}'::jsonb,
  atualizado timestamptz not null default now()
);

alter table public.contas_dados enable row level security;

create policy "contas_dados: ver os proprios dados" on public.contas_dados
  for select using ((select auth.uid()) = user_id);
create policy "contas_dados: criar os proprios dados" on public.contas_dados
  for insert with check ((select auth.uid()) = user_id);
create policy "contas_dados: atualizar os proprios dados" on public.contas_dados
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "contas_dados: apagar os proprios dados" on public.contas_dados
  for delete using ((select auth.uid()) = user_id);
