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
// ════════════════════════════════════════════════════════════════

const SUPABASE_URL      = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANONIMA_AQUI';

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
