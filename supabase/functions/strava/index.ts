// Supabase Edge Function — Integração Strava (verificação de corridas)
//
// Deploy:  supabase functions deploy strava --no-verify-jwt
//   (JWT do usuário é validado manualmente; a rota "config" é pública)
// Secrets: supabase secrets set STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=yyy
//
// Rotas (todas exigem usuário logado, exceto config):
//   GET  ?action=config            → { client_id }  (público, para montar o link OAuth)
//   POST ?action=exchange {code}   → troca o code por tokens e salva a conexão
//   GET  ?action=status            → { connected }
//   GET  ?action=today&since=EPOCH → { km, count } corridas/caminhadas desde `since`
//
// Os tokens do Strava ficam SÓ no servidor (tabela strava_connections,
// sem policies RLS — acessível apenas com service role).

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY     = Deno.env.get("SUPABASE_ANON_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

const svcHeaders = {
  apikey:         SERVICE_KEY,
  Authorization:  `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function getAuthedUser(req: Request) {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const user = await res.json();
  return user?.id ? user : null;
}

async function getConn(userId: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/strava_connections?user_id=eq.${userId}&select=*`,
    { headers: svcHeaders },
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] || null;
}

async function saveConn(row: Record<string, unknown>) {
  await fetch(`${SUPABASE_URL}/rest/v1/strava_connections`, {
    method:  "POST",
    headers: { ...svcHeaders, Prefer: "resolution=merge-duplicates,return=minimal" },
    body:    JSON.stringify(row),
  });
}

async function freshAccessToken(conn: any, clientId: string, clientSecret: string) {
  if (conn.expires_at * 1000 > Date.now() + 60_000) return conn.access_token;
  const res = await fetch("https://www.strava.com/oauth/token", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id:     clientId,
      client_secret: clientSecret,
      grant_type:    "refresh_token",
      refresh_token: conn.refresh_token,
    }),
  });
  if (!res.ok) throw new Error("Falha ao renovar o token do Strava. Reconecte sua conta.");
  const d = await res.json();
  await saveConn({
    user_id:       conn.user_id,
    athlete_id:    conn.athlete_id,
    access_token:  d.access_token,
    refresh_token: d.refresh_token,
    expires_at:    d.expires_at,
  });
  return d.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const url    = new URL(req.url);
  const action = url.searchParams.get("action") || "";

  try {
    const clientId     = Deno.env.get("STRAVA_CLIENT_ID") || "";
    const clientSecret = Deno.env.get("STRAVA_CLIENT_SECRET") || "";

    // ── config: público (client_id não é segredo) ─────────────────
    if (action === "config") {
      return json({ client_id: clientId || null });
    }

    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Não autenticado. Faça login novamente." }, 401);

    if (!clientId || !clientSecret) {
      return json({ error: "Strava não configurado no servidor (defina STRAVA_CLIENT_ID e STRAVA_CLIENT_SECRET)." }, 500);
    }

    // ── exchange: troca o code do OAuth por tokens ────────────────
    if (action === "exchange" && req.method === "POST") {
      const { code } = await req.json().catch(() => ({}));
      if (!code) return json({ error: "code obrigatório" }, 400);

      const res = await fetch("https://www.strava.com/oauth/token", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id:     clientId,
          client_secret: clientSecret,
          grant_type:    "authorization_code",
          code,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return json({ error: err.message || "Strava recusou a autorização. Tente conectar de novo." }, 400);
      }
      const d = await res.json();
      await saveConn({
        user_id:       user.id,
        athlete_id:    d.athlete?.id || null,
        access_token:  d.access_token,
        refresh_token: d.refresh_token,
        expires_at:    d.expires_at,
      });
      return json({ connected: true, athlete: d.athlete?.firstname || null });
    }

    // ── status ────────────────────────────────────────────────────
    if (action === "status") {
      const conn = await getConn(user.id);
      return json({ connected: !!conn });
    }

    // ── today: soma km de corrida/caminhada desde `since` ─────────
    if (action === "today") {
      const conn = await getConn(user.id);
      if (!conn) return json({ error: "Strava não conectado." }, 400);

      const since = parseInt(url.searchParams.get("since") || "0", 10) ||
                    Math.floor(Date.now() / 1000) - 86400;

      const token = await freshAccessToken(conn, clientId, clientSecret);
      const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?after=${since}&per_page=100`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) return json({ error: `Erro ${res.status} ao buscar atividades no Strava.` }, 502);

      const acts  = await res.json();
      const valid = ["Run", "TrailRun", "VirtualRun", "Walk", "Hike"];
      const dist  = (Array.isArray(acts) ? acts : [])
        .filter((a: any) => valid.includes(a.type) || valid.includes(a.sport_type))
        .reduce((s: number, a: any) => s + (a.distance || 0), 0);

      return json({ km: Math.round((dist / 1000) * 100) / 100, count: acts.length || 0 });
    }

    return json({ error: "Ação não suportada" }, 400);

  } catch (err) {
    return json({ error: (err as Error).message }, 400);
  }
});
