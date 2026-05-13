// ── premium.js — Modal de upgrade Premium + Mercado Pago ──────────

// ── Mercado Pago helpers (via Supabase Edge Function) ─────────────

const MP_EDGE_URL = 'https://pkewogelkjuvqvmhytwr.supabase.co/functions/v1/mp-checkout';

async function createMercadoPagoPreference(userEmail) {
  const response = await fetch(MP_EDGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email: userEmail }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || `Erro ${response.status} ao criar pagamento`);
  }
  return data.checkout_url || data.init_point;
}

async function activatePremiumInSupabase(userId) {
  if (!window.sb || !userId) return false;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await window.sb.from("profiles").update({
    is_premium:         true,
    premium_expires_at: expiresAt,
    streak_shields:     SHIELDS_PREMIUM,
  }).eq("id", userId);
  return !error;
}

// ── PremiumModal ──────────────────────────────────────────────────

function PremiumModal({ profile, questLog, userId, userEmail, onClose, onPremiumActivated, pendingPaymentId }) {
  const xpLost       = getPremiumXPLost(questLog);
  const monthXP      = getMonthXP(questLog);
  const isMobile     = useIsMobile();
  const [count,      setCount]      = React.useState(0);
  const [payState,   setPayState]   = React.useState('idle');  // idle | loading | verifying | success | error
  const [payError,   setPayError]   = React.useState('');

  // Animação do contador de XP perdido
  React.useEffect(() => {
    if (xpLost === 0) return;
    const step = Math.ceil(xpLost / 60);
    const iv   = setInterval(() => {
      setCount(c => { if (c + step >= xpLost) { clearInterval(iv); return xpLost; } return c + step; });
    }, 16);
    return () => clearInterval(iv);
  }, [xpLost]);

  // Ativar premium automaticamente ao abrir modal com pagamento aprovado
  React.useEffect(() => {
    if (!pendingPaymentId) return;
    handleActivatePremium();
  }, [pendingPaymentId]);

  const handleActivatePremium = async () => {
    setPayState('verifying');
    setPayError('');
    const activated = await activatePremiumInSupabase(userId);
    if (activated) {
      setPayState('success');
      onPremiumActivated?.();
    } else {
      setPayState('error');
      setPayError('Erro ao ativar premium. Recarregue a página ou contate o suporte.');
    }
  };

  const handleSubscribe = async (userEmail) => {
    console.log('[SISTEMA] handleSubscribe chamado', { userId, userEmail });
    if (!userId) {
      setPayError('Você precisa estar logado para assinar. Faça login e tente novamente.');
      return;
    }
    setPayState('loading');
    setPayError('');
    try {
      console.log('[SISTEMA] Chamando Edge Function MP...', MP_EDGE_URL);
      const checkoutUrl = await createMercadoPagoPreference(userEmail);
      console.log('[SISTEMA] checkout_url recebido:', checkoutUrl);
      if (!checkoutUrl) throw new Error('Edge Function não retornou checkout_url. Verifique se a função está deployada.');
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('[SISTEMA] Erro no pagamento:', err);
      setPayError(err.message);
      setPayState('error');
    }
  };

  const freeFeatures = [
    "Missões diárias (5 por dia)",
    "Streak básico",
    "1 proteção de streak por mês",
    "Conquistas Comuns e Raras",
    "Ranks E, D e C",
    "Radar de atributos",
  ];

  const premiumFeatures = [
    { text: "Missões semanais exclusivas (+3 por semana)", hot: true },
    { text: "25% mais XP em todas as tarefas",             hot: true },
    { text: "4 proteções de streak por mês",               hot: false },
    { text: "Conquistas Épicas e Lendárias",               hot: false },
    { text: "Ranks B, A e S desbloqueados",                hot: false },
    { text: 'Badge exclusivo "Caçador Premium"',           hot: false },
    { text: "Distribuição livre de pontos de atributo",    hot: false },
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:600,
      display:"flex", alignItems:"center", justifyContent:"center",
      backdropFilter:"blur(6px)", padding:"20px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div style={{ width:"100%", maxWidth:820, maxHeight:"90vh", overflow:"auto",
        background:"var(--bg-void)", border:"1px solid rgba(255,215,0,0.25)",
        borderRadius:10, animation:"auth-fade-in 0.35s ease",
        boxShadow:"0 0 80px rgba(255,215,0,0.08), 0 0 0 1px rgba(255,215,0,0.1)" }}>

        {/* ── Header ── */}
        <div style={{ position:"relative", padding: isMobile ? "20px 20px 16px" : "32px 36px 24px",
          overflow:"hidden",
          background:"linear-gradient(135deg,rgba(30,15,60,0.9),rgba(10,10,30,0.9))",
          borderBottom:"1px solid rgba(255,215,0,0.15)" }}>
          <div style={{ position:"absolute", inset:0, pointerEvents:"none",
            background:"linear-gradient(90deg,transparent 0%,rgba(255,215,0,0.04) 50%,transparent 100%)",
            backgroundSize:"200% 100%", animation:"premium-shimmer 3s linear infinite" }} />

          <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                <span style={{ fontSize:isMobile?22:28, animation:"streak-flame 2s ease infinite" }}>⚜</span>
                <div>
                  <div style={{ fontFamily:"var(--font-title)", fontSize:isMobile?16:22, fontWeight:900,
                    letterSpacing:3, color:"var(--gold-core)",
                    textShadow:"0 0 20px rgba(255,215,0,0.5)" }}>SISTEMA PREMIUM</div>
                  <div style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:2 }}>
                    DESBLOQUEIE TODO O POTENCIAL DO SISTEMA
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid var(--border-dim)",
              color:"var(--text-dim)", cursor:"pointer", padding:"6px 10px", borderRadius:4, flexShrink:0 }}>
              <Icon name="x" size={14} />
            </button>
          </div>

          {/* Contador de XP perdido */}
          {monthXP > 0 && (
            <div style={{ marginTop:20, background:"rgba(255,68,102,0.08)", border:"1px solid rgba(255,68,102,0.3)",
              borderRadius:8, padding: isMobile?"12px 14px":"16px 20px",
              display:"flex", alignItems:"center", gap: isMobile?12:20, flexWrap:"wrap" }}>
              <div style={{ fontSize:isMobile?24:32 }}>😔</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:2, marginBottom:4 }}>
                  XP PERDIDO ESTE MÊS POR NÃO SER PREMIUM
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                  <span style={{ fontFamily:"var(--font-title)", fontSize:isMobile?26:36, fontWeight:900,
                    color:"var(--red-core)", textShadow:"0 0 20px rgba(255,68,102,0.5)" }}>
                    {count.toLocaleString()}
                  </span>
                  <span style={{ color:"var(--red-core)", fontSize:16, fontFamily:"var(--font-title)" }}>XP</span>
                </div>
                <div style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-body)", marginTop:2 }}>
                  Com Premium, você teria recebido <strong style={{color:"var(--gold-core)"}}>+25%</strong> em cada tarefa completada
                </div>
              </div>
              {!isMobile && (
                <div style={{ textAlign:"center", flexShrink:0 }}>
                  <div style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)", letterSpacing:1, marginBottom:4 }}>SEU XP REAL</div>
                  <div style={{ fontFamily:"var(--font-title)", fontSize:20, fontWeight:700, color:"var(--text-mid)" }}>
                    {monthXP.toLocaleString()}
                  </div>
                  <div style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)", marginTop:2 }}>vs</div>
                  <div style={{ fontFamily:"var(--font-title)", fontSize:20, fontWeight:700, color:"var(--gold-core)" }}>
                    {Math.floor(monthXP * 1.25).toLocaleString()}
                  </div>
                  <div style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)", marginTop:2 }}>COM PREMIUM</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Comparação FREE vs PREMIUM ── */}
        <div style={{ display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap:0, padding: isMobile?"16px 20px":"24px 36px" }}>

          {/* Free */}
          <div style={{ paddingRight: isMobile?0:24,
            borderRight: isMobile?"none":"1px solid var(--border-dim)",
            borderBottom: isMobile?"1px solid var(--border-dim)":"none",
            paddingBottom: isMobile?16:0, marginBottom: isMobile?16:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <div style={{ background:"rgba(68,85,119,0.3)", border:"1px solid var(--border-dim)",
                color:"var(--text-dim)", fontSize:11, padding:"4px 14px", borderRadius:20,
                fontFamily:"var(--font-title)", letterSpacing:1 }}>GRATUITO</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {freeFeatures.map((f, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:16, height:16, borderRadius:3, flexShrink:0,
                    background:"rgba(68,85,119,0.3)", border:"1px solid var(--border-dim)",
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon name="check" size={9} color="var(--text-dim)" />
                  </div>
                  <span style={{ color:"var(--text-dim)", fontSize:12, fontFamily:"var(--font-body)" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium */}
          <div style={{ paddingLeft: isMobile?0:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <div style={{ background:"linear-gradient(90deg,rgba(255,215,0,0.2),rgba(255,102,221,0.15))",
                border:"1px solid rgba(255,215,0,0.4)", color:"var(--gold-core)",
                fontSize:11, padding:"4px 14px", borderRadius:20,
                fontFamily:"var(--font-title)", letterSpacing:1,
                boxShadow:"0 0 12px rgba(255,215,0,0.15)" }}>⚜ PREMIUM</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {premiumFeatures.map((f, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
                  background: f.hot?"rgba(255,215,0,0.04)":"transparent",
                  borderRadius:4, padding: f.hot?"6px 8px":"0",
                  border: f.hot?"1px solid rgba(255,215,0,0.12)":"none" }}>
                  <div style={{ width:16, height:16, borderRadius:3, flexShrink:0,
                    background:"rgba(255,215,0,0.15)", border:"1px solid rgba(255,215,0,0.4)",
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon name="check" size={9} color="var(--gold-core)" />
                  </div>
                  <span style={{ color: f.hot?"var(--text-bright)":"var(--text-mid)",
                    fontSize:12, fontFamily:"var(--font-body)", fontWeight: f.hot?600:400 }}>{f.text}</span>
                  {f.hot && <span style={{ fontSize:9, background:"rgba(255,215,0,0.2)",
                    color:"var(--gold-core)", padding:"1px 6px", borderRadius:2,
                    fontFamily:"var(--font-title)", letterSpacing:1, flexShrink:0 }}>NOVO</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Preview missões semanais ── */}
        <div style={{ margin: isMobile?"0 20px":"0 36px", padding:20,
          background:"rgba(155,93,229,0.04)",
          border:"1px solid rgba(155,93,229,0.2)", borderRadius:8, marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <Icon name="lock" size={14} color="var(--purple-glow)" />
            <span style={{ color:"var(--purple-glow)", fontSize:11, fontFamily:"var(--font-title)", letterSpacing:2 }}>
              MISSÕES SEMANAIS — EXCLUSIVO PREMIUM
            </span>
          </div>
          <div style={{ display:"grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
            gap:10 }}>
            {WEEKLY_QUESTS.map(q => (
              <div key={q.id} style={{ background:"rgba(10,10,26,0.8)",
                border:"1px solid rgba(155,93,229,0.2)",
                borderRadius:6, padding:14, filter:"blur(0.5px)", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", inset:0, backdropFilter:"blur(2px)",
                  background:"rgba(2,2,10,0.4)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon name="lock" size={20} color="rgba(155,93,229,0.5)" />
                </div>
                <div style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-title)",
                  fontWeight:600, marginBottom:4 }}>{q.title}</div>
                <div style={{ color:"var(--purple-glow)", fontSize:10, fontFamily:"var(--font-mono)" }}>
                  +{q.tasks.reduce((s,t)=>s+t.xp,0)+q.bonusXP} XP · +{q.gold} G
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA / Pagamento ── */}
        <div style={{ padding: isMobile?"0 20px 24px":"0 36px 32px",
          display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>

          {/* Estado: sucesso */}
          {payState === 'success' && (
            <div style={{ width:"100%", maxWidth:400, padding:"20px 24px", borderRadius:8,
              background:"rgba(0,255,136,0.08)", border:"1px solid rgba(0,255,136,0.4)",
              textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>🎉</div>
              <div style={{ fontFamily:"var(--font-title)", fontSize:16, color:"var(--green-core)",
                letterSpacing:2, marginBottom:8 }}>PREMIUM ATIVADO!</div>
              <div style={{ color:"var(--text-mid)", fontSize:12, fontFamily:"var(--font-body)", marginBottom:16 }}>
                Bem-vindo ao SISTEMA Premium. Todas as funcionalidades foram desbloqueadas.
              </div>
              <button onClick={onClose} style={{ background:"var(--green-core)", border:"none",
                color:"#000", fontFamily:"var(--font-title)", fontSize:12, letterSpacing:2,
                padding:"10px 24px", borderRadius:4, cursor:"pointer", fontWeight:700 }}>
                COMEÇAR AGORA
              </button>
            </div>
          )}

          {/* Estado: verificando pagamento */}
          {payState === 'verifying' && (
            <div style={{ width:"100%", maxWidth:400, padding:"20px 24px", borderRadius:8,
              background:"rgba(255,215,0,0.06)", border:"1px solid rgba(255,215,0,0.3)",
              textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:10, animation:"spin-slow 1.5s linear infinite",
                display:"inline-block" }}>⚙</div>
              <div style={{ fontFamily:"var(--font-title)", fontSize:13, color:"var(--gold-core)",
                letterSpacing:2, marginBottom:6 }}>VERIFICANDO PAGAMENTO...</div>
              <div style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-mono)" }}>
                Confirmando pagamento com o Mercado Pago
              </div>
            </div>
          )}

          {/* Estado: carregando */}
          {payState === 'loading' && (
            <div style={{ width:"100%", maxWidth:400, padding:"16px 24px", borderRadius:8,
              background:"rgba(255,215,0,0.06)", border:"1px solid rgba(255,215,0,0.3)",
              textAlign:"center" }}>
              <div style={{ fontFamily:"var(--font-title)", fontSize:13, color:"var(--gold-core)", letterSpacing:2 }}>
                REDIRECIONANDO PARA O PAGAMENTO...
              </div>
              <div style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-mono)", marginTop:6 }}>
                Você será redirecionado ao Mercado Pago
              </div>
            </div>
          )}

          {/* Estado: idle ou erro — mostra botão */}
          {(payState === 'idle' || payState === 'error') && (
            <>
              {/* Preço */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontFamily:"var(--font-title)", fontSize:28, fontWeight:900,
                  color:"var(--gold-core)", textShadow:"0 0 16px rgba(255,215,0,0.4)" }}>
                  R$ {PREMIUM_PRICE.toFixed(2).replace('.', ',')}
                </span>
                <span style={{ color:"var(--text-dim)", fontSize:12, fontFamily:"var(--font-mono)" }}>/mês</span>
              </div>

              <button
                onClick={() => handleSubscribe(userEmail)}
                disabled={payState === 'loading'}
                style={{ width:"100%", maxWidth:400, padding:"14px 0", borderRadius:6,
                  background:"linear-gradient(90deg,rgba(255,215,0,0.2),rgba(155,93,229,0.2),rgba(255,215,0,0.2))",
                  backgroundSize:"200% 100%", animation:"premium-shimmer 3s linear infinite",
                  border:"1px solid rgba(255,215,0,0.5)", color:"var(--gold-core)",
                  fontFamily:"var(--font-title)", fontSize:14, letterSpacing:3, cursor:"pointer",
                  boxShadow:"0 0 20px rgba(255,215,0,0.15)",
                  opacity: payState === 'loading' ? 0.6 : 1 }}>
                ⚜ ASSINAR POR R$ {PREMIUM_PRICE.toFixed(2).replace('.', ',')}/MÊS
              </button>

              {payError && (
                <div style={{ width:"100%", maxWidth:400, padding:"10px 14px", borderRadius:4,
                  background:"rgba(255,68,102,0.08)", border:"1px solid rgba(255,68,102,0.3)",
                  color:"var(--red-core)", fontSize:11, fontFamily:"var(--font-mono)",
                  textAlign:"center" }}>
                  {payError}
                </div>
              )}

              <div style={{ display:"flex", alignItems:"center", gap:8, opacity:0.7 }}>
                <span style={{ fontSize:14 }}>🔒</span>
                <span style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)" }}>
                  Pagamento seguro via Mercado Pago
                </span>
              </div>
            </>
          )}

          <button onClick={onClose} style={{ background:"none", border:"none",
            color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-mono)",
            cursor:"pointer", textDecoration:"underline", marginTop:4 }}>
            {payState === 'success' ? "Fechar" : "Continuar no plano gratuito"}
          </button>
        </div>
      </div>
    </div>
  );
}
