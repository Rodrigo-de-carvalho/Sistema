// ── premium.js — Modal de upgrade Premium ────────────────────────

function PremiumModal({ profile, questLog, onClose }) {
  const xpLost       = getPremiumXPLost(questLog);
  const monthXP      = getMonthXP(questLog);
  const [count, setCount] = React.useState(0);

  // Animação do contador de XP perdido
  React.useEffect(() => {
    if (xpLost === 0) return;
    const step     = Math.ceil(xpLost / 60);
    const interval = setInterval(() => {
      setCount(c => { if (c + step >= xpLost) { clearInterval(interval); return xpLost; } return c + step; });
    }, 16);
    return () => clearInterval(interval);
  }, [xpLost]);

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
    { text: "Missões de desafio com recompensas únicas",   hot: false },
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
        <div style={{ position:"relative", padding:"32px 36px 24px", overflow:"hidden",
          background:"linear-gradient(135deg,rgba(30,15,60,0.9),rgba(10,10,30,0.9))",
          borderBottom:"1px solid rgba(255,215,0,0.15)" }}>
          {/* Shimmer */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none",
            background:"linear-gradient(90deg,transparent 0%,rgba(255,215,0,0.04) 50%,transparent 100%)",
            backgroundSize:"200% 100%", animation:"premium-shimmer 3s linear infinite" }} />

          <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                <span style={{ fontSize:28, animation:"streak-flame 2s ease infinite" }}>⚜</span>
                <div>
                  <div style={{ fontFamily:"var(--font-title)", fontSize:22, fontWeight:900,
                    letterSpacing:3, color:"var(--gold-core)",
                    textShadow:"0 0 20px rgba(255,215,0,0.5)" }}>SISTEMA PREMIUM</div>
                  <div style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:2 }}>
                    DESBLOQUEIE TODO O POTENCIAL DO SISTEMA
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid var(--border-dim)",
              color:"var(--text-dim)", cursor:"pointer", padding:"6px 10px", borderRadius:4 }}>
              <Icon name="x" size={14} />
            </button>
          </div>

          {/* ── Contador de XP perdido ── */}
          {monthXP > 0 && (
            <div style={{ marginTop:20, background:"rgba(255,68,102,0.08)", border:"1px solid rgba(255,68,102,0.3)",
              borderRadius:8, padding:"16px 20px", display:"flex", alignItems:"center", gap:20 }}>
              <div style={{ fontSize:32 }}>😔</div>
              <div style={{ flex:1 }}>
                <div style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:2, marginBottom:4 }}>
                  XP PERDIDO ESTE MÊS POR NÃO SER PREMIUM
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                  <span style={{ fontFamily:"var(--font-title)", fontSize:36, fontWeight:900,
                    color:"var(--red-core)", textShadow:"0 0 20px rgba(255,68,102,0.5)" }}>
                    {count.toLocaleString()}
                  </span>
                  <span style={{ color:"var(--red-core)", fontSize:16, fontFamily:"var(--font-title)" }}>XP</span>
                </div>
                <div style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-body)", marginTop:2 }}>
                  Com Premium, você teria recebido <strong style={{color:"var(--gold-core)"}}>+25%</strong> em cada tarefa completada
                </div>
              </div>
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
            </div>
          )}
        </div>

        {/* ── Comparação ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, padding:"24px 36px" }}>

          {/* Free */}
          <div style={{ paddingRight:24, borderRight:"1px solid var(--border-dim)" }}>
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
          <div style={{ paddingLeft:24 }}>
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
        <div style={{ margin:"0 36px", padding:20, background:"rgba(155,93,229,0.04)",
          border:"1px solid rgba(155,93,229,0.2)", borderRadius:8, marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <Icon name="lock" size={14} color="var(--purple-glow)" />
            <span style={{ color:"var(--purple-glow)", fontSize:11, fontFamily:"var(--font-title)", letterSpacing:2 }}>
              MISSÕES SEMANAIS — EXCLUSIVO PREMIUM
            </span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {WEEKLY_QUESTS.map(q => (
              <div key={q.id} style={{ background:"rgba(10,10,26,0.8)", border:"1px solid rgba(155,93,229,0.2)",
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

        {/* ── Badge Premium preview ── */}
        <div style={{ margin:"0 36px 24px", display:"flex", alignItems:"center", gap:20,
          padding:20, background:"rgba(255,102,221,0.04)", border:"1px solid rgba(255,102,221,0.2)", borderRadius:8 }}>
          <div style={{ width:60, height:60, borderRadius:8, flexShrink:0,
            background:"linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,102,221,0.2))",
            border:"1px solid rgba(255,215,0,0.4)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:28,
            boxShadow:"0 0 20px rgba(255,215,0,0.15)" }}>⚜</div>
          <div>
            <div style={{ color:"var(--gold-core)", fontSize:14, fontFamily:"var(--font-title)",
              fontWeight:700, letterSpacing:1, marginBottom:4 }}>Badge Exclusivo: Caçador Premium</div>
            <div style={{ color:"var(--text-mid)", fontSize:12, fontFamily:"var(--font-body)" }}>
              Exibido no seu perfil. Mostra sua dedicação à jornada de evolução.
            </div>
          </div>
          <div style={{ flexShrink:0, background:"rgba(255,102,221,0.1)", border:"1px solid rgba(255,102,221,0.3)",
            color:"#ff66dd", fontSize:10, padding:"3px 10px", borderRadius:3, fontFamily:"var(--font-title)" }}>
            MÍTICO
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ padding:"0 36px 32px", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <button style={{ width:"100%", maxWidth:400, padding:"14px 0", borderRadius:6,
            background:"linear-gradient(90deg,rgba(255,215,0,0.2),rgba(155,93,229,0.2),rgba(255,215,0,0.2))",
            backgroundSize:"200% 100%", animation:"premium-shimmer 3s linear infinite",
            border:"1px solid rgba(255,215,0,0.5)", color:"var(--gold-core)",
            fontFamily:"var(--font-title)", fontSize:14, letterSpacing:3, cursor:"pointer",
            boxShadow:"0 0 20px rgba(255,215,0,0.15)" }}>
            ⚜ ASSINAR PREMIUM
          </button>
          <div style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-mono)", textAlign:"center" }}>
            Em breve — integração de pagamento chegando
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none",
            color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-mono)",
            cursor:"pointer", textDecoration:"underline" }}>
            Continuar no plano gratuito
          </button>
        </div>
      </div>
    </div>
  );
}
