-- ═══════════════════════════════════════════════════════
-- GUIA DO SONO — Schema Supabase
-- Execute no SQL Editor do painel Supabase
-- ═══════════════════════════════════════════════════════

-- ── EXTENSÃO ──
create extension if not exists "uuid-ossp";

-- ══════════════════════════════════════
-- TABELA: baby_profiles
-- Um perfil de bebê por usuária
-- ══════════════════════════════════════
create table if not exists public.baby_profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  baby_name   text,
  age_range   text,   -- '0-3', '4-6', '7-12', '1-2', '2-5'
  weight      text,   -- '<3kg', '3-5kg', etc.
  routine     text,   -- 'good', 'ok', 'bad', 'crisis', 'exhausted'
  problem     text,   -- 'no-sleep', 'wakeups', etc.
  plan        text default 'free', -- 'free', 'plus', 'premium'
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ══════════════════════════════════════
-- TABELA: sleep_logs
-- Registros de sono (sonecas + noturno)
-- ══════════════════════════════════════
create table if not exists public.sleep_logs (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  type         text not null check (type in ('nap', 'night')),
  start_at     timestamptz not null,
  end_at       timestamptz,
  duration_min integer,
  wakeups      integer default 0,
  notes        text,
  created_at   timestamptz default now()
);

create index if not exists sleep_logs_user_date
  on public.sleep_logs (user_id, start_at desc);

-- ══════════════════════════════════════
-- TABELA: chat_history
-- Histórico de conversas com a Guia IA
-- ══════════════════════════════════════
create table if not exists public.chat_history (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz default now()
);

create index if not exists chat_history_user_date
  on public.chat_history (user_id, created_at desc);

-- ══════════════════════════════════════
-- TABELA: ritual_logs
-- Checklist do Ritual de Ouro por dia
-- ══════════════════════════════════════
create table if not exists public.ritual_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  date       date not null,
  items_done text[] default '{}',  -- ['bath', 'low_light', 'white_noise', ...]
  completed  boolean default false,
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- ══════════════════════════════════════
-- ROW LEVEL SECURITY
-- Cada usuária só vê seus próprios dados
-- ══════════════════════════════════════
alter table public.baby_profiles  enable row level security;
alter table public.sleep_logs     enable row level security;
alter table public.chat_history   enable row level security;
alter table public.ritual_logs    enable row level security;

-- Políticas: usuária lê e escreve apenas seus próprios registros
create policy "Próprios dados — baby_profiles"
  on public.baby_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Próprios dados — sleep_logs"
  on public.sleep_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Próprios dados — chat_history"
  on public.chat_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Próprios dados — ritual_logs"
  on public.ritual_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ══════════════════════════════════════
-- FUNÇÃO: atualizar updated_at automaticamente
-- ══════════════════════════════════════
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_baby_profiles_updated
  before update on public.baby_profiles
  for each row execute procedure public.handle_updated_at();

-- ══════════════════════════════════════
-- FUNÇÃO: criar perfil ao cadastrar
-- Triggered automaticamente pelo Supabase Auth
-- ══════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.baby_profiles (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
