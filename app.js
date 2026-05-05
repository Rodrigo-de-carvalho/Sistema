// ── app.js — App principal ────────────────────────────────────────
const { useState, useEffect, useCallback, useMemo } = React;

const TABS_CFG = [
  { id:"status",    label:"Status",      icon:"layout-dashboard" },
  { id:"skills",    label:"Habilidades", icon:"book-open" },
  { id:"quests",    label:"Missões",     icon:"list-checks" },
  { id:"inventory", label:"Inventário",  icon:"package" },
  { id:"achievements", label:"Conquistas", icon:"trophy" },
  { id:"social",    label:"Social",      icon:"users" },
  { id:"guilds",    label:"Guildas",     icon:"shield" },
];

function App() {
  const [profile,    setProfile]    = useState(null);
  const [questLog,   setQuestLog]   = useState({});
  const [session,    setSession]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showAuth,   setShowAuth]   = useState(false);
  const [tab,        setTab]        = useState("status");
  const [alerts,     setAlerts]     = useState([]);
  const [clock,      setClock]      = useState("");
  const [countdown,  setCountdown]  = useState("");
  const [isOnline,   setIsOnline]   = useState(navigator.onLine);
  const [showPremium,     setShowPremium]      = useState(false);
  const [syncTimer,       setSyncTimer]        = useState(null);
  const [showPassReset,   setShowPassReset]    = useState(false);

  // ── Relógio + countdown ──────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      setClock(new Date().toTimeString().slice(0, 8));
      setCountdown(getTimeToMidnight());
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // ── Online / offline ─────────────────────────────────────────
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // ── Sync Supabase quando volta online ────────────────────────
  useEffect(() => {
    if (isOnline && profile && session) {
      syncToSupabase(profile, session.user.id);
    }
  }, [isOnline]);

  // ── Carregamento inicial ─────────────────────────────────────
  useEffect(() => {
    (async () => {
      // 1. Carrega do localStorage
      const cached = loadProfile();
      if (cached) {
        let p = resetShieldsIfNewMonth(cached);
        const { profile: p2, shieldUsed: su1 } = checkStreakShield(p);
        setProfile(p2);
        setQuestLog(p2.quest_log || {});
        if (su1) setTimeout(() => addAlert("🛡 Escudo de Streak usado!", "Seu streak foi protegido automaticamente.", "warning"), 1500);
      }

      // 2. Verifica sessão Supabase
      if (window.SUPABASE_OK) {
        const { data: { session: sess } } = await window.sb.auth.getSession();
        if (sess) {
          setSession(sess);
          const remote = await loadFromSupabase(sess.user.id);
          if (remote) {
            let p = resetShieldsIfNewMonth(remote);
            const { profile: p2, shieldUsed: su2 } = checkStreakShield(p);
            setProfile(p2);
            setQuestLog(p2.quest_log || {});
            saveProfile(p2);
            if (su2) setTimeout(() => addAlert("🛡 Escudo de Streak usado!", "Seu streak foi protegido automaticamente.", "warning"), 1500);
          } else if (!cached) {
            setNeedsSetup(true);
          }
        } else if (!cached) {
          setShowAuth(true);
        }
        // Listener de mudança de auth
        window.sb.auth.onAuthStateChange((event, sess) => {
          setSession(sess);
          if (event === "SIGNED_OUT") {
            setProfile(null); setQuestLog({});
            setShowAuth(true);
          } else if (event === "PASSWORD_RECOVERY") {
            setShowPassReset(true);
          }
        });
      } else if (!cached) {
        setNeedsSetup(true);
      }

      setLoading(false);
    })();
  }, []);

  // ── Checar conquistas quando perfil ou log mudam ─────────────
  useEffect(() => {
    if (!profile) return;
    const newly = checkNewAchievements(profile, questLog);
    if (newly.length === 0) return;
    const bonusXP    = newly.reduce((s, a) => s + a.xp, 0);
    const newAchIds  = newly.map(a => a.id);
    const newItems   = newAchIds.flatMap(id => ACH_TO_ITEMS[id] || []);
    const newTitles  = newItems.filter(id => INVENTORY_ITEMS.find(i=>i.id===id&&i.type==="Título"))
                        .map(id => INVENTORY_ITEMS.find(i=>i.id===id)?.name).filter(Boolean);

    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        xp:             prev.xp + bonusXP,
        achievements:   [...prev.achievements, ...newAchIds],
        inventory_items:[...new Set([...(prev.inventory_items||[]), ...newItems])],
        titles:         [...new Set([...prev.titles, ...newTitles])],
      };
    });

    newly.forEach(a => addAlert(`Conquista: ${a.name}`, `+${a.xp} XP · ${a.grade}`, "success"));
  }, [profile?.achievements?.length, profile?.streak, profile?.level,
      profile?.stats?.FOR, profile?.stats?.INT, JSON.stringify(Object.keys(questLog))]);

  // ── Verificar gate premium ───────────────────────────────────
  useEffect(() => {
    if (!profile) return;
    const rank = getRankForLevel(profile.level);
    if (!FREE_RANKS.includes(rank) && !profile.premium_gate_shown) {
      setShowPremium(true);
      applyProfileUpdate({ premium_gate_shown: true });
    }
  }, [profile?.level]);

  // ── Persistência automática ──────────────────────────────────
  useEffect(() => {
    if (!profile) return;
    const merged = { ...profile, quest_log: questLog };
    saveProfile(merged);
    if (syncTimer) clearTimeout(syncTimer);
    if (isOnline && session) {
      const t = setTimeout(() => syncToSupabase(merged, session.user.id), 2000);
      setSyncTimer(t);
    }
  }, [profile, questLog]);

  // ── Helpers ──────────────────────────────────────────────────
  const addAlert = useCallback((msg, sub, type = "info") => {
    const id = Date.now() + Math.random();
    setAlerts(a => [...a.slice(-3), { id, msg, sub, type }]);
    setTimeout(() => setAlerts(a => a.filter(x => x.id !== id)), 5000);
  }, []);

  const applyProfileUpdate = useCallback((updates) => {
    setProfile(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  // ── Completar / desmarcar tarefa ─────────────────────────────
  const handleTaskToggle = useCallback((questId, taskId, taskXP, taskStat) => {
    const today  = todayKey();
    const yest   = yesterdayKey();

    setQuestLog(prev => {
      const dayLog  = prev[today] || {};
      const qLog    = dayLog[questId] || {};
      const isDone  = !!qLog[taskId];
      const newQLog = { ...qLog, [taskId]: !isDone };
      return { ...prev, [today]: { ...dayLog, [questId]: newQLog } };
    });

    setProfile(prev => {
      if (!prev) return prev;
      const isDone  = !!(prev.quest_log?.[today]?.[questId]?.[taskId]);
      const delta   = isDone ? -1 : 1;
      const effectiveXP = (!isDone && prev.is_premium) ? Math.round(taskXP * (1 + PREMIUM_XP_BONUS)) : taskXP;
      const newStat = Math.max(10, (prev.stats[taskStat] || 10) + delta);
      const newXP   = Math.max(0, prev.xp + delta * effectiveXP);
      const { level } = computeLevel(newXP);

      // Streak (só conta ao marcar, não desmarcar)
      let newStreak     = prev.streak;
      let newLastActive = prev.last_active;
      if (!isDone && prev.last_active !== today) {
        newStreak     = prev.last_active === yest ? prev.streak + 1 : 1;
        newLastActive = today;
      }

      const newGold = Math.max(0, prev.gold + delta * Math.floor(taskXP / 5));

      return {
        ...prev,
        xp:          newXP,
        level,
        stats:       { ...prev.stats, [taskStat]: Math.min(100, newStat) },
        streak:      newStreak,
        last_active: newLastActive,
        gold:        newGold,
        stat_points: prev.is_premium
          ? prev.stat_points + (computeLevel(newXP).level > prev.level ? 3 : 0)
          : 0,
      };
    });
  }, []);

  // ── Distribuir ponto de atributo ─────────────────────────────
  const handleStatPoint = useCallback((statKey) => {
    setProfile(prev => {
      if (!prev || prev.stat_points <= 0) return prev;
      return {
        ...prev,
        stats:       { ...prev.stats, [statKey]: Math.min(100, (prev.stats[statKey]||10) + 1) },
        stat_points: prev.stat_points - 1,
      };
    });
  }, []);

  // ── Editar nome ─────────────────────────────────────────────
  const handleNameEdit = useCallback((newName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === profile?.name) return;
    applyProfileUpdate({ name: trimmed });
  }, [profile?.name]);

  // ── Editar avatar ────────────────────────────────────────────
  const handleAvatarEdit = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 800000) { addAlert("Imagem muito grande", "Use menos de 800KB", "warning"); return; }
    const reader = new FileReader();
    reader.onload = ev => applyProfileUpdate({ avatar: ev.target.result });
    reader.readAsDataURL(file);
  }, []);

  // ── Auth ─────────────────────────────────────────────────────
  const handleAuth = useCallback(async (sess, isNew) => {
    setSession(sess);
    if (!sess) { setShowAuth(false); setNeedsSetup(true); return; }
    if (isNew) { setShowAuth(false); setNeedsSetup(true); return; }
    const remote = await loadFromSupabase(sess.user.id);
    if (remote) {
      setProfile(remote);
      setQuestLog(remote.quest_log || {});
      saveProfile(remote);
      setShowAuth(false);
    } else {
      setShowAuth(false);
      setNeedsSetup(true);
    }
  }, []);

  const handleProfileSave = useCallback(async (newProfile) => {
    setProfile(newProfile);
    setQuestLog({});
    saveProfile(newProfile);
    if (session) await syncToSupabase(newProfile, session.user.id);
    setNeedsSetup(false);
    addAlert(`Bem-vindo, ${newProfile.name}!`, "Sua jornada começa agora.", "success");
  }, [session]);

  const handleLogout = useCallback(async () => {
    if (window.sb) await window.sb.auth.signOut();
    localStorage.removeItem("sistema_profile");
    setProfile(null); setQuestLog({}); setSession(null);
    setShowAuth(!!window.SUPABASE_OK);
    if (!window.SUPABASE_OK) setNeedsSetup(true);
  }, []);

  // ── Weekly progress + XP perdido sem premium (memorizados) ──
  const weeklyProgress = useMemo(() => getWeeklyProgress(questLog), [questLog]);
  const xpLost         = useMemo(() => getPremiumXPLost(questLog),  [questLog]);

  const isMobile = useIsMobile();

  // ── Renders de estado ────────────────────────────────────────
  if (loading) return (
    <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center",
      justifyContent:"center", flexDirection:"column", gap:16, background:"var(--bg-void)" }}>
      <Background />
      <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:12, animation:"spin-slow 2s linear infinite",
          display:"inline-block" }}>⚔</div>
        <div style={{ fontFamily:"var(--font-title)", color:"var(--text-dim)", fontSize:11, letterSpacing:3 }}>
          CARREGANDO SISTEMA...
        </div>
      </div>
    </div>
  );

  if (showAuth && window.SUPABASE_OK) return <AuthScreen onAuth={handleAuth} />;
  if (needsSetup) return <ProfileSetup onSave={handleProfileSave} session={session} />;
  if (!profile)   return <ProfileSetup onSave={handleProfileSave} session={session} />;

  const trueRank = getRankForLevel(profile.level);
  const dispRank = profile.is_premium ? trueRank : (FREE_RANKS.includes(trueRank) ? trueRank : "C");

  const tabContent = {
    status:       <StatusTab      profile={profile} questLog={questLog} onAvatarEdit={handleAvatarEdit}
                                  onStatPoint={handleStatPoint} weeklyProgress={weeklyProgress} countdown={countdown}
                                  isPremium={!!profile.is_premium} xpLost={xpLost}
                                  onShowPremium={() => setShowPremium(true)}
                                  onNameEdit={handleNameEdit} />,
    skills:       <SkillsTab      profile={profile} />,
    quests:       <QuestsTab      questLog={questLog} onTaskToggle={handleTaskToggle} countdown={countdown}
                                  isPremium={!!profile.is_premium} onShowPremium={() => setShowPremium(true)} />,
    inventory:    <InventoryTab   profile={profile} />,
    achievements: <AchievementsTab profile={profile} />,
    social:       <SocialTab myId={session?.user?.id} myName={profile.name} />,
    guilds:       <GuildsTab myId={session?.user?.id} />,
  };

  return (
    <div style={{ width:"100%", height:"100%", position:"relative", overflow:"hidden" }}>
      <Background />

      {/* Premium modal */}
      {showPremium && <PremiumModal profile={profile} questLog={questLog} onClose={() => setShowPremium(false)} />}

      {/* Reset de senha */}
      {showPassReset && <PasswordResetModal onClose={() => setShowPassReset(false)} />}

      {/* Alertas */}
      <div style={{ position:"fixed", top: isMobile?50:70, right: isMobile?8:20, zIndex:9999,
        display:"flex", flexDirection:"column", gap:8, maxWidth: isMobile?"calc(100vw - 16px)":360 }}>
        {alerts.map(a => (
          <Alert key={a.id} message={a.msg} sub={a.sub} type={a.type}
            onClose={() => setAlerts(x => x.filter(i => i.id !== a.id))} />
        ))}
      </div>

      <div style={{ position:"relative", zIndex:1, height:"100%", display:"flex", flexDirection:"column" }}>

        {/* Top bar */}
        <div style={{ height:isMobile?44:52, background:"rgba(5,5,15,0.95)", borderBottom:"1px solid var(--border-dim)",
          display:"flex", alignItems:"center", padding: isMobile?"0 12px":"0 24px",
          backdropFilter:"blur(8px)", flexShrink:0 }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginRight:32 }}>
            <div style={{ width:28, height:28, borderRadius:3,
              background:"linear-gradient(135deg,var(--purple-dim),var(--blue-dim))",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:14, border:"1px solid rgba(155,93,229,0.4)",
              boxShadow:"0 0 12px rgba(155,93,229,0.3)" }}>⚔</div>
            <div style={{ fontFamily:"var(--font-title)", fontSize:13, fontWeight:700,
              color:"var(--text-bright)", letterSpacing:2, animation:"flicker 15s ease infinite" }}>SISTEMA</div>
          </div>

          {/* Abas — desktop only */}
          {!isMobile && (
            <div style={{ display:"flex", gap:2, flex:1 }}>
              {TABS_CFG.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  display:"flex", alignItems:"center", gap:7,
                  background: tab===t.id?"rgba(79,140,255,0.12)":"transparent",
                  border:"none", borderBottom:`2px solid ${tab===t.id?"var(--blue-core)":"transparent"}`,
                  color: tab===t.id?"var(--text-bright)":"var(--text-dim)",
                  padding:"0 16px", height:52, cursor:"pointer",
                  fontFamily:"var(--font-title)", fontSize:11, letterSpacing:1,
                  transition:"background 0.15s, color 0.15s",
                  WebkitTapHighlightColor:"transparent",
                }}>
                  <Icon name={t.icon} size={14} color={tab===t.id?"var(--blue-core)":undefined} />
                  {t.label}
                </button>
              ))}
            </div>
          )}
          {isMobile && <div style={{ flex:1 }} />}

          {/* Direita: relógio, alertas, rank, logout */}
          <div style={{ display:"flex", alignItems:"center", gap: isMobile?10:16 }}>
            {!isMobile && (
              <div style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-mono)" }}>{clock}</div>
            )}

            {/* Indicador online/offline */}
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:6, height:6, borderRadius:"50%",
                background: isOnline?"var(--green-core)":"var(--red-core)",
                boxShadow: isOnline?"0 0 6px var(--green-core)":"0 0 6px var(--red-core)" }} />
              {!isMobile && (
                <span style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)" }}>
                  {isOnline?"SYNC":"OFFLINE"}
                </span>
              )}
            </div>

            {/* Alertas */}
            {alerts.length > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <Icon name="bell" size={14} color="var(--gold-core)" />
                <span style={{ background:"var(--red-core)", color:"#fff", fontSize:9,
                  width:16, height:16, borderRadius:"50%",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--font-mono)", fontWeight:700 }}>{alerts.length}</span>
              </div>
            )}

            {/* Botão Premium */}
            {!profile.is_premium && (
              <button onClick={() => setShowPremium(true)} style={{ background:"linear-gradient(90deg,rgba(255,215,0,0.12),rgba(155,93,229,0.12))",
                border:"1px solid rgba(255,215,0,0.35)", color:"var(--gold-core)",
                padding:"4px 10px", borderRadius:3, cursor:"pointer",
                fontFamily:"var(--font-title)", fontSize:10, letterSpacing:1,
                WebkitTapHighlightColor:"transparent" }}>
                ⚜ {isMobile?"":"PREMIUM"}
              </button>
            )}

            {/* Rank */}
            {!isMobile && (
              <div style={{ background:"rgba(155,93,229,0.12)", border:"1px solid rgba(155,93,229,0.35)",
                color: RANK_COLORS[dispRank], padding:"4px 12px", borderRadius:3,
                fontFamily:"var(--font-title)", fontSize:11, fontWeight:700, letterSpacing:1,
                animation:"rank-glow 3s ease infinite" }}>RANK {dispRank}</div>
            )}

            {/* Logout */}
            <button onClick={handleLogout} title="Sair"
              style={{ background:"none", border:"none", color:"var(--text-dim)",
                cursor:"pointer", padding:4, display:"flex", alignItems:"center",
                WebkitTapHighlightColor:"transparent" }}>
              <Icon name="log-out" size={15} />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{ flex:1, overflow:"auto", padding: isMobile ? "12px 12px 72px" : 20 }}>
          {tabContent[tab]}
        </div>

        {/* Bottom bar — desktop */}
        {!isMobile && (
          <div style={{ height:28, background:"rgba(3,3,12,0.98)", borderTop:"1px solid var(--border-dim)",
            display:"flex", alignItems:"center", padding:"0 20px", gap:24, flexShrink:0 }}>
            <span style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)", letterSpacing:1 }}>SISTEMA v2.0.0</span>
            <span style={{ color: isOnline?"rgba(0,255,136,0.7)":"rgba(255,68,102,0.7)", fontSize:9, fontFamily:"var(--font-mono)" }}>
              ● {isOnline?"ONLINE":"OFFLINE"}
            </span>
            <span style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)" }}>
              CAÇADOR: {profile.name.toUpperCase()}
            </span>
            <span style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)" }}>LV.{profile.level}</span>
            <span style={{ flex:1 }} />
            <span style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)" }}>
              🔥 STREAK: {profile.streak} DIAS
            </span>
          </div>
        )}

        {/* Bottom nav — mobile */}
        {isMobile && (
          <div style={{ position:"fixed", bottom:0, left:0, right:0, height:58,
            background:"rgba(3,3,12,0.97)", borderTop:"1px solid var(--border-dim)",
            display:"flex", zIndex:200, backdropFilter:"blur(8px)" }}>
            {TABS_CFG.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex:1, height:"100%", background:"transparent", border:"none",
                borderTop:`2px solid ${tab===t.id?"var(--blue-core)":"transparent"}`,
                color: tab===t.id ? "var(--blue-core)" : "var(--text-dim)",
                cursor:"pointer", display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:3,
                transition:"background 0.15s, color 0.15s",
                WebkitTapHighlightColor:"transparent",
              }}>
                <Icon name={t.icon} size={18} color={tab===t.id?"var(--blue-core)":undefined} />
                <span style={{ fontFamily:"var(--font-title)", fontSize:8, letterSpacing:1 }}>{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
