// Supabase Edge Function — Mercado Pago Checkout
// Deploy: supabase functions deploy mp-checkout
// Secrets: supabase secrets set MP_ACCESS_TOKEN=<seu_token>

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const url = new URL(req.url);

  try {
    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!accessToken) throw new Error("MP_ACCESS_TOKEN não configurado");

    // ── POST /mp-checkout → cria preferência ──────────────────────
    if (req.method === "POST" && url.pathname.endsWith("/mp-checkout")) {
      const { returnUrl } = await req.json();

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
          back_urls: {
            success: returnUrl,
            failure: returnUrl,
            pending: returnUrl,
          },
          auto_return: "approved",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Erro ${res.status} no Mercado Pago`);
      }

      const data = await res.json();
      return new Response(
        JSON.stringify({ checkout_url: data.init_point }),
        { headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    // ── GET /mp-checkout?payment_id=xxx → verifica pagamento ──────
    if (req.method === "GET") {
      const paymentId = url.searchParams.get("payment_id");
      if (!paymentId) throw new Error("payment_id obrigatório");

      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error(`Erro ${res.status} ao verificar pagamento`);

      const data = await res.json();
      return new Response(
        JSON.stringify({ status: data.status, approved: data.status === "approved" }),
        { headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    throw new Error("Método não suportado");

  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }
});
