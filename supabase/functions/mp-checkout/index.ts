// Supabase Edge Function — Mercado Pago Checkout (fluxo seguro)
//
// Deploy:  supabase functions deploy mp-checkout --no-verify-jwt
//   (o JWT é validado manualmente por rota; o webhook do Mercado Pago
//    não envia JWT, por isso o verify automático fica desligado)
// Secrets: supabase secrets set MP_ACCESS_TOKEN=<token de produção do MP>
//
// Rotas:
//   POST ?webhook=1        → webhook do MP (valida consultando a API do MP)
//   POST                   → cria preferência de pagamento (exige usuário logado)
//   GET  ?payment_id=xxx   → verifica pagamento e ativa premium (exige usuário logado)
//
// A ativação do premium acontece SOMENTE aqui, com service role. O cliente
// nunca escreve is_premium — um trigger no banco bloqueia qualquer tentativa.

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

async function getAuthedUser(req: Request) {
  const auth  = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const user = await res.json();
  return user?.id ? user : null;
}

async function fetchPayment(paymentId: string, accessToken: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return await res.json();
}

async function activatePremium(userId: string): Promise<boolean> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      apikey:         SERVICE_KEY,
      Authorization:  `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer:         "return=minimal",
    },
    body: JSON.stringify({
      is_premium:         true,
      premium_expires_at: expiresAt,
      streak_shields:     4,
    }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const url = new URL(req.url);

  try {
    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!accessToken) throw new Error("MP_ACCESS_TOKEN não configurado");

    // ── Webhook do Mercado Pago ───────────────────────────────────
    // Sem JWT; a autenticidade é garantida buscando o pagamento na
    // própria API do MP com o nosso token.
    if (req.method === "POST" && url.searchParams.get("webhook") === "1") {
      let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");
      const topic   = url.searchParams.get("type") || url.searchParams.get("topic");
      try {
        const body = await req.json();
        paymentId = body?.data?.id?.toString() || paymentId;
      } catch { /* webhook pode vir sem body */ }

      if (paymentId && (!topic || topic === "payment")) {
        const payment = await fetchPayment(paymentId, accessToken);
        if (payment?.status === "approved" && payment.external_reference) {
          await activatePremium(payment.external_reference);
        }
      }
      // sempre 200 para o MP não repetir a notificação indefinidamente
      return json({ received: true });
    }

    // ── POST → cria preferência (exige usuário autenticado) ───────
    if (req.method === "POST") {
      const user = await getAuthedUser(req);
      if (!user) return json({ error: "Não autenticado. Faça login novamente." }, 401);

      const { returnUrl } = await req.json().catch(() => ({}));
      let backUrl: string;
      try {
        const u = new URL(returnUrl);
        if (!["https:", "http:"].includes(u.protocol) || u.username || u.password) throw new Error();
        backUrl = u.toString();
      } catch {
        return json({ error: "returnUrl inválida" }, 400);
      }

      const price = parseFloat(Deno.env.get("MP_PRICE") || "15.00");

      const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          items: [{
            id:          "sistema_premium_mensal",
            title:       "SISTEMA Premium — Assinatura Mensal",
            description: "Acesso a todas as funcionalidades Premium por 1 mês",
            quantity:    1,
            currency_id: "BRL",
            unit_price:  price,
          }],
          payer:              user.email ? { email: user.email } : undefined,
          external_reference: user.id,
          back_urls: {
            success: backUrl,
            failure: backUrl,
            pending: backUrl,
          },
          auto_return:      "approved",
          notification_url: `${SUPABASE_URL}/functions/v1/mp-checkout?webhook=1`,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Erro ${res.status} no Mercado Pago`);
      }

      const data = await res.json();
      return json({ checkout_url: data.init_point });
    }

    // ── GET ?payment_id=xxx → verifica e ativa (exige usuário) ────
    if (req.method === "GET") {
      const user = await getAuthedUser(req);
      if (!user) return json({ error: "Não autenticado. Faça login novamente." }, 401);

      const paymentId = url.searchParams.get("payment_id");
      if (!paymentId) return json({ error: "payment_id obrigatório" }, 400);

      const payment = await fetchPayment(paymentId, accessToken);
      if (!payment) return json({ error: "Pagamento não encontrado" }, 404);

      // o pagamento precisa ter sido criado para ESTE usuário
      if (payment.external_reference !== user.id) {
        return json({ error: "Pagamento não pertence a este usuário" }, 403);
      }

      const approved = payment.status === "approved";
      if (approved) {
        const ok = await activatePremium(user.id);
        if (!ok) return json({ error: "Falha ao ativar premium. Tente novamente." }, 500);
      }
      return json({ status: payment.status, approved });
    }

    return json({ error: "Método não suportado" }, 405);

  } catch (err) {
    return json({ error: (err as Error).message }, 400);
  }
});
