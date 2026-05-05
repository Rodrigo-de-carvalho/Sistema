// ══════════════════════════════════════════════════════════════════
//  SISTEMA — Supabase Configuration
// ══════════════════════════════════════════════════════════════════
//
//  SETUP (faça isso antes de usar):
//  1. Crie um projeto em https://supabase.com
//  2. Vá em Project Settings → API e copie a URL e a anon key
//  3. Substitua os valores abaixo
//  4. No SQL Editor do Supabase, rode o script abaixo
//
// ── SQL PARA CRIAR A TABELA ──────────────────────────────────────
//
//  create table public.profiles (
//    id              uuid references auth.users on delete cascade primary key,
//    name            text        not null default 'Caçador',
//    avatar          text,
//    xp              integer     not null default 0,
//    level           integer     not null default 1,
//    stats           jsonb       not null default '{"FOR":10,"VIT":10,"AGI":10,"INT":10,"PER":10,"RES":10}',
//    stat_points     integer     not null default 0,
//    streak          integer     not null default 0,
//    last_active     text,
//    gold            integer     not null default 0,
//    titles          text[]      default array['Iniciante'],
//    achievements    text[]      default array[]::text[],
//    inventory_items text[]      default array['badge_beginner'],
//    quest_log       jsonb       default '{}',
//    premium_gate_shown boolean  default false,
//    updated_at      timestamptz default now()
//  );
//
//  alter table public.profiles enable row level security;
//
//  create policy "Usuários gerenciam próprio perfil"
//    on public.profiles for all
//    using  (auth.uid() = id)
//    with check (auth.uid() = id);
//
//  -- Cria perfil automaticamente ao registrar
//  create or replace function public.handle_new_user()
//  returns trigger language plpgsql security definer as $$
//  begin
//    insert into public.profiles (id) values (new.id);
//    return new;
//  end;
//  $$;
//
//  create trigger on_auth_user_created
//    after insert on auth.users
//    for each row execute procedure public.handle_new_user();
//
// ── SQL — SOCIAL / GUILDAS (rode após a tabela profiles) ─────────
//
//  -- Leituras públicas de perfis para ranking
//  create policy "Public profile reads"
//    on public.profiles for select to authenticated using (true);
//
//  -- friendships
//  create table public.friendships (
//    id         uuid default gen_random_uuid() primary key,
//    user_id    uuid references auth.users(id) on delete cascade,
//    friend_id  uuid references auth.users(id) on delete cascade,
//    status     text check (status in ('pending','accepted')) default 'pending',
//    created_at timestamptz default now(),
//    unique(user_id, friend_id)
//  );
//  alter table public.friendships enable row level security;
//  create policy "View own friendships"  on public.friendships for select using (auth.uid()=user_id or auth.uid()=friend_id);
//  create policy "Send requests"         on public.friendships for insert with check (auth.uid()=user_id);
//  create policy "Update received"       on public.friendships for update using (auth.uid()=friend_id);
//  create policy "Delete friendships"    on public.friendships for delete using (auth.uid()=user_id or auth.uid()=friend_id);
//
//  -- messages (chat entre amigos)
//  create table public.messages (
//    id          uuid default gen_random_uuid() primary key,
//    sender_id   uuid references auth.users(id) on delete cascade,
//    receiver_id uuid references auth.users(id) on delete cascade,
//    content     text not null check (char_length(content) <= 500),
//    created_at  timestamptz default now()
//  );
//  alter table public.messages enable row level security;
//  create policy "View own messages" on public.messages for select using (auth.uid()=sender_id or auth.uid()=receiver_id);
//  create policy "Send messages"     on public.messages for insert with check (auth.uid()=sender_id);
//
//  -- guilds
//  create table public.guilds (
//    id          uuid default gen_random_uuid() primary key,
//    name        text not null unique,
//    description text,
//    owner_id    uuid references auth.users(id) on delete set null,
//    created_at  timestamptz default now()
//  );
//  alter table public.guilds enable row level security;
//  create policy "View guilds"   on public.guilds for select using (true);
//  create policy "Create guild"  on public.guilds for insert with check (auth.uid()=owner_id);
//  create policy "Update guild"  on public.guilds for update using (auth.uid()=owner_id);
//  create policy "Delete guild"  on public.guilds for delete using (auth.uid()=owner_id);
//
//  -- guild_members
//  create table public.guild_members (
//    id        uuid default gen_random_uuid() primary key,
//    guild_id  uuid references public.guilds(id) on delete cascade,
//    user_id   uuid references auth.users(id) on delete cascade,
//    joined_at timestamptz default now(),
//    unique(guild_id, user_id)
//  );
//  alter table public.guild_members enable row level security;
//  create policy "View members" on public.guild_members for select using (true);
//  create policy "Join guild"   on public.guild_members for insert with check (auth.uid()=user_id);
//  create policy "Leave guild"  on public.guild_members for delete using (auth.uid()=user_id);
//
//  -- guild_messages
//  create table public.guild_messages (
//    id        uuid default gen_random_uuid() primary key,
//    guild_id  uuid references public.guilds(id) on delete cascade,
//    sender_id uuid references auth.users(id) on delete cascade,
//    content   text not null check (char_length(content) <= 500),
//    created_at timestamptz default now()
//  );
//  alter table public.guild_messages enable row level security;
//  create policy "View guild messages" on public.guild_messages for select using (
//    exists (select 1 from public.guild_members where guild_id=guild_messages.guild_id and user_id=auth.uid())
//  );
//  create policy "Send guild messages" on public.guild_messages for insert with check (
//    auth.uid()=sender_id and
//    exists (select 1 from public.guild_members where guild_id=guild_messages.guild_id and user_id=auth.uid())
//  );
//
//  -- Ativar Realtime nas tabelas de chat
//  alter publication supabase_realtime add table public.messages;
//  alter publication supabase_realtime add table public.guild_messages;
//
// ════════════════════════════════════════════════════════════════

const SUPABASE_URL      = 'https://pkewogelkjuvqvmhytwr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HGkPnjK6IUYFcr09QRSGvw_Kl9f17vw';

window.SUPABASE_OK = false;
window.sb = null;

try {
  if (SUPABASE_URL.includes('SEU_PROJETO') || SUPABASE_ANON_KEY.includes('SUA_CHAVE')) {
    console.warn('[SISTEMA] Supabase não configurado — rodando em modo offline.');
  } else {
    window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    window.SUPABASE_OK = true;
    console.info('[SISTEMA] Supabase conectado.');
  }
} catch (err) {
  console.error('[SISTEMA] Erro ao conectar ao Supabase:', err.message);
}
