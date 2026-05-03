// ── tabs.js — as 5 abas do app ────────────────────────────────────

// ── STATUS ────────────────────────────────────────────────────────
function StatusTab({ profile, questLog, onAvatarEdit, onStatPoint, weeklyProgress, countdown, isPremium, xpLost, onShowPremium }) {
  const isMobile = useIsMobile();
  const { level, xpInLevel, xpToNext } = computeLevel(profile.xp);
  const rank     = getRankForLevel(level);
  const dispRank = FREE_RANKS.includes(rank) ? rank : "C";
  const xpPct    = Math.round((xpInLevel / xpToNext) * 100);

  const statValues = STAT_META.map(s => ({ ...s, value: profile.stats[s.key] || 10, max: 100 }));

  // Últimos 7 dias como pontos de dot
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10);
    const hasActivity = Object.keys(questLog[date] || {}).length > 0;
    return { date, active: hasActivity };
  });

  return (
    <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:16, animation:"appear-up 0.4s ease" }}>

      {/* ESQUERDA */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

        {/* Card do jogador */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-dim)", borderRadius:6,
          padding:20, position:"relative", overflow:"hidden", animation:"pulse-border 4s ease infinite" }}>
          <div style={{ position:"absolute", inset:0,
            background:"radial-gradient(ellipse at 80% 20%,rgba(155,93,229,0.06) 0%,transparent 60%)" }} />
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:18, position:"relative" }}>
            <div style={{ position:"relative" }}>
              <Avatar profile={profile} size={64} editable onEdit={onAvatarEdit} />
              <div style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)",
                background:"var(--purple-core)", color:"#fff", fontSize:9, fontFamily:"var(--font-title)",
                fontWeight:700, padding:"1px 8px", borderRadius:2, whiteSpace:"nowrap" }}>
                Lv. {level}
              </div>
            </div>
            <div>
              <div style={{ color:"var(--text-dim)", fontSize:10, letterSpacing:2, fontFamily:"var(--font-mono)", marginBottom:3 }}>CAÇADOR</div>
              <div style={{ color:"var(--text-bright)", fontSize:18, fontFamily:"var(--font-title)", fontWeight:700,
                letterSpacing:1, animation:"flicker 12s ease infinite" }}>{profile.name}</div>
              <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:5, flexWrap:"wrap" }}>
                {profile.titles[0] && (
                  <span style={{ background:"rgba(155,93,229,0.15)", border:"1px solid rgba(155,93,229,0.4)",
                    color:"var(--purple-glow)", fontSize:10, padding:"2px 8px",
                    fontFamily:"var(--font-title)", letterSpacing:1, borderRadius:2 }}>{profile.titles[0]}</span>
                )}
                <span style={{ background:"rgba(255,215,0,0.1)", border:"1px solid rgba(255,215,0,0.35)",
                  color: RANK_COLORS[dispRank], fontSize:11, padding:"2px 8px",
                  fontFamily:"var(--font-title)", fontWeight:700, borderRadius:2,
                  animation:"rank-glow 2.5s ease infinite" }}>RANK {dispRank}</span>
              </div>
            </div>
          </div>

          {/* Barras HP/MP */}
          {[
            { label:"HP", value: Math.min(profile.stats.VIT * 50, 5000), max:5000, color:"#ff4466" },
            { label:"MP", value: Math.min(profile.stats.PER * 20, 2000), max:2000, color:"#4f8cff" },
          ].map(b => (
            <div key={b.label} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ color:b.color, fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:1 }}>{b.label}</span>
                <span style={{ color:"var(--text-mid)", fontSize:10, fontFamily:"var(--font-mono)" }}>
                  {b.value} / {b.max}
                </span>
              </div>
              <Bar value={b.value} max={b.max} color={b.color} />
            </div>
          ))}

          {/* XP */}
          <div style={{ marginTop:4 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:1 }}>
                EXP &nbsp;<span style={{ color:"var(--text-mid)" }}>{xpInLevel.toLocaleString()} / {xpToNext.toLocaleString()}</span>
              </span>
              <span style={{ color:"var(--purple-glow)", fontSize:10, fontFamily:"var(--font-mono)" }}>{xpPct}%</span>
            </div>
            <div style={{ height:8, background:"rgba(155,93,229,0.1)", borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${xpPct}%`, borderRadius:4, transition:"width 1s ease",
                background:"linear-gradient(90deg,rgba(155,93,229,0.6),var(--purple-core))",
                boxShadow:"0 0 10px rgba(155,93,229,0.5)" }} />
            </div>
          </div>
        </div>

        {/* Streak */}
        <div style={{ background:"var(--bg-card)", border:"1px solid rgba(255,102,0,0.2)", borderRadius:6, padding:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ color:"var(--text-dim)", fontSize:10, letterSpacing:3, fontFamily:"var(--font-title)" }}>STREAK</span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:22, animation:"streak-flame 2s ease infinite" }}>🔥</span>
              <span style={{ color:"#ff6600", fontSize:24, fontFamily:"var(--font-title)", fontWeight:700 }}>
                {profile.streak}
              </span>
              <span style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)" }}>dias</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {last7.map((d, i) => (
              <div key={d.date} style={{ flex:1, height:28, borderRadius:3,
                background: d.active ? "rgba(255,102,0,0.3)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${d.active ? "rgba(255,102,0,0.5)" : "var(--border-dim)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10 }}>
                {d.active ? "🔥" : ""}
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
            <div style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)" }}>
              últimos 7 dias · reset em {countdown}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:3 }}>
              {Array.from({ length: isPremium ? SHIELDS_PREMIUM : SHIELDS_FREE }).map((_, i) => (
                <span key={i} style={{ fontSize:12, opacity: i < (profile.streak_shields || 0) ? 1 : 0.2 }}>🛡</span>
              ))}
              <span style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)", marginLeft:3 }}>
                {profile.streak_shields || 0}/{isPremium ? SHIELDS_PREMIUM : SHIELDS_FREE}
              </span>
            </div>
          </div>
        </div>

        {/* XP perdido sem Premium */}
        {!isPremium && xpLost > 0 && (
          <div onClick={onShowPremium} style={{ cursor:"pointer", background:"rgba(255,68,102,0.06)",
            border:"1px solid rgba(255,68,102,0.25)", borderRadius:6, padding:"14px 16px",
            display:"flex", alignItems:"center", gap:12 }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,68,102,0.5)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,68,102,0.25)"}>
            <span style={{ fontSize:20, flexShrink:0 }}>😔</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)", letterSpacing:2, marginBottom:3 }}>
                XP PERDIDO SEM PREMIUM (MÊS)
              </div>
              <div style={{ color:"var(--red-core)", fontSize:20, fontFamily:"var(--font-title)", fontWeight:900,
                textShadow:"0 0 12px rgba(255,68,102,0.4)" }}>
                -{xpLost.toLocaleString()} XP
              </div>
            </div>
            <span style={{ color:"var(--gold-core)", fontSize:9, fontFamily:"var(--font-title)", letterSpacing:1, flexShrink:0 }}>
              ⚜ VER
            </span>
          </div>
        )}

        {/* Pontos de atributo — apenas Premium */}
        {isPremium && profile.stat_points > 0 && (
          <div style={{ background:"var(--bg-card)", border:"1px solid rgba(255,215,0,0.25)", borderRadius:6, padding:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ color:"var(--gold-core)", fontSize:11, fontFamily:"var(--font-title)", letterSpacing:1 }}>PONTOS DISPONÍVEIS</span>
              <span style={{ background:"rgba(255,215,0,0.15)", color:"var(--gold-core)", fontFamily:"var(--font-title)",
                fontSize:16, fontWeight:700, padding:"2px 12px", borderRadius:3, border:"1px solid rgba(255,215,0,0.3)" }}>
                {profile.stat_points}
              </span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {STAT_META.map(s => (
                <div key={s.key} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ color:s.color, width:32, fontSize:10, fontFamily:"var(--font-title)", fontWeight:700 }}>{s.key}</span>
                  <span style={{ color:"var(--text-mid)", width:26, fontSize:11, fontFamily:"var(--font-mono)", textAlign:"right" }}>{profile.stats[s.key]}</span>
                  <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(profile.stats[s.key]/100)*100}%`, background:s.color, borderRadius:2 }} />
                  </div>
                  <button onClick={() => onStatPoint(s.key)} style={{ width:22, height:22, borderRadius:2,
                    border:`1px solid ${s.color}44`, background:`${s.color}11`, color:s.color,
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"var(--font-mono)", fontSize:13, fontWeight:700 }}>+</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isPremium && (
          <div onClick={onShowPremium} style={{ cursor:"pointer", background:"var(--bg-card)",
            border:"1px solid rgba(255,215,0,0.15)", borderRadius:6, padding:16 }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,215,0,0.35)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,215,0,0.15)"}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-title)", letterSpacing:1 }}>DISTRIBUIR ATRIBUTOS</span>
              <span style={{ background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.25)",
                color:"var(--gold-core)", fontSize:9, padding:"2px 8px", fontFamily:"var(--font-title)", borderRadius:2 }}>
                ⚜ PREMIUM
              </span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:7, opacity:0.4, pointerEvents:"none" }}>
              {STAT_META.map(s => (
                <div key={s.key} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ color:s.color, width:32, fontSize:10, fontFamily:"var(--font-title)", fontWeight:700 }}>{s.key}</span>
                  <span style={{ color:"var(--text-mid)", width:26, fontSize:11, fontFamily:"var(--font-mono)", textAlign:"right" }}>{profile.stats[s.key]}</span>
                  <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(profile.stats[s.key]/100)*100}%`, background:s.color, borderRadius:2 }} />
                  </div>
                  <div style={{ width:22, height:22, borderRadius:2, border:"1px solid rgba(255,255,255,0.1)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color:"var(--text-dim)", fontSize:13, fontFamily:"var(--font-mono)" }}>+</div>
                </div>
              ))}
            </div>
            <div style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-body)", marginTop:10, textAlign:"center" }}>
              Assinantes Premium ganham 3 pontos a cada nível para distribuir livremente
            </div>
          </div>
        )}
      </div>

      {/* DIREITA */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

        {/* Radar */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-dim)", borderRadius:6,
          padding:20, display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div style={{ color:"var(--text-dim)", fontSize:10, letterSpacing:3, fontFamily:"var(--font-title)", marginBottom:12 }}>VISÃO GERAL DOS ATRIBUTOS</div>
          <StatRadar stats={statValues} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"6px 16px", marginTop:12, width:"100%" }}>
            {STAT_META.map(s => (
              <div key={s.key} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:6, height:6, borderRadius:1, background:s.color, boxShadow:`0 0 4px ${s.color}` }} />
                <span style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)" }}>{s.key}: </span>
                <span style={{ color:s.color, fontSize:10, fontFamily:"var(--font-mono)", fontWeight:700 }}>{profile.stats[s.key]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info grid */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-dim)", borderRadius:6,
          padding:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { label:"Nível",   value: level,               color:"var(--blue-glow)" },
            { label:"Rank",    value:`Rank ${dispRank}`,    color: RANK_COLORS[dispRank] },
            { label:"XP Total",value: profile.xp.toLocaleString(), color:"var(--purple-glow)" },
            { label:"Ouro",    value:`◆ ${profile.gold.toLocaleString()}`, color:"var(--gold-core)" },
            { label:"Conquistas",value: profile.achievements.length, color:"var(--cyan-core)" },
            { label:"Missões", value: countTotalTasks(questLog), color:"var(--green-core)" },
          ].map(item => (
            <div key={item.label} style={{ borderLeft:"2px solid rgba(79,140,255,0.25)", paddingLeft:10 }}>
              <div style={{ color:"var(--text-dim)", fontSize:9, letterSpacing:1, fontFamily:"var(--font-mono)", marginBottom:2 }}>{item.label}</div>
              <div style={{ color:item.color, fontSize:13, fontFamily:"var(--font-title)", fontWeight:600 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Progressão de Ranks */}
        {(() => {
          const RANK_INFO = [
            { rank:"E", minLevel:1,  maxLevel:4,  free:true  },
            { rank:"D", minLevel:5,  maxLevel:9,  free:true  },
            { rank:"C", minLevel:10, maxLevel:14, free:true  },
            { rank:"B", minLevel:15, maxLevel:19, free:false },
            { rank:"A", minLevel:20, maxLevel:29, free:false },
            { rank:"S", minLevel:30, maxLevel:null, free:false },
          ];
          const currentRankInfo = RANK_INFO.find(r => rank === r.rank) || RANK_INFO[0];
          const nextRankInfo    = RANK_INFO[RANK_INFO.indexOf(currentRankInfo) + 1];
          const levelsToNext    = nextRankInfo ? nextRankInfo.minLevel - level : 0;
          return (
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-dim)", borderRadius:6, padding:16 }}>
              <div style={{ color:"var(--text-dim)", fontSize:10, letterSpacing:3, fontFamily:"var(--font-title)", marginBottom:14 }}>PROGRESSÃO DE RANK</div>

              {/* Lista de ranks */}
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
                {RANK_INFO.map(r => {
                  const isCurrent = r.rank === rank;
                  const isPast    = RANK_INFO.indexOf(r) < RANK_INFO.indexOf(currentRankInfo);
                  const rc        = RANK_COLORS[r.rank];
                  return (
                    <div key={r.rank} style={{ display:"flex", alignItems:"center", gap:10,
                      background: isCurrent ? `${rc}10` : "transparent",
                      border: isCurrent ? `1px solid ${rc}44` : "1px solid transparent",
                      borderRadius:4, padding:"6px 8px" }}>
                      <div style={{ width:28, height:28, borderRadius:3, flexShrink:0,
                        background: isCurrent ? `${rc}20` : isPast ? `${rc}10` : "rgba(255,255,255,0.03)",
                        border:`1px solid ${isCurrent ? rc : isPast ? `${rc}44` : "var(--border-dim)"}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontFamily:"var(--font-title)", fontSize:11, fontWeight:700,
                        color: isCurrent ? rc : isPast ? rc : "var(--text-dim)",
                        opacity: r.free || isPremium || isCurrent || isPast ? 1 : 0.4 }}>
                        {r.rank}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <span style={{ color: isCurrent ? rc : isPast ? "var(--text-mid)" : "var(--text-dim)",
                            fontSize:11, fontFamily:"var(--font-title)", fontWeight: isCurrent ? 700 : 400 }}>
                            Rank {r.rank}{isCurrent ? " ← atual" : ""}
                          </span>
                          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                            {!r.free && (
                              <span style={{ fontSize:9, color:"var(--gold-core)", fontFamily:"var(--font-title)" }}>⚜</span>
                            )}
                            <span style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)" }}>
                              Lv.{r.minLevel}{r.maxLevel ? `–${r.maxLevel}` : "+"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isPast && <span style={{ fontSize:12 }}>✓</span>}
                    </div>
                  );
                })}
              </div>

              {/* Próximo rank */}
              {nextRankInfo && (
                <div style={{ background:"rgba(79,140,255,0.05)", border:"1px solid rgba(79,140,255,0.15)",
                  borderRadius:4, padding:"10px 12px" }}>
                  <div style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)", letterSpacing:1, marginBottom:4 }}>
                    PRÓXIMO RANK
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ color: RANK_COLORS[nextRankInfo.rank], fontSize:13,
                      fontFamily:"var(--font-title)", fontWeight:700 }}>Rank {nextRankInfo.rank}</span>
                    <span style={{ color:"var(--text-mid)", fontSize:11, fontFamily:"var(--font-mono)" }}>
                      {levelsToNext} {levelsToNext === 1 ? "nível" : "níveis"} restantes
                    </span>
                  </div>
                  {!nextRankInfo.free && !isPremium && (
                    <div style={{ color:"var(--gold-core)", fontSize:10, fontFamily:"var(--font-body)", marginTop:6 }}>
                      ⚜ Requer Premium para desbloquear Rank {nextRankInfo.rank}
                    </div>
                  )}
                </div>
              )}
              {!nextRankInfo && (
                <div style={{ color:"var(--gold-core)", fontSize:11, fontFamily:"var(--font-title)",
                  textAlign:"center", letterSpacing:2 }}>⚜ RANK MÁXIMO ATINGIDO</div>
              )}
            </div>
          );
        })()}

        {/* Progresso semanal */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-dim)", borderRadius:6, padding:16 }}>
          <div style={{ color:"var(--text-dim)", fontSize:10, letterSpacing:3, fontFamily:"var(--font-title)", marginBottom:14 }}>PROGRESSO SEMANAL</div>
          <WeeklyChart weeklyProgress={weeklyProgress} />
        </div>

        {/* Títulos */}
        {profile.titles.length > 0 && (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-dim)", borderRadius:6, padding:16 }}>
            <div style={{ color:"var(--text-dim)", fontSize:10, letterSpacing:3, fontFamily:"var(--font-title)", marginBottom:10 }}>TÍTULOS</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {profile.titles.map(t => (
                <span key={t} style={{ background:"rgba(155,93,229,0.1)", border:"1px solid rgba(155,93,229,0.25)",
                  color:"var(--purple-glow)", fontSize:10, padding:"3px 10px",
                  fontFamily:"var(--font-ui)", borderRadius:2, fontWeight:600 }}>{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── HABILIDADES ───────────────────────────────────────────────────
function SkillsTab({ profile }) {
  const isMobile = useIsMobile();
  const [selected, setSelected] = React.useState(null);
  const rankColors = { EX:"#ff66dd", S:"#ffd700", A:"#ffd700", B:"#9b5de5", C:"#4f8cff", D:"#00ff88", E:"#8899cc" };
  const unlockedIds = new Set(SKILLS.filter(s => profile.achievements.includes(s.unlockBy)).map(s => s.id));

  return (
    <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:16, animation:"appear-up 0.4s ease" }}>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ color:"var(--text-dim)", fontSize:10, letterSpacing:3, fontFamily:"var(--font-title)", marginBottom:4 }}>HABILIDADES</div>
        {SKILLS.map(sk => {
          const rc      = rankColors[sk.rank] || "var(--text-mid)";
          const locked  = !unlockedIds.has(sk.id);
          const isSel   = selected?.id === sk.id;
          const unlockAch = ACHIEVEMENTS.find(a => a.id === sk.unlockBy);
          return (
            <div key={sk.id} onClick={() => setSelected(sk)} style={{
              background: isSel ? "rgba(79,140,255,0.08)" : "var(--bg-card)",
              border:`1px solid ${isSel?"rgba(79,140,255,0.4)":"var(--border-dim)"}`,
              borderRadius:5, padding:"12px 14px", cursor:"pointer",
              transition:"all 0.2s", position:"relative", overflow:"hidden",
              opacity: locked ? 0.55 : 1,
            }}
            onMouseEnter={e=>{ if(!isSel) e.currentTarget.style.background="var(--bg-hover)"; }}
            onMouseLeave={e=>{ if(!isSel) e.currentTarget.style.background=locked?"var(--bg-card)":"var(--bg-card)"; }}
            >
              {isSel && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:2, background:"var(--blue-core)", boxShadow:"0 0 8px var(--blue-core)" }} />}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:3, background:`${rc}15`, border:`1px solid ${rc}33`,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {locked ? <Icon name="lock" size={14} color="var(--text-dim)" /> : <Icon name={sk.icon} size={15} color={rc} />}
                  </div>
                  <div>
                    <div style={{ color: locked?"var(--text-dim)":"var(--text-bright)", fontSize:13, fontFamily:"var(--font-ui)", fontWeight:600 }}>{sk.name}</div>
                    <div style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)", marginTop:1 }}>
                      {locked ? `Desbloqueio: ${unlockAch?.name || sk.unlockBy}` : sk.type}
                    </div>
                  </div>
                </div>
                <span style={{ background:`${rc}18`, border:`1px solid ${rc}44`, color:rc,
                  fontSize:10, padding:"2px 8px", fontFamily:"var(--font-title)", fontWeight:700, borderRadius:2 }}>
                  {sk.rank}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        {selected ? (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-dim)", borderRadius:6,
            padding:24, animation:"appear-up 0.25s ease" }}>
            <div style={{ color:"var(--text-dim)", fontSize:10, letterSpacing:3, fontFamily:"var(--font-title)", marginBottom:18 }}>DETALHES</div>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
              <div style={{ width:56, height:56, borderRadius:5, background:"rgba(79,140,255,0.08)",
                border:"1px solid rgba(79,140,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name={selected.icon} size={26} color="var(--blue-glow)" />
              </div>
              <div>
                <div style={{ color:"var(--text-bright)", fontSize:18, fontFamily:"var(--font-title)", fontWeight:700, marginBottom:6 }}>{selected.name}</div>
                <div style={{ display:"flex", gap:8 }}>
                  {[`Rank ${selected.rank}`, selected.type].map(tag => (
                    <span key={tag} style={{ background:"rgba(155,93,229,0.1)", border:"1px solid rgba(155,93,229,0.3)",
                      color:"var(--purple-glow)", fontSize:10, padding:"2px 8px", fontFamily:"var(--font-title)", borderRadius:2 }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ color:"var(--text-mid)", fontSize:12, lineHeight:1.7, marginBottom:20,
              fontFamily:"var(--font-body)", borderLeft:"2px solid rgba(155,93,229,0.3)", paddingLeft:14 }}>
              {selected.desc}
            </div>
            {!unlockedIds.has(selected.id) && (
              <div style={{ background:"rgba(255,68,102,0.06)", border:"1px solid rgba(255,68,102,0.2)",
                borderRadius:4, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
                <Icon name="lock" size={14} color="var(--red-core)" />
                <div>
                  <div style={{ color:"var(--red-core)", fontSize:11, fontFamily:"var(--font-title)", letterSpacing:1 }}>BLOQUEADA</div>
                  <div style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)", marginTop:2 }}>
                    Conquiste: {ACHIEVEMENTS.find(a=>a.id===selected.unlockBy)?.name || selected.unlockBy}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-dim)", borderRadius:6,
            height:"100%", minHeight:200, display:"flex", alignItems:"center", justifyContent:"center",
            flexDirection:"column", gap:12, opacity:0.5 }}>
            <Icon name="book-open" size={36} color="var(--text-dim)" />
            <div style={{ color:"var(--text-dim)", fontSize:12, fontFamily:"var(--font-ui)", letterSpacing:1 }}>Selecione uma habilidade</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MISSÕES ───────────────────────────────────────────────────────
function QuestsTab({ questLog, onTaskToggle, countdown, isPremium, onShowPremium }) {
  const [filter, setFilter] = React.useState("Todas");
  const today    = todayKey();
  const catColors = { "Força":"#ff6644","Agilidade":"#00d4ff","Inteligência":"#9b5de5","Vitalidade":"#ff4466","Percepção":"#ffd700" };
  const filters  = ["Todas", ...DAILY_QUESTS.map(q => q.category)];
  const shown    = filter === "Todas" ? DAILY_QUESTS : DAILY_QUESTS.filter(q => q.category === filter);

  return (
    <div style={{ animation:"appear-up 0.4s ease" }}>
      {/* Header com timer */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter===f?"rgba(79,140,255,0.15)":"transparent",
              border:`1px solid ${filter===f?"rgba(79,140,255,0.5)":"var(--border-dim)"}`,
              color: filter===f?"var(--blue-glow)":"var(--text-dim)",
              padding:"5px 14px", borderRadius:3, cursor:"pointer",
              fontFamily:"var(--font-title)", fontSize:10, letterSpacing:1, transition:"all 0.15s",
            }}>{f}</button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,68,102,0.08)",
          border:"1px solid rgba(255,68,102,0.2)", borderRadius:4, padding:"6px 12px", flexShrink:0 }}>
          <Icon name="clock" size={12} color="var(--red-core)" />
          <span style={{ color:"var(--red-core)", fontSize:12, fontFamily:"var(--font-mono)" }}>Reset: {countdown}</span>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {shown.map(q => {
          const tc       = catColors[q.category] || "var(--text-mid)";
          const dayLog   = questLog[today] || {};
          const qLog     = dayLog[q.id] || {};
          const done     = q.tasks.filter(t => qLog[t.id]).length;
          const total    = q.tasks.length;
          const pct      = Math.round((done / total) * 100);
          const complete = done === total;
          return (
            <div key={q.id} style={{
              background: complete ? "rgba(0,255,136,0.03)" : "var(--bg-card)",
              border:`1px solid ${complete?"rgba(0,255,136,0.2)":"var(--border-dim)"}`,
              borderRadius:6, padding:18, position:"relative", overflow:"hidden",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ background:`${tc}18`, border:`1px solid ${tc}44`, color:tc,
                      fontSize:9, padding:"2px 8px", fontFamily:"var(--font-title)", letterSpacing:1, borderRadius:2 }}>
                      {q.category}
                    </span>
                    {complete && <span style={{ background:"rgba(0,255,136,0.1)", border:"1px solid rgba(0,255,136,0.3)",
                      color:"var(--green-core)", fontSize:9, padding:"2px 8px", fontFamily:"var(--font-title)", borderRadius:2 }}>✓ COMPLETA</span>}
                  </div>
                  <div style={{ color:"var(--text-bright)", fontSize:15, fontFamily:"var(--font-title)", fontWeight:600, marginBottom:4 }}>{q.title}</div>
                  <div style={{ color:"var(--text-mid)", fontSize:11, fontFamily:"var(--font-body)", lineHeight:1.5 }}>{q.desc}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0, marginLeft:16 }}>
                  <span style={{ color:"var(--purple-glow)", fontSize:11, fontFamily:"var(--font-mono)" }}>
                    +{q.tasks.reduce((s,t)=>s+t.xp,0)+q.bonusXP} XP
                  </span>
                  <span style={{ color:"var(--gold-core)", fontSize:11, fontFamily:"var(--font-mono)" }}>
                    +{q.gold} G
                  </span>
                </div>
              </div>

              {/* Tarefas */}
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
                {q.tasks.map(t => {
                  const isDone = !!qLog[t.id];
                  return (
                    <div key={t.id} onClick={() => onTaskToggle(q.id, t.id, t.xp, t.stat)}
                      style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer",
                        padding:"8px 12px", borderRadius:4,
                        background: isDone ? "rgba(0,255,136,0.05)" : "rgba(255,255,255,0.02)",
                        border:`1px solid ${isDone?"rgba(0,255,136,0.2)":"var(--border-dim)"}`,
                        transition:"all 0.2s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=isDone?"rgba(0,255,136,0.08)":"rgba(255,255,255,0.05)"}
                      onMouseLeave={e=>e.currentTarget.style.background=isDone?"rgba(0,255,136,0.05)":"rgba(255,255,255,0.02)"}>
                      <div style={{ width:18, height:18, borderRadius:3, flexShrink:0,
                        border:`1.5px solid ${isDone?"var(--green-core)":"var(--border-dim)"}`,
                        background: isDone?"rgba(0,255,136,0.15)":"transparent",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {isDone && <Icon name="check" size={11} color="var(--green-core)" />}
                      </div>
                      <span style={{ flex:1, color: isDone?"var(--text-dim)":"var(--text-mid)", fontSize:12,
                        fontFamily:"var(--font-body)", textDecoration: isDone?"line-through":"none" }}>
                        {t.label}
                      </span>
                      <div style={{ display:"flex", gap:8 }}>
                        <span style={{ color:"var(--purple-glow)", fontSize:10, fontFamily:"var(--font-mono)" }}>+{t.xp} XP</span>
                        <span style={{ color: STAT_META.find(s=>s.key===t.stat)?.color||"var(--text-dim)",
                          fontSize:10, fontFamily:"var(--font-mono)" }}>{t.stat}+1</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Barra de progresso */}
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)", letterSpacing:1 }}>PROGRESSO</span>
                    <span style={{ color: pct===100?"var(--green-core)":"var(--text-mid)", fontSize:9, fontFamily:"var(--font-mono)" }}>{done}/{total}</span>
                  </div>
                  <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background: pct===100?"var(--green-core)":tc,
                      borderRadius:2, transition:"width 0.5s", boxShadow:`0 0 6px ${tc}66` }} />
                  </div>
                </div>
                {complete && (
                  <span style={{ color:"var(--green-core)", fontSize:10, fontFamily:"var(--font-mono)", flexShrink:0 }}>
                    +{q.bonusXP} BÔNUS
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Missões Semanais ── */}
      <div style={{ marginTop:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, paddingBottom:10,
          borderBottom:"1px solid var(--border-dim)" }}>
          <Icon name="star" size={14} color="var(--purple-glow)" />
          <span style={{ color:"var(--purple-glow)", fontSize:11, fontFamily:"var(--font-title)", letterSpacing:2 }}>
            MISSÕES SEMANAIS
          </span>
          {!isPremium && (
            <span style={{ background:"rgba(255,215,0,0.1)", border:"1px solid rgba(255,215,0,0.3)",
              color:"var(--gold-core)", fontSize:9, padding:"2px 8px", fontFamily:"var(--font-title)", borderRadius:2 }}>
              ⚜ PREMIUM
            </span>
          )}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
          {WEEKLY_QUESTS.map(q => (
            <div key={q.id} style={{ position:"relative", borderRadius:6, overflow:"hidden",
              background:"rgba(10,10,26,0.6)", border:"1px solid rgba(155,93,229,0.2)" }}>
              <div style={{ padding:16, filter: isPremium?"none":"blur(1.5px)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div>
                    <span style={{ background:"rgba(155,93,229,0.15)", border:"1px solid rgba(155,93,229,0.35)",
                      color:"var(--purple-glow)", fontSize:9, padding:"2px 8px", fontFamily:"var(--font-title)",
                      letterSpacing:1, borderRadius:2, display:"inline-block", marginBottom:8 }}>{q.category}</span>
                    <div style={{ color:"var(--text-bright)", fontSize:14, fontFamily:"var(--font-title)", fontWeight:600 }}>{q.title}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
                    <div style={{ color:"var(--purple-glow)", fontSize:11, fontFamily:"var(--font-mono)" }}>
                      +{q.tasks.reduce((s,t)=>s+t.xp,0)+q.bonusXP} XP
                    </div>
                    <div style={{ color:"var(--gold-core)", fontSize:10, fontFamily:"var(--font-mono)" }}>+{q.gold} G</div>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {q.tasks.map(t => (
                    <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8,
                      color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-body)" }}>
                      <div style={{ width:14, height:14, borderRadius:2, flexShrink:0,
                        border:"1px solid rgba(155,93,229,0.3)" }} />
                      {t.label}
                      <span style={{ marginLeft:"auto", color:"var(--purple-glow)", fontSize:10,
                        fontFamily:"var(--font-mono)", flexShrink:0 }}>+{t.xp}</span>
                    </div>
                  ))}
                </div>
              </div>
              {!isPremium && (
                <div style={{ position:"absolute", inset:0, background:"rgba(2,2,10,0.65)",
                  display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column",
                  gap:8, cursor:"pointer" }} onClick={onShowPremium}>
                  <Icon name="lock" size={22} color="rgba(155,93,229,0.7)" />
                  <span style={{ color:"var(--gold-core)", fontSize:10, fontFamily:"var(--font-title)", letterSpacing:2 }}>⚜ PREMIUM</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── INVENTÁRIO ────────────────────────────────────────────────────
function InventoryTab({ profile }) {
  const isMobile = useIsMobile();
  const [selected, setSelected] = React.useState(null);
  const [filter, setFilter]     = React.useState("Todos");
  const owned   = new Set(profile.inventory_items || []);
  const types   = ["Todos", "Insígnia", "Moldura", "Título", "Tema"];
  const shown   = filter === "Todos" ? INVENTORY_ITEMS : INVENTORY_ITEMS.filter(i => i.type === filter);
  const typeIcon = { "Insígnia":"star","Moldura":"user","Título":"crown","Tema":"moon" };

  return (
    <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap:16, animation:"appear-up 0.4s ease" }}>
      <div>
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
          {types.map(t => (
            <button key={t} onClick={()=>setFilter(t)} style={{
              background: filter===t?"rgba(79,140,255,0.15)":"transparent",
              border:`1px solid ${filter===t?"rgba(79,140,255,0.5)":"var(--border-dim)"}`,
              color: filter===t?"var(--blue-glow)":"var(--text-dim)",
              padding:"4px 12px", borderRadius:3, cursor:"pointer",
              fontFamily:"var(--font-title)", fontSize:10, letterSpacing:1, transition:"all 0.15s",
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:8 }}>
          {shown.map(item => {
            const gc       = GRADE_COLOR[item.grade] || "var(--text-mid)";
            const isOwned  = owned.has(item.id);
            const isSel    = selected?.id === item.id;
            return (
              <div key={item.id} onClick={()=>setSelected(item)} style={{
                background: isSel?`${gc}08`:"var(--bg-card)",
                border:`1px solid ${isSel?`${gc}55`:"var(--border-dim)"}`,
                borderRadius:5, padding:12, cursor:"pointer", transition:"all 0.2s",
                opacity: isOwned ? 1 : 0.45, position:"relative",
              }}
              onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="var(--bg-hover)";}}
              onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background="var(--bg-card)";}}>
                {isOwned && (
                  <div style={{ position:"absolute", top:6, right:6, background:"rgba(0,255,136,0.15)",
                    border:"1px solid rgba(0,255,136,0.4)", color:"var(--green-core)",
                    fontSize:8, padding:"1px 5px", borderRadius:2, fontFamily:"var(--font-title)" }}>✓</div>
                )}
                <div style={{ width:36, height:36, borderRadius:4, background:`${gc}12`, border:`1px solid ${gc}33`,
                  display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
                  <Icon name={typeIcon[item.type]||"star"} size={18} color={gc} />
                </div>
                <div style={{ color:gc, fontSize:12, fontFamily:"var(--font-ui)", fontWeight:600, lineHeight:1.3, marginBottom:4 }}>{item.name}</div>
                <div style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)" }}>{item.grade} · {item.type}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        {selected ? (() => {
          const gc      = GRADE_COLOR[selected.grade] || "var(--text-mid)";
          const isOwned = owned.has(selected.id);
          const unlockAch = ACHIEVEMENTS.find(a => a.id === selected.unlockBy);
          return (
            <div style={{ background:"var(--bg-card)", border:`1px solid ${gc}33`, borderRadius:6,
              padding:20, animation:"appear-up 0.25s ease", position:"sticky", top:0 }}>
              <div style={{ color:"var(--text-dim)", fontSize:10, letterSpacing:3, fontFamily:"var(--font-title)", marginBottom:16 }}>DETALHES</div>
              <div style={{ width:60, height:60, borderRadius:6, background:`${gc}12`, border:`1px solid ${gc}44`,
                display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, boxShadow:`0 0 20px ${gc}22` }}>
                <Icon name={typeIcon[selected.type]||"star"} size={28} color={gc} />
              </div>
              <div style={{ color:gc, fontSize:15, fontFamily:"var(--font-title)", fontWeight:700, marginBottom:6,
                textShadow:`0 0 10px ${gc}66` }}>{selected.name}</div>
              <div style={{ display:"flex", gap:6, marginBottom:14 }}>
                <span style={{ background:`${gc}15`, border:`1px solid ${gc}33`, color:gc,
                  fontSize:10, padding:"2px 8px", fontFamily:"var(--font-title)", borderRadius:2 }}>{selected.grade}</span>
                <span style={{ background:"rgba(79,140,255,0.1)", border:"1px solid rgba(79,140,255,0.25)",
                  color:"var(--blue-glow)", fontSize:10, padding:"2px 8px", fontFamily:"var(--font-title)", borderRadius:2 }}>{selected.type}</span>
              </div>
              <div style={{ color:"var(--text-mid)", fontSize:11, lineHeight:1.6, fontFamily:"var(--font-body)",
                marginBottom:16, borderLeft:"2px solid rgba(79,140,255,0.25)", paddingLeft:12 }}>{selected.desc}</div>
              {!isOwned && unlockAch && (
                <div style={{ background:"rgba(79,140,255,0.05)", border:"1px solid var(--border-dim)",
                  borderRadius:4, padding:"10px 12px" }}>
                  <div style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)", marginBottom:4 }}>DESBLOQUEIO</div>
                  <div style={{ color:"var(--blue-glow)", fontSize:12, fontFamily:"var(--font-ui)", fontWeight:600 }}>
                    {unlockAch.name}
                  </div>
                </div>
              )}
              {isOwned && (
                <div style={{ color:"var(--green-core)", fontSize:11, fontFamily:"var(--font-title)",
                  letterSpacing:1, textAlign:"center" }}>✓ OBTIDO</div>
              )}
            </div>
          );
        })() : (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-dim)", borderRadius:6,
            height:200, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:10, opacity:0.5 }}>
            <Icon name="package" size={30} color="var(--text-dim)" />
            <div style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-ui)", letterSpacing:1 }}>Selecione um item</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CONQUISTAS ────────────────────────────────────────────────────
function AchievementsTab({ profile }) {
  const [filter, setFilter] = React.useState("Todas");
  const unlocked = new Set(profile.achievements || []);
  const filters  = ["Todas", "Obtidas", "Bloqueadas"];
  const shown = filter === "Todas" ? ALL_ACHIEVEMENTS
    : filter === "Obtidas"  ? ALL_ACHIEVEMENTS.filter(a =>  unlocked.has(a.id))
    : ALL_ACHIEVEMENTS.filter(a => !unlocked.has(a.id));

  return (
    <div style={{ animation:"appear-up 0.4s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ display:"flex", gap:8 }}>
          {filters.map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{
              background: filter===f?"rgba(79,140,255,0.15)":"transparent",
              border:`1px solid ${filter===f?"rgba(79,140,255,0.5)":"var(--border-dim)"}`,
              color: filter===f?"var(--blue-glow)":"var(--text-dim)",
              padding:"5px 14px", borderRadius:3, cursor:"pointer",
              fontFamily:"var(--font-title)", fontSize:10, letterSpacing:1, transition:"all 0.15s",
            }}>{f}</button>
          ))}
        </div>
        <span style={{ color:"var(--text-mid)", fontSize:11, fontFamily:"var(--font-mono)" }}>
          {unlocked.size} / {ALL_ACHIEVEMENTS.length}
        </span>
      </div>

      {/* Progresso geral */}
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-dim)", borderRadius:6,
        padding:"12px 16px", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)", letterSpacing:1 }}>PROGRESSO TOTAL</span>
          <span style={{ color:"var(--gold-core)", fontSize:9, fontFamily:"var(--font-mono)" }}>
            {Math.round((unlocked.size/ACHIEVEMENTS.length)*100)}%
          </span>
        </div>
        <Bar value={unlocked.size} max={ALL_ACHIEVEMENTS.length} color="var(--gold-core)" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10 }}>
        {shown.map(ach => {
          const isUnlocked = unlocked.has(ach.id);
          const gc = GRADE_COLOR[ach.grade] || "var(--text-mid)";
          return (
            <div key={ach.id} style={{
              background: isUnlocked ? "var(--bg-card)" : "rgba(10,10,26,0.5)",
              border:`1px solid ${isUnlocked?`${gc}44`:"var(--border-dim)"}`,
              borderRadius:6, padding:16, display:"flex", alignItems:"center", gap:14,
              opacity: isUnlocked ? 1 : 0.5,
              animation: isUnlocked ? "none" : "none",
            }}>
              <div style={{ width:44, height:44, borderRadius:4, flexShrink:0,
                background: isUnlocked ? `${gc}18` : "rgba(255,255,255,0.03)",
                border:`1px solid ${isUnlocked?`${gc}44`:"var(--border-dim)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow: isUnlocked ? `0 0 12px ${gc}33` : "none",
              }}>
                {isUnlocked
                  ? <Icon name={ach.icon} size={20} color={gc} />
                  : <Icon name="lock" size={18} color="var(--text-dim)" />}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div style={{ color: isUnlocked?"var(--text-bright)":"var(--text-dim)", fontSize:13,
                    fontFamily:"var(--font-title)", fontWeight:600 }}>{ach.name}</div>
                  <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                    {ach.premium && (
                      <span style={{ background:"rgba(255,215,0,0.1)", border:"1px solid rgba(255,215,0,0.3)",
                        color:"var(--gold-core)", fontSize:9, padding:"1px 6px",
                        fontFamily:"var(--font-title)", borderRadius:2 }}>⚜</span>
                    )}
                    {isUnlocked && (
                      <span style={{ background:`${gc}15`, border:`1px solid ${gc}33`, color:gc,
                        fontSize:9, padding:"1px 7px", fontFamily:"var(--font-title)", borderRadius:2 }}>
                        {ach.grade}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-body)", lineHeight:1.4, marginBottom:4 }}>
                  {ach.desc}
                </div>
                <div style={{ color: isUnlocked?"var(--purple-glow)":"var(--text-dim)", fontSize:10,
                  fontFamily:"var(--font-mono)" }}>
                  {isUnlocked ? `+${ach.xp} XP obtidos` : `Recompensa: +${ach.xp} XP`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
