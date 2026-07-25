// ══════════════════════════════════════════════════════════════════
//  SISTEMA — Supabase Configuration
// ══════════════════════════════════════════════════════════════════
//
//  Projeto: "sistema" (wgeasyhcfwcdbvylfqqd · sa-east-1)
//  O schema completo do banco (tabelas, RLS, triggers) está em
//  supabase/migrations/20260725000000_sistema_schema.sql
//
//  A chave abaixo é a chave PUBLICÁVEL (publishable) — ela é feita para
//  ficar exposta no client-side. O que protege os dados é a RLS.
//
// ══════════════════════════════════════════════════════════════════

const SUPABASE_URL      = 'https://wgeasyhcfwcdbvylfqqd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable___w42ajYfwcKPGfrIjUcBA_WszbluLD';

// ── Premium ───────────────────────────────────────────────────────
const PREMIUM_PRICE = 15.00;  // R$ (o preço cobrado de fato vem do MP_PRICE na Edge Function)

window.SUPABASE_OK = false;
window.sb = null;

try {
  window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  window.SUPABASE_OK = true;
  console.info('[SISTEMA] Supabase conectado.');
} catch (err) {
  console.error('[SISTEMA] Erro ao conectar ao Supabase:', err.message);
}
