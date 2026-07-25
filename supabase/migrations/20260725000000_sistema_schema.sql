-- ══════════════════════════════════════════════════════════════════
--  SISTEMA — Schema completo (perfis, social, guildas) com RLS
--  reforçada. Aplicado no projeto wgeasyhcfwcdbvylfqqd em 2026-07-25.
-- ══════════════════════════════════════════════════════════════════

-- ── profiles ─────────────────────────────────────────────────────
create table public.profiles (
  id                 uuid references auth.users on delete cascade primary key,
  name               text        not null default 'Caçador',
  avatar             text,
  xp                 integer     not null default 0,
  level              integer     not null default 1,
  stats              jsonb       not null default '{"FOR":10,"VIT":10,"AGI":10,"INT":10,"PER":10,"RES":10}',
  stat_points        integer     not null default 0,
  streak             integer     not null default 0,
  last_active        text,
  gold               integer     not null default 0,
  titles             text[]      default array['Iniciante'],
  achievements       text[]      default array[]::text[],
  inventory_items    text[]      default array['badge_beginner'],
  quest_log          jsonb       default '{}',
  weekly_log         jsonb       default '{}',
  premium_gate_shown boolean     default false,
  is_premium         boolean     default false,
  premium_expires_at timestamptz,
  streak_shields     integer     default 1,
  shields_month      text,
  updated_at         timestamptz default now()
);

alter table public.profiles enable row level security;

-- Cada usuário só enxerga/edita a própria linha completa
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- View pública com colunas limitadas para ranking/busca/guildas
-- (security definer de propósito: expõe SÓ estas 5 colunas a autenticados)
create view public.public_profiles as
  select id, name, level, xp, streak from public.profiles;
revoke all on public.public_profiles from anon, authenticated;
grant select on public.public_profiles to authenticated;

-- Clientes não podem alterar campos de premium (só a Edge Function
-- com service role pode)
create or replace function public.protect_premium_columns()
returns trigger language plpgsql as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.is_premium := false;
      new.premium_expires_at := null;
    else
      new.is_premium := old.is_premium;
      new.premium_expires_at := old.premium_expires_at;
    end if;
  end if;
  return new;
end $$;

create trigger protect_premium
  before insert or update on public.profiles
  for each row execute procedure public.protect_premium_columns();

-- Limites de sanidade contra valores absurdos gravados via API
create or replace function public.clamp_profile_values()
returns trigger language plpgsql as $$
begin
  new.xp          := least(greatest(coalesce(new.xp, 0), 0), 10000000);
  new.gold        := least(greatest(coalesce(new.gold, 0), 0), 10000000);
  new.level       := least(greatest(coalesce(new.level, 1), 1), 250);
  new.streak      := least(greatest(coalesce(new.streak, 0), 0), 2000);
  new.stat_points := least(greatest(coalesce(new.stat_points, 0), 0), 10000);
  new.streak_shields := least(greatest(coalesce(new.streak_shields, 0), 0), 4);
  new.name        := left(coalesce(new.name, 'Caçador'), 24);
  return new;
end $$;

create trigger clamp_profile
  before insert or update on public.profiles
  for each row execute procedure public.clamp_profile_values();

-- Cria perfil automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── friendships ──────────────────────────────────────────────────
create table public.friendships (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  friend_id  uuid references auth.users(id) on delete cascade not null,
  status     text check (status in ('pending','accepted')) default 'pending',
  created_at timestamptz default now(),
  unique (user_id, friend_id),
  check (user_id <> friend_id)
);

-- Bloqueia o par invertido (A→B e B→A duplicados)
create unique index friendships_pair_uniq
  on public.friendships (least(user_id, friend_id), greatest(user_id, friend_id));

alter table public.friendships enable row level security;

create policy "friendships_select" on public.friendships
  for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "friendships_insert" on public.friendships
  for insert with check (auth.uid() = user_id);
create policy "friendships_update" on public.friendships
  for update using (auth.uid() = friend_id) with check (auth.uid() = friend_id);
create policy "friendships_delete" on public.friendships
  for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- No update, só o status pode mudar (impede forjar remetente/destinatário)
create or replace function public.friendship_update_guard()
returns trigger language plpgsql as $$
begin
  new.user_id   := old.user_id;
  new.friend_id := old.friend_id;
  new.created_at := old.created_at;
  return new;
end $$;

create trigger friendship_guard
  before update on public.friendships
  for each row execute procedure public.friendship_update_guard();

-- ── messages (chat entre amigos) ─────────────────────────────────
create table public.messages (
  id          uuid default gen_random_uuid() primary key,
  sender_id   uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  content     text not null check (char_length(content) <= 500),
  created_at  timestamptz default now()
);

alter table public.messages enable row level security;

create policy "messages_select" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "messages_insert" on public.messages
  for insert with check (auth.uid() = sender_id);
create policy "messages_delete_own" on public.messages
  for delete using (auth.uid() = sender_id);

-- ── guilds ───────────────────────────────────────────────────────
create table public.guilds (
  id          uuid default gen_random_uuid() primary key,
  name        text not null unique check (char_length(name) between 1 and 40),
  description text check (char_length(coalesce(description, '')) <= 120),
  owner_id    uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now()
);

alter table public.guilds enable row level security;

create policy "guilds_select" on public.guilds
  for select to authenticated using (true);
create policy "guilds_insert" on public.guilds
  for insert with check (auth.uid() = owner_id);
create policy "guilds_update" on public.guilds
  for update using (auth.uid() = owner_id);
create policy "guilds_delete" on public.guilds
  for delete using (auth.uid() = owner_id);

-- ── guild_members ────────────────────────────────────────────────
create table public.guild_members (
  id        uuid default gen_random_uuid() primary key,
  guild_id  uuid references public.guilds(id) on delete cascade not null,
  user_id   uuid references auth.users(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique (guild_id, user_id)
);

alter table public.guild_members enable row level security;

create policy "guild_members_select" on public.guild_members
  for select to authenticated using (true);
create policy "guild_members_insert" on public.guild_members
  for insert with check (auth.uid() = user_id);
create policy "guild_members_delete" on public.guild_members
  for delete using (auth.uid() = user_id);

-- Capacidade máxima de 20 membros e 1 guilda por usuário,
-- garantidos no servidor (o cliente não é confiável)
create or replace function public.enforce_guild_limits()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.guild_members where guild_id = new.guild_id) >= 20 then
    raise exception 'Guilda cheia (máx. 20 membros)';
  end if;
  if (select count(*) from public.guild_members where user_id = new.user_id) >= 1 then
    raise exception 'Você já está em uma guilda';
  end if;
  return new;
end $$;

create trigger guild_limits
  before insert on public.guild_members
  for each row execute procedure public.enforce_guild_limits();

-- ── guild_messages ───────────────────────────────────────────────
create table public.guild_messages (
  id         uuid default gen_random_uuid() primary key,
  guild_id   uuid references public.guilds(id) on delete cascade not null,
  sender_id  uuid references auth.users(id) on delete cascade not null,
  content    text not null check (char_length(content) <= 500),
  created_at timestamptz default now()
);

alter table public.guild_messages enable row level security;

create policy "guild_messages_select" on public.guild_messages
  for select using (
    exists (select 1 from public.guild_members
            where guild_id = guild_messages.guild_id and user_id = auth.uid())
  );
create policy "guild_messages_insert" on public.guild_messages
  for insert with check (
    auth.uid() = sender_id and
    exists (select 1 from public.guild_members
            where guild_id = guild_messages.guild_id and user_id = auth.uid())
  );

-- ── Realtime nos chats ───────────────────────────────────────────
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.guild_messages;
