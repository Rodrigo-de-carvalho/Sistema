// ── guilds.js — Sistema de Guildas ───────────────────────────────
const { useState: useGSt, useEffect: useGEff, useRef: useGRef, useCallback: useGCb } = React;

// ── Supabase helpers ──────────────────────────────────────────────

async function sbGetMyGuild(myId) {
  if (!window.sb || !myId) return null;
  const { data } = await window.sb.from("guild_members")
    .select("guild_id")
    .eq("user_id", myId)
    .maybeSingle();
  if (!data) return null;
  return data.guild_id;
}

async function sbGetGuild(guildId) {
  if (!window.sb || !guildId) return null;
  const { data } = await window.sb.from("guilds")
    .select("*")
    .eq("id", guildId)
    .single();
  return data || null;
}

async function sbGetGuildMembers(guildId) {
  if (!window.sb || !guildId) return [];
  const { data: members } = await window.sb.from("guild_members")
    .select("user_id, joined_at")
    .eq("guild_id", guildId);
  if (!members || !members.length) return [];
  const ids = members.map(m => m.user_id);
  const { data: profiles } = await window.sb.from("profiles")
    .select("id,name,level,xp,streak")
    .in("id", ids);
  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
  return members.map(m => ({ ...m, ...(profileMap[m.user_id] || {}) }));
}

async function sbSearchGuilds(query) {
  if (!window.sb) return [];
  const { data } = await window.sb.from("guilds")
    .select("id,name,description,owner_id")
    .ilike("name", `%${query.trim()}%`)
    .limit(20);
  return data || [];
}

async function sbGetTopGuilds() {
  if (!window.sb) return [];
  const { data: guilds } = await window.sb.from("guilds")
    .select("id,name,description")
    .limit(30);
  if (!guilds || !guilds.length) return [];
  const results = await Promise.all(guilds.map(async g => {
    const { data: members } = await window.sb.from("guild_members")
      .select("user_id")
      .eq("guild_id", g.id);
    const ids = (members || []).map(m => m.user_id);
    let totalXP = 0;
    if (ids.length) {
      const { data: profs } = await window.sb.from("profiles")
        .select("xp")
        .in("id", ids);
      totalXP = (profs || []).reduce((s, p) => s + (p.xp || 0), 0);
    }
    return { ...g, memberCount: ids.length, totalXP };
  }));
  return results.sort((a, b) => b.totalXP - a.totalXP);
}

async function sbCreateGuild(myId, name, description) {
  if (!window.sb) return { error: "offline" };
  const { data, error } = await window.sb.from("guilds")
    .insert({ name: name.trim(), description: description.trim(), owner_id: myId })
    .select()
    .single();
  if (error) return { error: error.message };
  await window.sb.from("guild_members").insert({ guild_id: data.id, user_id: myId });
  return { guildId: data.id };
}

async function sbJoinGuild(guildId, myId) {
  if (!window.sb) return { error: "offline" };
  const { data: members } = await window.sb.from("guild_members")
    .select("id")
    .eq("guild_id", guildId);
  if ((members || []).length >= 20) return { error: "Guilda cheia (máx. 20 membros)" };
  const { error } = await window.sb.from("guild_members")
    .insert({ guild_id: guildId, user_id: myId });
  return { error: error?.message };
}

async function sbLeaveGuild(guildId, myId) {
  if (!window.sb) return;
  await window.sb.from("guild_members")
    .delete()
    .eq("guild_id", guildId)
    .eq("user_id", myId);
}

async function sbGetGuildMessages(guildId) {
  if (!window.sb || !guildId) return [];
  const { data } = await window.sb.from("guild_messages")
    .select("*")
    .eq("guild_id", guildId)
    .order("created_at", { ascending: true })
    .limit(100);
  return data || [];
}

async function sbSendGuildMessage(guildId, senderId, content) {
  if (!window.sb) return { error: "offline" };
  const { error } = await window.sb.from("guild_messages")
    .insert({ guild_id: guildId, sender_id: senderId, content });
  return { error: error?.message };
}

// ── GuildChat ─────────────────────────────────────────────────────

function GuildChat({ guildId, myId, members }) {
  const [messages, setMessages] = useGSt([]);
  const [text, setText] = useGSt("");
  const [sending, setSending] = useGSt(false);
  const bottomRef = useGRef(null);
  const channelRef = useGRef(null);
  const isMobile = useIsMobile();

  const nameOf = id => {
    const m = members.find(m => m.user_id === id || m.id === id);
    return m ? (m.name || "…") : "…";
  };

  useGEff(() => {
    sbGetGuildMessages(guildId).then(setMessages);

    if (window.sb) {
      const ch = window.sb.channel(`guild_chat_${guildId}`)
        .on("postgres_changes", {
          event: "INSERT", schema: "public", table: "guild_messages",
          filter: `guild_id=eq.${guildId}`,
        }, payload => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new].slice(-100);
          });
        })
        .subscribe();
      channelRef.current = ch;
    }

    return () => {
      if (channelRef.current) {
        window.sb?.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [guildId]);

  useGEff(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const content = text.trim().slice(0, 500);
    if (!content || sending) return;
    setSending(true);
    setText("");
    await sbSendGuildMessage(guildId, myId, content);
    setSending(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height: isMobile ? "calc(100vh - 200px)" : 420 }}>
      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"8px 0", display:"flex", flexDirection:"column", gap:7 }}>
        {messages.length === 0 && (
          <div style={{ textAlign:"center", color:"var(--text-dim)", fontSize:12, marginTop:24 }}>
            Nenhuma mensagem ainda. Seja o primeiro!
          </div>
        )}
        {messages.map(m => {
          const isMe = m.sender_id === myId;
          return (
            <div key={m.id} style={{ display:"flex", flexDirection: isMe ? "row-reverse" : "row",
              alignItems:"flex-end", gap:7 }}>
              {!isMe && (
                <div style={{ width:24, height:24, borderRadius:"50%", flexShrink:0,
                  background:"rgba(155,93,229,0.2)", border:"1px solid rgba(155,93,229,0.4)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:9, fontFamily:"var(--font-title)", color:"#9b5de5" }}>
                  {nameOf(m.sender_id).slice(0,1).toUpperCase()}
                </div>
              )}
              <div style={{ maxWidth:"70%" }}>
                {!isMe && (
                  <div style={{ fontSize:10, color:"var(--text-dim)", marginBottom:2, paddingLeft:2 }}>
                    {nameOf(m.sender_id)}
                  </div>
                )}
                <div style={{
                  padding:"7px 11px", borderRadius: isMe ? "10px 10px 4px 10px" : "10px 10px 10px 4px",
                  background: isMe ? "rgba(79,140,255,0.2)" : "rgba(255,255,255,0.06)",
                  border:`1px solid ${isMe ? "rgba(79,140,255,0.25)" : "rgba(255,255,255,0.07)"}`,
                  color:"var(--text-bright)", fontSize:13, lineHeight:"1.4", wordBreak:"break-word",
                }}>
                  {m.content}
                  <div style={{ fontSize:9, color:"var(--text-dim)", marginTop:3,
                    textAlign: isMe ? "right" : "left" }}>
                    {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop:"1px solid var(--border-dim)", paddingTop:10,
        display:"flex", gap:8, alignItems:"flex-end" }}>
        <textarea value={text} onChange={e => setText(e.target.value.slice(0, 500))}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Mensagem para a guilda…" rows={1}
          style={{
            flex:1, background:"rgba(255,255,255,0.05)",
            border:"1px solid var(--border-dim)", borderRadius:7,
            color:"var(--text-bright)", fontSize:13, padding:"7px 11px",
            resize:"none", fontFamily:"inherit", lineHeight:"1.4", maxHeight:72, overflowY:"auto",
          }} />
        <button onClick={handleSend} disabled={!text.trim() || sending} style={{
          background: text.trim() ? "var(--blue-core)" : "rgba(79,140,255,0.2)",
          border:"none", borderRadius:7, cursor: text.trim() ? "pointer" : "not-allowed",
          color:"white", padding:"7px 13px", fontSize:11, fontFamily:"var(--font-title)",
          letterSpacing:1, flexShrink:0,
        }}>
          {sending ? "…" : "ENVIAR"}
        </button>
      </div>
      <div style={{ fontSize:10, color:"var(--text-dim)", textAlign:"right", paddingTop:3 }}>
        {text.length}/500
      </div>
    </div>
  );
}

// ── GuildsTab ─────────────────────────────────────────────────────

function GuildsTab({ myId }) {
  const [myGuildId,  setMyGuildId]  = useGSt(null);
  const [guild,      setGuild]      = useGSt(null);
  const [members,    setMembers]    = useGSt([]);
  const [topGuilds,  setTopGuilds]  = useGSt([]);
  const [searchQ,    setSearchQ]    = useGSt("");
  const [searchRes,  setSearchRes]  = useGSt([]);
  const [innerTab,   setInnerTab]   = useGSt("membros");
  const [creating,   setCreating]   = useGSt(false);
  const [newName,    setNewName]    = useGSt("");
  const [newDesc,    setNewDesc]    = useGSt("");
  const [loading,    setLoading]    = useGSt(false);
  const [error,      setError]      = useGSt("");
  const [searching,  setSearching]  = useGSt(false);
  const isMobile = useIsMobile();

  const reload = useGCb(async () => {
    if (!myId) return;
    const gid = await sbGetMyGuild(myId);
    setMyGuildId(gid);
    if (gid) {
      const [g, ms] = await Promise.all([sbGetGuild(gid), sbGetGuildMembers(gid)]);
      setGuild(g);
      setMembers(ms);
    } else {
      setGuild(null);
      setMembers([]);
      sbGetTopGuilds().then(setTopGuilds);
    }
  }, [myId]);

  useGEff(() => { reload(); }, [myId]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setLoading(true); setError("");
    const res = await sbCreateGuild(myId, newName, newDesc);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setCreating(false); setNewName(""); setNewDesc("");
    await reload();
  }

  async function handleJoin(guildId) {
    setLoading(true); setError("");
    const res = await sbJoinGuild(guildId, myId);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    await reload();
  }

  async function handleLeave() {
    if (!window.confirm("Sair da guilda?")) return;
    setLoading(true);
    await sbLeaveGuild(myGuildId, myId);
    setLoading(false);
    await reload();
  }

  async function handleSearch() {
    if (!searchQ.trim()) return;
    setSearching(true);
    const res = await sbSearchGuilds(searchQ);
    setSearchRes(res);
    setSearching(false);
  }

  if (!myId) {
    return (
      <div style={{ padding:32, textAlign:"center", color:"var(--text-dim)" }}>
        <Icon name="shield" size={40} />
        <div style={{ marginTop:12, fontFamily:"var(--font-title)", fontSize:14 }}>
          Faça login para acessar as Guildas
        </div>
      </div>
    );
  }

  const innerTabBtn = (id, label) => (
    <button key={id} onClick={() => setInnerTab(id)} style={{
      flex:1, padding:"8px 4px", border:"none", cursor:"pointer",
      background: innerTab===id ? "rgba(155,93,229,0.15)" : "transparent",
      boxShadow: innerTab===id ? "inset 0 -2px 0 #9b5de5" : "none",
      color: innerTab===id ? "var(--text-bright)" : "var(--text-dim)",
      fontFamily:"var(--font-title)", fontSize:11, letterSpacing:1,
      transition:"none", outline:"none",
    }}>{label}</button>
  );

  // ── Dentro da guilda ──────────────────────────────────────────
  if (myGuildId && guild) {
    const guildXP = members.reduce((s, m) => s + (m.xp || 0), 0);
    return (
      <div style={{ padding: isMobile ? "12px 8px" : "16px 24px", maxWidth:720, margin:"0 auto" }}>
        {/* Guild header */}
        <div style={{ background:"rgba(155,93,229,0.07)", border:"1px solid rgba(155,93,229,0.25)",
          borderRadius:10, padding:"14px 18px", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:8, flexShrink:0,
              background:"linear-gradient(135deg,rgba(155,93,229,0.3),rgba(79,140,255,0.2))",
              border:"2px solid rgba(155,93,229,0.5)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
              ⚔
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:"var(--text-bright)", fontFamily:"var(--font-title)",
                fontSize:16, fontWeight:700 }}>{guild.name}</div>
              {guild.description && (
                <div style={{ color:"var(--text-dim)", fontSize:12, marginTop:3 }}>{guild.description}</div>
              )}
              <div style={{ display:"flex", gap:16, marginTop:6 }}>
                <div style={{ color:"var(--text-dim)", fontSize:11 }}>
                  👥 {members.length}/20 membros
                </div>
                <div style={{ color:"var(--gold-core)", fontSize:11 }}>
                  ✨ {guildXP.toLocaleString()} XP total
                </div>
              </div>
            </div>
            <button onClick={handleLeave} disabled={loading} style={{
              background:"rgba(255,68,68,0.1)", border:"1px solid rgba(255,68,68,0.3)",
              borderRadius:7, cursor:"pointer", color:"rgba(255,68,68,0.8)",
              padding:"6px 12px", fontSize:10, fontFamily:"var(--font-title)", letterSpacing:1,
            }}>
              SAIR
            </button>
          </div>
        </div>

        {/* Inner tabs */}
        <div style={{ display:"flex", background:"rgba(0,0,0,0.3)", borderRadius:8,
          border:"1px solid var(--border-dim)", overflow:"hidden", marginBottom:14 }}>
          {innerTabBtn("membros", "MEMBROS")}
          {innerTabBtn("chat", "CHAT")}
        </div>

        {/* Membros */}
        {innerTab === "membros" && (
          <div>
            {[...members]
              .sort((a, b) => (b.xp || 0) - (a.xp || 0))
              .map((m, i) => {
                const rank = getRankForLevel(m.level || 1);
                const rankColor = RANK_COLORS[rank] || "#8899cc";
                const isOwner = m.user_id === guild.owner_id || m.id === guild.owner_id;
                return (
                  <div key={m.user_id || m.id} style={{
                    display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                    background: m.user_id === myId || m.id === myId
                      ? "rgba(79,140,255,0.07)" : "rgba(255,255,255,0.02)",
                    border:`1px solid ${m.user_id === myId || m.id === myId
                      ? "rgba(79,140,255,0.2)" : "rgba(255,255,255,0.05)"}`,
                    borderRadius:8, marginBottom:5,
                  }}>
                    <div style={{ width:22, textAlign:"center", fontFamily:"var(--font-title)",
                      color: i < 3 ? ["#ffd700","#c0c0c0","#cd7f32"][i] : "var(--text-dim)",
                      fontSize:12 }}>
                      {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                    </div>
                    <div style={{
                      width:30, height:30, borderRadius:"50%", flexShrink:0,
                      background:`linear-gradient(135deg,${rankColor}33,transparent)`,
                      border:`2px solid ${rankColor}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:"var(--font-title)", fontSize:10, fontWeight:700, color: rankColor,
                    }}>{rank}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:"var(--text-bright)", fontFamily:"var(--font-title)",
                        fontSize:12, display:"flex", alignItems:"center", gap:5 }}>
                        {m.name || "…"}
                        {isOwner && <span style={{ fontSize:9, color:"#ffd700" }}>👑 LIDER</span>}
                        {(m.user_id === myId || m.id === myId) && (
                          <span style={{ fontSize:9, color:"var(--blue-core)" }}>você</span>
                        )}
                      </div>
                      <div style={{ color:"var(--text-dim)", fontSize:10 }}>
                        Nível {m.level||1} · 🔥{m.streak||0} · {(m.xp||0).toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Chat */}
        {innerTab === "chat" && (
          <GuildChat guildId={myGuildId} myId={myId} members={members} />
        )}
      </div>
    );
  }

  // ── Sem guilda ────────────────────────────────────────────────
  return (
    <div style={{ padding: isMobile ? "12px 8px" : "16px 24px", maxWidth:720, margin:"0 auto" }}>
      {error && (
        <div style={{ background:"rgba(255,68,68,0.1)", border:"1px solid rgba(255,68,68,0.3)",
          borderRadius:8, padding:"10px 14px", color:"#ff6666", fontSize:12, marginBottom:12 }}>
          {error}
        </div>
      )}

      {/* Create guild */}
      <div style={{ background:"rgba(155,93,229,0.07)", border:"1px solid rgba(155,93,229,0.2)",
        borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
        {!creating ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ color:"var(--text-bright)", fontFamily:"var(--font-title)",
                fontSize:13, fontWeight:600 }}>Criar uma Guilda</div>
              <div style={{ color:"var(--text-dim)", fontSize:11, marginTop:2 }}>
                Forme seu grupo e conquiste juntos
              </div>
            </div>
            <button onClick={() => setCreating(true)} style={{
              background:"linear-gradient(135deg,rgba(155,93,229,0.3),rgba(79,140,255,0.2))",
              border:"1px solid rgba(155,93,229,0.5)", borderRadius:8, cursor:"pointer",
              color:"var(--text-bright)", padding:"8px 16px", fontFamily:"var(--font-title)",
              fontSize:11, letterSpacing:1,
            }}>
              + CRIAR
            </button>
          </div>
        ) : (
          <div>
            <div style={{ color:"var(--text-bright)", fontFamily:"var(--font-title)",
              fontSize:13, marginBottom:10 }}>Nova Guilda</div>
            <input value={newName} onChange={e => setNewName(e.target.value.slice(0, 40))}
              placeholder="Nome da guilda (obrigatório)"
              style={{ width:"100%", boxSizing:"border-box", marginBottom:8,
                background:"rgba(255,255,255,0.05)", border:"1px solid var(--border-dim)",
                borderRadius:7, color:"var(--text-bright)", fontSize:13, padding:"8px 12px",
                fontFamily:"inherit" }} />
            <input value={newDesc} onChange={e => setNewDesc(e.target.value.slice(0, 120))}
              placeholder="Descrição (opcional)"
              style={{ width:"100%", boxSizing:"border-box", marginBottom:10,
                background:"rgba(255,255,255,0.05)", border:"1px solid var(--border-dim)",
                borderRadius:7, color:"var(--text-bright)", fontSize:13, padding:"8px 12px",
                fontFamily:"inherit" }} />
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={handleCreate} disabled={!newName.trim() || loading} style={{
                background: newName.trim() ? "rgba(155,93,229,0.3)" : "rgba(155,93,229,0.1)",
                border:"1px solid rgba(155,93,229,0.5)", borderRadius:7, cursor:"pointer",
                color:"var(--text-bright)", padding:"8px 18px", fontFamily:"var(--font-title)",
                fontSize:11, letterSpacing:1, opacity: newName.trim() ? 1 : 0.5,
              }}>
                {loading ? "…" : "CRIAR GUILDA"}
              </button>
              <button onClick={() => { setCreating(false); setError(""); }} style={{
                background:"none", border:"1px solid var(--border-dim)", borderRadius:7,
                cursor:"pointer", color:"var(--text-dim)", padding:"8px 14px",
                fontFamily:"var(--font-title)", fontSize:11,
              }}>CANCELAR</button>
            </div>
          </div>
        )}
      </div>

      {/* Search guilds */}
      <div style={{ marginBottom:16 }}>
        <div style={{ color:"var(--text-dim)", fontFamily:"var(--font-title)", fontSize:11,
          letterSpacing:2, marginBottom:8 }}>BUSCAR GUILDA</div>
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Nome da guilda…"
            style={{ flex:1, background:"rgba(255,255,255,0.05)",
              border:"1px solid var(--border-dim)", borderRadius:8,
              color:"var(--text-bright)", fontSize:13, padding:"8px 12px", fontFamily:"inherit" }} />
          <button onClick={handleSearch} disabled={searching || !searchQ.trim()} style={{
            background:"var(--blue-core)", border:"none", borderRadius:8, cursor:"pointer",
            color:"white", padding:"8px 16px", fontFamily:"var(--font-title)",
            fontSize:11, letterSpacing:1, opacity: searchQ.trim() ? 1 : 0.5,
          }}>
            {searching ? "…" : "BUSCAR"}
          </button>
        </div>

        {searchRes.map(g => (
          <div key={g.id} style={{
            display:"flex", alignItems:"center", gap:10, padding:"11px 13px",
            background:"rgba(255,255,255,0.03)", border:"1px solid var(--border-dim)",
            borderRadius:8, marginBottom:6,
          }}>
            <div style={{ width:36, height:36, borderRadius:8, flexShrink:0,
              background:"rgba(155,93,229,0.15)", border:"1px solid rgba(155,93,229,0.3)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>⚔</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:"var(--text-bright)", fontFamily:"var(--font-title)", fontSize:13 }}>
                {g.name}
              </div>
              {g.description && (
                <div style={{ color:"var(--text-dim)", fontSize:11, overflow:"hidden",
                  textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.description}</div>
              )}
            </div>
            <button disabled={loading} onClick={() => handleJoin(g.id)} style={{
              background:"rgba(155,93,229,0.15)", border:"1px solid rgba(155,93,229,0.4)",
              borderRadius:6, cursor:"pointer", color:"#9b5de5",
              padding:"6px 12px", fontFamily:"var(--font-title)", fontSize:10, letterSpacing:1,
            }}>
              {loading ? "…" : "ENTRAR"}
            </button>
          </div>
        ))}
      </div>

      {/* Top guilds */}
      <div>
        <div style={{ color:"var(--text-dim)", fontFamily:"var(--font-title)", fontSize:11,
          letterSpacing:2, marginBottom:8 }}>🏆 TOP GUILDAS</div>
        {topGuilds.length === 0 ? (
          <div style={{ textAlign:"center", color:"var(--text-dim)", fontSize:12, padding:"20px 0" }}>
            Nenhuma guilda ainda. Crie a primeira!
          </div>
        ) : (
          topGuilds.slice(0, 10).map((g, i) => (
            <div key={g.id} style={{
              display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
              background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)",
              borderRadius:8, marginBottom:5,
            }}>
              <div style={{ width:24, textAlign:"center", fontFamily:"var(--font-title)",
                color: i < 3 ? ["#ffd700","#c0c0c0","#cd7f32"][i] : "var(--text-dim)",
                fontSize:12 }}>
                {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
              </div>
              <div style={{ width:32, height:32, borderRadius:6, flexShrink:0,
                background:"rgba(155,93,229,0.15)", border:"1px solid rgba(155,93,229,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⚔</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:"var(--text-bright)", fontFamily:"var(--font-title)", fontSize:12 }}>
                  {g.name}
                </div>
                <div style={{ color:"var(--text-dim)", fontSize:10 }}>
                  {g.memberCount} membros · {g.totalXP.toLocaleString()} XP
                </div>
              </div>
              <button disabled={loading} onClick={() => handleJoin(g.id)} style={{
                background:"rgba(155,93,229,0.1)", border:"1px solid rgba(155,93,229,0.3)",
                borderRadius:5, cursor:"pointer", color:"rgba(155,93,229,0.9)",
                padding:"4px 9px", fontFamily:"var(--font-title)", fontSize:9, letterSpacing:1,
              }}>
                ENTRAR
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
