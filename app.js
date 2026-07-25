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
  const [isOnline,   setIsOnline]   = useState(navigator.onLine);
  const [showPremium,      setShowPremium]     = useState(false);
  const [showPassReset,    setShowPassReset]   = useState(false);
  const [pendingPaymentId, setPendingPaymentId]= useState(null);
  const [dailyQuests,      setDailyQuests]     = useState(null);
  const [today,            setToday]           = useState(todayKey());
  const questLogRef  = React.useRef({});
  const syncTimerRef = React.useRef(null);

  questLogRef.current = questLog;

  // ── Virada do dia (re-render leve a cada 30s só quando a data muda) ──
  useEffect(() => {
    const iv = setInterval(() => {
      setToday(prev => { const now = todayKey(); return now !== prev ? now : prev; });
    }, 30000);
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
      syncToSupabase({ ...profile, quest_log: questLogRef.current }, session.user.id);
    }
  }, [isOnline]);

  // ── Missões diárias acompanham o rank efetivo (free trava no C) ──
  useEffect(() => {
    if (!profile) return;
    setDailyQuests(getQuestsForRank(effectiveQuestRank(profile)));
  }, [profile?.level, profile?.is_premium]);

  // ── Carregamento inicial ─────────────────────────────────────
  useEffect(() => {
    // Retorno do Mercado Pago: exige payment_id + status aprovado.
    // A ativação real é verificada no servidor (Edge Function).
    const params     = new URLSearchParams(window.location.search);
    const payId      = params.get("payment_id") || params.get("collection_id");
    const payStatus  = params.get("collection_status") || params.get("status") || params.get("payment_status");
    // Retorno do OAuth do Strava (?strava=1&code=...)
    const stravaFlag = params.get("strava");
    const stravaCode = params.get("code");
    if (payStatus || stravaFlag) {
      window.history.replaceState({}, document.title, window.location.pathname);
      if (payId && payStatus === "approved") {
        setPendingPaymentId(payId);
        setShowPremium(true);
      }
    }

    const applyLoaded = (raw, persist) => {
      const { profile: fixed, shieldUsed } = hydrateLoadedProfile(raw);
      setProfile(fixed);
      setQuestLog(fixed.quest_log || {});
      questLogRef.current = fixed.quest_log || {};
      if (persist) saveProfile(fixed);
      if (shieldUsed) setTimeout(() => addAlert("🛡 Escudo de Streak usado!", "Seu streak foi protegido automaticamente.", "warning"), 1500);
    };

    (async () => {
      const cached = loadProfile();
      if (cached) applyLoaded(cached, false);

      if (window.SUPABASE_OK) {
        const { data: { session: sess } } = await window.sb.auth.getSession();
        if (sess) {
          setSession(sess);
          if (stravaFlag === "1" && stravaCode) {
            const r = await stravaExchangeCode(stravaCode);
            if (r.error) setTimeout(() => addAlert("Strava: falha ao conectar", r.error, "warning"), 800);
            else setTimeout(() => addAlert("🏃 Strava conectado!", "Suas corridas agora podem ser verificadas pelo GPS.", "success"), 800);
          }
          const remote = await loadFromSupabase(sess.user.id);
          if (remote) {
            applyLoaded(remote, true);
          } else if (!cached) {
            setNeedsSetup(true);
          }
        } else if (!cached) {
          setShowAuth(true);
        }
        window.sb.auth.onAuthStateChange((event, sess) => {
          setSession(sess);
          if (event === "SIGNED_OUT") {
            setProfile(null); setQuestLog({});
            questLogRef.current = {};
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
    const currentIds  = computeCurrentAchievements(profile, questLog);
    const newlyEarned = currentIds.filter(id => !profile.achievements.includes(id));
    const lost        = profile.achievements.filter(id => !currentIds.includes(id));

    if (newlyEarned.length === 0 && lost.length === 0) return;

    const achById  = id => ALL_ACHIEVEMENTS.find(a => a.id === id);
    const gainedXP = newlyEarned.reduce((s, id) => s + (achById(id)?.xp || 0), 0);
    const lostXP   = lost.reduce((s, id) => s + (achById(id)?.xp || 0), 0);

    const newItems  = newlyEarned.flatMap(id => ACH_TO_ITEMS[id] || []);
    const newTitles = newItems
      .filter(id => INVENTORY_ITEMS.find(i => i.id===id && i.type==="Título"))
      .map(id => INVENTORY_ITEMS.find(i => i.id===id)?.name).filter(Boolean);

    const lostItems       = lost.flatMap(id => ACH_TO_ITEMS[id] || []);
    const keptByOtherAch  = currentIds.flatMap(id => ACH_TO_ITEMS[id] || []);
    const itemsToRemove   = lostItems.filter(item => !keptByOtherAch.includes(item));

    // Títulos acompanham a conquista: desfazer a conquista do dia
    // remove também o título que veio junto
    const removedTitleNames = itemsToRemove
      .map(id => INVENTORY_ITEMS.find(i => i.id === id))
      .filter(i => i && i.type === "Título")
      .map(i => i.name);

    setProfile(prev => {
      if (!prev) return prev;
      const newXP    = Math.max(0, prev.xp + gainedXP - lostXP);
      const newLevel = computeLevel(newXP).level;
      const newDates = { ...(prev.achievements_dates || {}) };
      newlyEarned.forEach(id => { newDates[id] = todayKey(); });
      lost.forEach(id => { delete newDates[id]; });
      return {
        ...prev,
        xp:                 newXP,
        level:              newLevel,
        stat_points:        adjustStatPoints(prev.stat_points, prev.level, newLevel, prev.is_premium),
        achievements:       currentIds,
        achievements_dates: newDates,
        inventory_items: [
          ...new Set([
            ...(prev.inventory_items || []).filter(i => !itemsToRemove.includes(i)),
            ...newItems,
          ])
        ],
        titles: [...new Set([
          ...prev.titles.filter(t => !removedTitleNames.includes(t)),
          ...newTitles,
        ])],
      };
    });

    newlyEarned.forEach(id => {
      const a = achById(id);
      if (a) addAlert(`Conquista: ${a.name}`, `+${a.xp} XP · ${a.grade}`, "success");
    });
    lost.forEach(id => {
      const a = achById(id);
      if (a && a.xp > 0) addAlert(`Conquista revertida: ${a.name}`, `-${a.xp} XP`, "warning");
    });
  }, [profile, questLog]);

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
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    if (isOnline && session) {
      syncTimerRef.current = setTimeout(() => syncToSupabase(merged, session.user.id), 2000);
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

  // ── Completar / desmarcar tarefa diária ──────────────────────
  // Modelo simétrico: marcar concede XP/ouro/atributo; desmarcar devolve
  // exatamente o que foi concedido (número gravado no log). Completar a
  // missão inteira concede o bônus + ouro da missão; desfazer remove.
  const handleTaskToggle = useCallback((questId, taskId, taskXP, taskStat) => {
    const day  = todayKey();
    const yest = yesterdayKey();
    const ql   = questLogRef.current;

    const rawVal   = (ql[day]?.[questId] || {})[taskId];
    const isDone   = _taskDone(rawVal);
    const storedXP = typeof rawVal === "number" ? rawVal : 0;

    const quest   = (dailyQuests || DAILY_QUESTS).find(q => q.id === questId);
    const grantXP = profile?.is_premium ? Math.round(taskXP * (1 + PREMIUM_XP_BONUS)) : taskXP;

    const newTaskVal = isDone ? false : grantXP;
    const newDayLog  = { ...(ql[day] || {}), [questId]: { ...((ql[day]?.[questId]) || {}), [taskId]: newTaskVal } };
    const newQL      = { ...ql, [day]: newDayLog };

    const wasComplete = quest ? quest.tasks.every(t => _taskDone((ql[day]?.[questId] || {})[t.id])) : false;
    const nowComplete = quest ? quest.tasks.every(t => _taskDone((newDayLog[questId] || {})[t.id])) : false;
    let bonusXPDelta = 0, bonusGoldDelta = 0;
    if (quest && !wasComplete && nowComplete)      { bonusXPDelta =  quest.bonusXP; bonusGoldDelta =  quest.gold; }
    else if (quest && wasComplete && !nowComplete) { bonusXPDelta = -quest.bonusXP; bonusGoldDelta = -quest.gold; }

    questLogRef.current = newQL;
    setQuestLog(newQL);

    setProfile(prev => {
      if (!prev) return prev;
      const xpDelta   = (isDone ? -storedXP : grantXP) + bonusXPDelta;
      const newXP     = Math.max(0, prev.xp + xpDelta);
      const newLevel  = computeLevel(newXP).level;
      const statDelta = isDone ? (storedXP > 0 ? -1 : 0) : 1;
      const goldDelta = (isDone ? (storedXP > 0 ? -Math.floor(taskXP / 5) : 0) : Math.floor(taskXP / 5)) + bonusGoldDelta;

      let newStreak = prev.streak, newLastActive = prev.last_active;
      if (!isDone && prev.last_active !== day) {
        newStreak     = prev.last_active === yest ? prev.streak + 1 : 1;
        newLastActive = day;
      }

      return {
        ...prev,
        xp:          newXP,
        level:       newLevel,
        stat_points: adjustStatPoints(prev.stat_points, prev.level, newLevel, prev.is_premium),
        stats:       { ...prev.stats, [taskStat]: Math.min(100, Math.max(10, (prev.stats[taskStat] || 10) + statDelta)) },
        streak:      newStreak,
        last_active: newLastActive,
        gold:        Math.max(0, prev.gold + goldDelta),
      };
    });

    if (quest && !wasComplete && nowComplete) {
      addAlert(`Missão completa: ${quest.title}`, `+${quest.bonusXP} XP bônus · +${quest.gold} G`, "success");
    }
  }, [profile?.is_premium, dailyQuests]);

  // ── Completar / desmarcar tarefa semanal (Premium) ───────────
  const handleWeeklyTaskToggle = useCallback((questId, taskId, taskXP, taskStat) => {
    const week = currentWeekKey();
    let completedNow = null;
    setProfile(prev => {
      if (!prev || !prev.is_premium) return prev;
      const wl       = prev.weekly_log || {};
      const rawVal   = ((wl[week] || {})[questId] || {})[taskId];
      const isDone   = _taskDone(rawVal);
      const storedXP = typeof rawVal === "number" ? rawVal : 0;
      const quest    = WEEKLY_QUESTS.find(q => q.id === questId);
      const grantXP  = Math.round(taskXP * (1 + PREMIUM_XP_BONUS));

      const newVal  = isDone ? false : grantXP;
      const newWeek = { ...(wl[week] || {}), [questId]: { ...((wl[week] || {})[questId]) || {}, [taskId]: newVal } };
      const newWL   = { ...wl, [week]: newWeek };

      const wasComplete = quest ? quest.tasks.every(t => _taskDone(((wl[week] || {})[questId] || {})[t.id])) : false;
      const nowComplete = quest ? quest.tasks.every(t => _taskDone((newWeek[questId] || {})[t.id])) : false;
      let bonusXP = 0, bonusGold = 0;
      if (quest && !wasComplete && nowComplete)      { bonusXP =  quest.bonusXP; bonusGold =  quest.gold; completedNow = quest; }
      else if (quest && wasComplete && !nowComplete) { bonusXP = -quest.bonusXP; bonusGold = -quest.gold; }

      const xpDelta   = (isDone ? -storedXP : grantXP) + bonusXP;
      const newXP     = Math.max(0, prev.xp + xpDelta);
      const newLevel  = computeLevel(newXP).level;
      const statDelta = isDone ? (storedXP > 0 ? -1 : 0) : 1;
      const goldDelta = (isDone ? (storedXP > 0 ? -Math.floor(taskXP / 5) : 0) : Math.floor(taskXP / 5)) + bonusGold;

      return {
        ...prev,
        weekly_log:  newWL,
        xp:          newXP,
        level:       newLevel,
        stat_points: adjustStatPoints(prev.stat_points, prev.level, newLevel, prev.is_premium),
        stats:       { ...prev.stats, [taskStat]: Math.min(100, Math.max(10, (prev.stats[taskStat] || 10) + statDelta)) },
        gold:        Math.max(0, prev.gold + goldDelta),
      };
    });
    setTimeout(() => {
      if (completedNow) addAlert(`Missão semanal completa: ${completedNow.title}`, `+${completedNow.bonusXP} XP bônus · +${completedNow.gold} G`, "success");
    }, 0);
  }, []);

  // ── Timer de tarefa (marca sozinha quando o tempo termina) ───
  const handleTimerComplete = useCallback((t) => {
    const ql   = questLogRef.current;
    const done = _taskDone((ql[todayKey()]?.[t.questId] || {})[t.taskId]);
    if (!done) handleTaskToggle(t.questId, t.taskId, t.taskXP, t.taskStat);
    addAlert("⏱ Tempo cumprido!", `${t.label} — tarefa concluída.`, "success");
  }, [handleTaskToggle, addAlert]);

  const taskTimer = useTaskTimer(handleTimerComplete);

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

  // ── Editar avatar (comprimido antes de salvar) ───────────────
  const handleAvatarEdit = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    processAvatarFile(file, (dataUrl) => {
      if (dataUrl) applyProfileUpdate({ avatar: dataUrl });
      else addAlert("Imagem inválida", "Não foi possível processar a imagem.", "warning");
    });
  }, []);

  // ── Auth ─────────────────────────────────────────────────────
  const handleAuth = useCallback(async (sess, isNew) => {
    setSession(sess);
    if (!sess || isNew) { setShowAuth(false); setNeedsSetup(true); return; }
    const remote = await loadFromSupabase(sess.user.id);
    if (remote) {
      const { profile: fixed, shieldUsed } = hydrateLoadedProfile(remote);
      setProfile(fixed);
      setQuestLog(fixed.quest_log || {});
      questLogRef.current = fixed.quest_log || {};
      saveProfile(fixed);
      setShowAuth(false);
      if (shieldUsed) setTimeout(() => addAlert("🛡 Escudo de Streak usado!", "Seu streak foi protegido automaticamente.", "warning"), 1500);
    } else {
      setShowAuth(false);
      setNeedsSetup(true);
    }
  }, []);

  const handleProfileSave = useCallback(async (newProfile) => {
    setProfile(newProfile);
    setQuestLog({});
    questLogRef.current = {};
    setDailyQuests(getQuestsForRank(effectiveQuestRank(newProfile)));
    saveProfile(newProfile);
    if (session) await syncToSupabase(newProfile, session.user.id);
    setNeedsSetup(false);
    addAlert(`Bem-vindo, ${newProfile.name}!`, "Sua jornada começa agora.", "success");
  }, [session]);

  // ── Premium confirmado pelo servidor → recarregar perfil ─────
  const handlePremiumActivated = useCallback(async () => {
    if (!session?.user?.id) return;
    const remote = await loadFromSupabase(session.user.id);
    if (remote?.is_premium) {
      setProfile(prev => prev ? {
        ...prev,
        is_premium:         true,
        premium_expires_at: remote.premium_expires_at,
        streak_shields:     Math.max(prev.streak_shields || 0, SHIELDS_PREMIUM),
      } : prev);
      addAlert("⚜ Premium Ativado!", "Todas as funcionalidades desbloqueadas.", "success");
    }
  }, [session]);

  const handleLogout = useCallback(async () => {
    if (window.sb) await window.sb.auth.signOut();
    localStorage.removeItem("sistema_profile");
    localStorage.removeItem("sistema_missions_xp");
    localStorage.removeItem("sistema_task_timer");
    taskTimer.cancel();
    setProfile(null); setQuestLog({}); setSession(null);
    questLogRef.current = {};
    setDailyQuests(null);
    setShowAuth(!!window.SUPABASE_OK);
    if (!window.SUPABASE_OK) setNeedsSetup(true);
  }, []);

  const weeklyProgress = useMemo(() => getWeeklyProgress(questLog), [questLog, today]);
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

  const trueRank  = getRankForLevel(profile.level);
  const dispRank  = profile.is_premium ? trueRank : (FREE_RANKS.includes(trueRank) ? trueRank : "C");
  const questRank = effectiveQuestRank(profile);

  const tabContent = {
    status:       <StatusTab      profile={profile} questLog={questLog} onAvatarEdit={handleAvatarEdit}
                                  onStatPoint={handleStatPoint} weeklyProgress={weeklyProgress}
                                  isPremium={!!profile.is_premium} xpLost={xpLost}
                                  onShowPremium={() => setShowPremium(true)}
                                  onNameEdit={handleNameEdit} />,
    skills:       <SkillsTab      profile={profile} />,
    quests:       <QuestsTab      questLog={questLog} onTaskToggle={handleTaskToggle}
                                  weeklyLog={profile.weekly_log || {}} onWeeklyToggle={handleWeeklyTaskToggle}
                                  isPremium={!!profile.is_premium} onShowPremium={() => setShowPremium(true)}
                                  quests={dailyQuests || DAILY_QUESTS} currentRank={questRank}
                                  taskTimer={taskTimer} />,
    inventory:    <InventoryTab   profile={profile} />,
    achievements: <AchievementsTab profile={profile} />,
    social:       <SocialTab myId={session?.user?.id} myName={profile.name}
                             myLevel={profile.level} myXP={profile.xp} myStreak={profile.streak} />,
    guilds:       <GuildsTab myId={session?.user?.id} />,
  };

  return (
    <div style={{ width:"100%", height:"100%", position:"relative", overflow:"hidden" }}>
      <Background />

      {showPremium && (
        <PremiumModal
          profile={profile}
          questLog={questLog}
          userId={session?.user?.id}
          userEmail={session?.user?.email}
          onClose={() => { setShowPremium(false); setPendingPaymentId(null); }}
          onPremiumActivated={handlePremiumActivated}
          pendingPaymentId={pendingPaymentId}
        />
      )}

      {showPassReset && <PasswordResetModal onClose={() => setShowPassReset(false)} />}

      <div style={{ position:"fixed", top: isMobile?50:70, right: isMobile?8:20, zIndex:9999,
        display:"flex", flexDirection:"column", gap:8, maxWidth: isMobile?"calc(100vw - 16px)":360 }}>
        {alerts.map(a => (
          <Alert key={a.id} message={a.msg} sub={a.sub} type={a.type}
            onClose={() => setAlerts(x => x.filter(i => i.id !== a.id))} />
        ))}
      </div>

      <div style={{ position:"relative", zIndex:1, height:"100%", display:"flex", flexDirection:"column" }}>

        <div style={{ height:isMobile?44:52, background:"rgba(5,5,15,0.95)", borderBottom:"1px solid var(--border-dim)",
          display:"flex", alignItems:"center", padding: isMobile?"0 12px":"0 24px",
          backdropFilter:"blur(8px)", flexShrink:0 }}>

          <div style={{ display:"flex", alignItems:"center", gap:12, marginRight:32 }}>
            <div style={{ width:28, height:28, borderRadius:3,
              background:"linear-gradient(135deg,var(--purple-dim),var(--blue-dim))",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:14, border:"1px solid rgba(155,93,229,0.4)",
              boxShadow:"0 0 12px rgba(155,93,229,0.3)" }}>⚔</div>
            <div style={{ fontFamily:"var(--font-title)", fontSize:13, fontWeight:700,
              color:"var(--text-bright)", letterSpacing:2, animation:"flicker 15s ease infinite" }}>SISTEMA</div>
          </div>

          {!isMobile && (
            <div style={{ display:"flex", gap:2, flex:1 }}>
              {TABS_CFG.map(t => (
                <button key={t.id}
                  onClick={() => setTab(t.id)}
                  onMouseDown={e => e.preventDefault()}
                  style={{
                    display:"flex", alignItems:"center", gap:7, position:"relative",
                    background: tab===t.id?"rgba(79,140,255,0.12)":"transparent",
                    border:"none",
                    color: tab===t.id?"var(--text-bright)":"var(--text-dim)",
                    padding:"0 16px", height:52, cursor:"pointer",
                    fontFamily:"var(--font-title)", fontSize:11, letterSpacing:1,
                    transition:"background 0.15s, color 0.15s",
                    WebkitTapHighlightColor:"transparent", outline:"none",
                  }}>
                  <Icon name={t.icon} size={14} color={tab===t.id?"var(--blue-core)":undefined} />
                  {t.label}
                  {tab===t.id && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"var(--blue-core)", pointerEvents:"none" }} />}
                </button>
              ))}
            </div>
          )}
          {isMobile && <div style={{ flex:1 }} />}

          <div style={{ display:"flex", alignItems:"center", gap: isMobile?10:16 }}>
            {!isMobile && <Clock />}

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

            {alerts.length > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <Icon name="bell" size={14} color="var(--gold-core)" />
                <span style={{ background:"var(--red-core)", color:"#fff", fontSize:9,
                  width:16, height:16, borderRadius:"50%",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--font-mono)", fontWeight:700 }}>{alerts.length}</span>
              </div>
            )}

            {!profile.is_premium && (
              <button onClick={() => setShowPremium(true)} style={{ background:"linear-gradient(90deg,rgba(255,215,0,0.12),rgba(155,93,229,0.12))",
                border:"1px solid rgba(255,215,0,0.35)", color:"var(--gold-core)",
                padding:"4px 10px", borderRadius:3, cursor:"pointer",
                fontFamily:"var(--font-title)", fontSize:10, letterSpacing:1,
                WebkitTapHighlightColor:"transparent" }}>
                ⚜ {isMobile?"":"PREMIUM"}
              </button>
            )}

            {!isMobile && (
              <div style={{ background:"rgba(155,93,229,0.12)", border:"1px solid rgba(155,93,229,0.35)",
                color: RANK_COLORS[dispRank], padding:"4px 12px", borderRadius:3,
                fontFamily:"var(--font-title)", fontSize:11, fontWeight:700, letterSpacing:1,
                animation:"rank-glow 3s ease infinite" }}>RANK {dispRank}</div>
            )}

            <button onClick={handleLogout} title="Sair"
              style={{ background:"none", border:"none", color:"var(--text-dim)",
                cursor:"pointer", padding:4, display:"flex", alignItems:"center",
                WebkitTapHighlightColor:"transparent" }}>
              <Icon name="log-out" size={15} />
            </button>
          </div>
        </div>

        <div style={{ flex:1, overflow:"auto", padding: isMobile ? "12px 12px 72px" : 20 }}>
          {tabContent[tab]}
        </div>

        {!isMobile && (
          <div style={{ height:28, background:"rgba(3,3,12,0.98)", borderTop:"1px solid var(--border-dim)",
            display:"flex", alignItems:"center", padding:"0 20px", gap:24, flexShrink:0 }}>
            <span style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)", letterSpacing:1 }}>SISTEMA v2.1.0</span>
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

        {isMobile && (
          <div style={{ position:"fixed", bottom:0, left:0, right:0, height:58,
            background:"rgba(3,3,12,0.97)", borderTop:"1px solid var(--border-dim)",
            display:"flex", zIndex:200, backdropFilter:"blur(8px)" }}>
            {TABS_CFG.map(t => (
              <button key={t.id}
                onClick={() => setTab(t.id)}
                onMouseDown={e => e.preventDefault()}
                style={{
                  flex:1, height:"100%", background:"transparent", border:"none",
                  color: tab===t.id ? "var(--blue-core)" : "var(--text-dim)",
                  cursor:"pointer", display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center", gap:3, position:"relative",
                  transition:"color 0.15s",
                  WebkitTapHighlightColor:"transparent", outline:"none",
                }}>
                {tab===t.id && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"var(--blue-core)", pointerEvents:"none" }} />}
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
