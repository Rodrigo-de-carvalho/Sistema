// ── social.js — Sistema de Amigos, Ranking e Chat ────────────────
const { useState: useSt, useEffect: useEff, useRef, useCallback: useCb } = React;

// ── Supabase helpers ──────────────────────────────────────────────

async function sbSearchUsers(query) {
  if (!window.sb || !query.trim()) return [];
  const { data } = await window.sb.from("profiles")
    .select("id,name,level,xp,streak")
    .ilike("name", `%${query.trim()}%`)
    .limit(20);
  return data || [];
}

async function sbGetFriendships(myId) {
  if (!window.sb || !myId) return [];
  const { data } = await window.sb.from("friendships")
    .select("*")
    .or(`user_id.eq.${myId},friend_id.eq.${myId}`);
  return data || [];
}

async function sbGetProfiles(ids) {
  if (!window.sb || !ids.length) return [];
  const { data } = await window.sb.from("profiles")
    .select("id,name,level,xp,streak")
    .in("id", ids);
  return data || [];
}

async function sbGetGlobalRanking() {
  if (!window.sb) return [];
  const { data } = await window.sb.from("profiles")
    .select("id,name,level,xp,streak")
    .order("xp", { ascending: false })
    .limit(50);
  return data || [];
}

async function sbSendFriendRequest(myId, targetId) {
  if (!window.sb) return { error: "offline" };
  const { error } = await window.sb.from("friendships")
    .insert({ user_id: myId, friend_id: targetId, status: "pending" });
  return { error: error?.message };
}

async function sbRespondFriendRequest(id, accept) {
  if (!window.sb) return;
  if (accept) {
    await window.sb.from("friendships").update({ status: "accepted" }).eq("id", id);
  } else {
    await window.sb.from("friendships").delete().eq("id", id);
  }
}

async function sbRemoveFriend(id) {
  if (!window.sb) return;
  await window.sb.from("friendships").delete().eq("id", id);
}

async function sbGetMessages(myId, friendId) {
  if (!window.sb) return [];
  const { data } = await window.sb.from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${myId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${myId})`
    )
    .order("created_at", { ascending: true })
    .limit(100);
  return data || [];
}

async function sbSendChatMessage(myId, friendId, content) {
  if (!window.sb) return { error: "offline" };
  const { error } = await window.sb.from("messages")
    .insert({ sender_id: myId, receiver_id: friendId, content });
  return { error: error?.message };
}

// ── Rank helpers ──────────────────────────────────────────────────

function getRankColor(level) {
  const rank = getRankForLevel(level);
  return RANK_COLORS[rank] || "#8899cc";
}

// ── ChatModal ─────────────────────────────────────────────────────

function ChatModal({ myId, friend, onClose }) {
  const [messages, setMessages] = useSt([]);
  const [text,     setText]     = useSt("");
  const [sending,  setSending]  = useSt(false);
  const bottomRef = useRef(null);
  const channelRef = useRef(null);
  const isMobile = useIsMobile();

  useEff(() => {
    sbGetMessages(myId, friend.id).then(setMessages);

    if (window.sb) {
      const ch = window.sb.channel(`chat_${[myId, friend.id].sort().join("_")}`)
        .on("postgres_changes", {
          event: "INSERT", schema: "public", table: "messages",
          filter: `or(and(sender_id.eq.${myId},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${myId}))`,
        }, payload => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            const next = [...prev, payload.new];
            return next.slice(-100);
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
  }, [myId, friend.id]);

  useEff(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const content = text.trim().slice(0, 500);
    if (!content || sending) return;
    setSending(true);
    setText("");
    await sbSendChatMessage(myId, friend.id, content);
    setSending(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const rankColor = getRankColor(friend.level || 1);
  const rank = getRankForLevel(friend.level || 1);

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:9000,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding: isMobile ? 0 : 20,
    }}>
      <div style={{
        background:"var(--bg-panel)", border:"1px solid var(--border-dim)",
        borderRadius: isMobile ? 0 : 12,
        width: isMobile ? "100%" : 480,
        height: isMobile ? "100%" : 580,
        display:"flex", flexDirection:"column",
        boxShadow:"0 0 40px rgba(79,140,255,0.15)",
      }}>
        {/* Header */}
        <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border-dim)",
          display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:36, height:36, borderRadius:"50%",
            background:`linear-gradient(135deg,${rankColor}33,${rankColor}22)`,
            border:`2px solid ${rankColor}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"var(--font-title)", fontSize:13, fontWeight:700, color: rankColor,
          }}>{rank}</div>
          <div style={{ flex:1 }}>
            <div style={{ color:"var(--text-bright)", fontFamily:"var(--font-title)", fontSize:14, fontWeight:600 }}>
              {friend.name}
            </div>
            <div style={{ color:"var(--text-dim)", fontSize:11 }}>
              Nível {friend.level || 1} · Streak {friend.streak || 0}🔥
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer",
            color:"var(--text-dim)", padding:6, borderRadius:6 }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }}>
          {messages.length === 0 && (
            <div style={{ textAlign:"center", color:"var(--text-dim)", fontSize:12, marginTop:40 }}>
              Nenhuma mensagem ainda. Diga olá!
            </div>
          )}
          {messages.map(m => {
            const isMe = m.sender_id === myId;
            return (
              <div key={m.id} style={{ display:"flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth:"75%", padding:"8px 12px", borderRadius: isMe ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                  background: isMe ? "rgba(79,140,255,0.25)" : "rgba(255,255,255,0.07)",
                  border: `1px solid ${isMe ? "rgba(79,140,255,0.3)" : "rgba(255,255,255,0.08)"}`,
                  color:"var(--text-bright)", fontSize:13, lineHeight:"1.4",
                  wordBreak:"break-word",
                }}>
                  {m.content}
                  <div style={{ fontSize:10, color:"var(--text-dim)", marginTop:4, textAlign: isMe ? "right" : "left" }}>
                    {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding:"12px 16px", borderTop:"1px solid var(--border-dim)",
          display:"flex", gap:8, alignItems:"flex-end" }}>
          <textarea value={text} onChange={e => setText(e.target.value.slice(0, 500))}
            onKeyDown={handleKey} placeholder="Mensagem… (Enter para enviar)"
            rows={1} style={{
              flex:1, background:"rgba(255,255,255,0.05)",
              border:"1px solid var(--border-dim)", borderRadius:8,
              color:"var(--text-bright)", fontSize:13, padding:"8px 12px",
              resize:"none", fontFamily:"inherit", lineHeight:"1.4",
              maxHeight:80, overflowY:"auto",
            }} />
          <button onClick={handleSend} disabled={!text.trim() || sending} style={{
            background: text.trim() ? "var(--blue-core)" : "rgba(79,140,255,0.2)",
            border:"none", borderRadius:8, cursor: text.trim() ? "pointer" : "not-allowed",
            color:"white", padding:"8px 14px", fontSize:12, fontFamily:"var(--font-title)",
            letterSpacing:1, flexShrink:0,
          }}>
            {sending ? "…" : "ENVIAR"}
          </button>
        </div>
        <div style={{ textAlign:"right", fontSize:10, color:"var(--text-dim)", padding:"0 16px 8px" }}>
          {text.length}/500
        </div>
      </div>
    </div>
  );
}

// ── RankingRow ────────────────────────────────────────────────────

function RankingRow({ pos, user, myId, onChat }) {
  const rank = getRankForLevel(user.level || 1);
  const rankColor = getRankColor(user.level || 1);
  const isMe = user.id === myId;

  return (
    <div style={{
      display:"flex", alignItems:"center", gap:12, padding:"10px 14px",
      background: isMe ? "rgba(79,140,255,0.08)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isMe ? "rgba(79,140,255,0.2)" : "rgba(255,255,255,0.05)"}`,
      borderRadius:8, marginBottom:6,
    }}>
      <div style={{
        width:28, textAlign:"center", fontFamily:"var(--font-title)", fontWeight:700,
        fontSize:13, color: pos <= 3 ? ["#ffd700","#c0c0c0","#cd7f32"][pos-1] : "var(--text-dim)",
      }}>
        {pos <= 3 ? ["🥇","🥈","🥉"][pos-1] : `#${pos}`}
      </div>
      <div style={{
        width:32, height:32, borderRadius:"50%",
        background:`linear-gradient(135deg,${rankColor}33,${rankColor}22)`,
        border:`2px solid ${rankColor}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"var(--font-title)", fontSize:11, fontWeight:700, color: rankColor, flexShrink:0,
      }}>{rank}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color: isMe ? "var(--blue-core)" : "var(--text-bright)",
          fontFamily:"var(--font-title)", fontSize:13, fontWeight:600,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {user.name}{isMe ? " (você)" : ""}
        </div>
        <div style={{ color:"var(--text-dim)", fontSize:11 }}>
          Nível {user.level || 1} · {(user.xp || 0).toLocaleString()} XP
        </div>
      </div>
      <div style={{ textAlign:"right", flexShrink:0 }}>
        <div style={{ color:"var(--gold-core)", fontSize:12, fontFamily:"var(--font-mono)" }}>
          🔥 {user.streak || 0}
        </div>
        {onChat && !isMe && (
          <button onClick={() => onChat(user)} style={{
            background:"rgba(79,140,255,0.15)", border:"1px solid rgba(79,140,255,0.3)",
            borderRadius:5, cursor:"pointer", color:"var(--blue-core)",
            fontSize:10, padding:"2px 7px", marginTop:4, fontFamily:"var(--font-title)",
          }}>
            <Icon name="message-circle" size={11} /> CHAT
          </button>
        )}
      </div>
    </div>
  );
}

// ── SocialTab ─────────────────────────────────────────────────────

function SocialTab({ myId, myName }) {
  const [subTab,       setSubTab]       = useSt("amigos");
  const [friendships,  setFriendships]  = useSt([]);
  const [profiles,     setProfiles]     = useSt({});
  const [globalRank,   setGlobalRank]   = useSt([]);
  const [searchQ,      setSearchQ]      = useSt("");
  const [searchRes,    setSearchRes]    = useSt([]);
  const [searching,    setSearching]    = useSt(false);
  const [rankSubTab,   setRankSubTab]   = useSt("global");
  const [chatFriend,   setChatFriend]   = useSt(null);
  const [actionLoading, setActionLoading] = useSt({});
  const isMobile = useIsMobile();

  const loadFriendships = useCb(async () => {
    if (!myId) return;
    const fs = await sbGetFriendships(myId);
    setFriendships(fs);
    const ids = [...new Set(fs.flatMap(f => [f.user_id, f.friend_id]).filter(id => id !== myId))];
    if (ids.length) {
      const profs = await sbGetProfiles(ids);
      setProfiles(prev => {
        const map = { ...prev };
        profs.forEach(p => { map[p.id] = p; });
        return map;
      });
    }
  }, [myId]);

  useEff(() => {
    loadFriendships();
    sbGetGlobalRanking().then(setGlobalRank);
  }, [myId]);

  const accepted = friendships.filter(f => f.status === "accepted");
  const pending  = friendships.filter(f => f.status === "pending");
  const received = pending.filter(f => f.friend_id === myId);
  const sent     = pending.filter(f => f.user_id   === myId);

  const friendProfiles = accepted.map(f => {
    const fid = f.user_id === myId ? f.friend_id : f.user_id;
    return profiles[fid] ? { ...profiles[fid], _fid: f.id } : null;
  }).filter(Boolean);

  const friendIds = new Set(friendProfiles.map(fp => fp.id));
  const pendingIds = new Set(pending.map(f => f.user_id === myId ? f.friend_id : f.user_id));

  async function handleSearch() {
    if (!searchQ.trim()) return;
    setSearching(true);
    const res = await sbSearchUsers(searchQ);
    setSearchRes(res);
    setSearching(false);
  }

  async function handleFriendAction(type, id, targetId) {
    setActionLoading(prev => ({ ...prev, [targetId || id]: true }));
    if (type === "send") {
      await sbSendFriendRequest(myId, targetId);
    } else if (type === "accept") {
      await sbRespondFriendRequest(id, true);
    } else if (type === "reject" || type === "cancel") {
      await sbRespondFriendRequest(id, false);
    } else if (type === "remove") {
      await sbRemoveFriend(id);
    }
    await loadFriendships();
    setActionLoading(prev => ({ ...prev, [targetId || id]: false }));
  }

  const subTabBtn = (id, label, count) => (
    <button key={id}
      onMouseDown={e => e.preventDefault()}
      onClick={() => setSubTab(id)}
      style={{
        flex:1, padding:"8px 4px", border:"none", cursor:"pointer",
        background: subTab===id ? "rgba(79,140,255,0.15)" : "transparent",
        boxShadow: subTab===id ? "inset 0 -2px 0 var(--blue-core)" : "none",
        color: subTab===id ? "var(--text-bright)" : "var(--text-dim)",
        fontFamily:"var(--font-title)", fontSize:11, letterSpacing:1,
        display:"flex", alignItems:"center", justifyContent:"center", gap:5,
        transition:"none", outline:"none",
      }}>
      {label}
      {count > 0 && (
        <span style={{ background:"var(--blue-core)", color:"white",
          borderRadius:"50%", width:16, height:16, fontSize:9,
          display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
          {count}
        </span>
      )}
    </button>
  );

  if (!myId) {
    return (
      <div style={{ padding:32, textAlign:"center", color:"var(--text-dim)" }}>
        <Icon name="users" size={40} />
        <div style={{ marginTop:12, fontFamily:"var(--font-title)", fontSize:14 }}>
          Faça login para acessar o Social
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "12px 8px" : "16px 24px", maxWidth:720, margin:"0 auto" }}>
      {chatFriend && (
        <ChatModal myId={myId} friend={chatFriend} onClose={() => setChatFriend(null)} />
      )}

      {/* Sub-tabs */}
      <div style={{ display:"flex", background:"rgba(0,0,0,0.3)", borderRadius:8,
        border:"1px solid var(--border-dim)", overflow:"hidden", marginBottom:16 }}>
        {subTabBtn("amigos", "AMIGOS", received.length)}
        {subTabBtn("ranking", "RANKING", 0)}
        {subTabBtn("buscar", "BUSCAR", 0)}
      </div>

      {/* ── AMIGOS ── */}
      {subTab === "amigos" && (
        <div>
          {/* Solicitações recebidas */}
          {received.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ color:"var(--blue-core)", fontFamily:"var(--font-title)", fontSize:11,
                letterSpacing:2, marginBottom:8 }}>SOLICITAÇÕES RECEBIDAS</div>
              {received.map(f => {
                const u = profiles[f.user_id];
                const loading = actionLoading[f.user_id];
                return (
                  <div key={f.id} style={{
                    display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                    background:"rgba(79,140,255,0.07)", border:"1px solid rgba(79,140,255,0.2)",
                    borderRadius:8, marginBottom:6,
                  }}>
                    <div style={{ flex:1 }}>
                      <div style={{ color:"var(--text-bright)", fontFamily:"var(--font-title)", fontSize:13 }}>
                        {u ? u.name : "…"}
                      </div>
                      {u && <div style={{ color:"var(--text-dim)", fontSize:11 }}>
                        Nível {u.level || 1} · {getRankForLevel(u.level || 1)}
                      </div>}
                    </div>
                    <button disabled={loading} onClick={() => handleFriendAction("accept", f.id, f.user_id)}
                      style={{ background:"rgba(0,255,136,0.15)", border:"1px solid #00ff88",
                        color:"#00ff88", borderRadius:6, padding:"5px 10px", cursor:"pointer",
                        fontSize:11, fontFamily:"var(--font-title)" }}>
                      ACEITAR
                    </button>
                    <button disabled={loading} onClick={() => handleFriendAction("reject", f.id, f.user_id)}
                      style={{ background:"rgba(255,68,68,0.1)", border:"1px solid rgba(255,68,68,0.4)",
                        color:"#ff4444", borderRadius:6, padding:"5px 10px", cursor:"pointer",
                        fontSize:11, fontFamily:"var(--font-title)" }}>
                      RECUSAR
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Solicitações enviadas */}
          {sent.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ color:"var(--text-dim)", fontFamily:"var(--font-title)", fontSize:11,
                letterSpacing:2, marginBottom:8 }}>SOLICITAÇÕES ENVIADAS</div>
              {sent.map(f => {
                const u = profiles[f.friend_id];
                return (
                  <div key={f.id} style={{
                    display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
                    background:"rgba(255,255,255,0.03)", border:"1px solid var(--border-dim)",
                    borderRadius:8, marginBottom:6,
                  }}>
                    <div style={{ flex:1, color:"var(--text-dim)", fontSize:13 }}>
                      {u ? u.name : "…"} <span style={{ fontSize:10 }}>· aguardando</span>
                    </div>
                    <button onClick={() => handleFriendAction("cancel", f.id, f.friend_id)}
                      style={{ background:"none", border:"1px solid rgba(255,68,68,0.3)",
                        color:"rgba(255,68,68,0.7)", borderRadius:6, padding:"4px 9px", cursor:"pointer",
                        fontSize:10, fontFamily:"var(--font-title)" }}>
                      CANCELAR
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Lista de amigos */}
          <div style={{ color:"var(--text-dim)", fontFamily:"var(--font-title)", fontSize:11,
            letterSpacing:2, marginBottom:8 }}>
            AMIGOS ({friendProfiles.length})
          </div>
          {friendProfiles.length === 0 ? (
            <div style={{ textAlign:"center", color:"var(--text-dim)", fontSize:12, padding:"32px 0" }}>
              Nenhum amigo ainda. Use a aba BUSCAR para encontrar jogadores!
            </div>
          ) : (
            friendProfiles.map(fp => (
              <div key={fp.id} style={{
                display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                background:"rgba(255,255,255,0.03)", border:"1px solid var(--border-dim)",
                borderRadius:8, marginBottom:6,
              }}>
                <div style={{
                  width:32, height:32, borderRadius:"50%", flexShrink:0,
                  background:`linear-gradient(135deg,${getRankColor(fp.level||1)}33,transparent)`,
                  border:`2px solid ${getRankColor(fp.level||1)}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--font-title)", fontSize:11, fontWeight:700,
                  color: getRankColor(fp.level||1),
                }}>{getRankForLevel(fp.level||1)}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:"var(--text-bright)", fontFamily:"var(--font-title)", fontSize:13,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {fp.name}
                  </div>
                  <div style={{ color:"var(--text-dim)", fontSize:11 }}>
                    Nível {fp.level||1} · 🔥{fp.streak||0}
                  </div>
                </div>
                <button onClick={() => setChatFriend(fp)} style={{
                  background:"rgba(79,140,255,0.15)", border:"1px solid rgba(79,140,255,0.3)",
                  borderRadius:6, cursor:"pointer", color:"var(--blue-core)",
                  padding:"5px 10px", fontFamily:"var(--font-title)", fontSize:10,
                  display:"flex", alignItems:"center", gap:5,
                }}>
                  <Icon name="message-circle" size={12} /> CHAT
                </button>
                <button onClick={() => handleFriendAction("remove", fp._fid, fp.id)}
                  title="Remover amigo"
                  style={{ background:"none", border:"1px solid rgba(255,68,68,0.2)",
                    borderRadius:6, cursor:"pointer", color:"rgba(255,68,68,0.5)",
                    padding:"5px 8px", fontSize:10 }}>
                  <Icon name="x" size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── RANKING ── */}
      {subTab === "ranking" && (
        <div>
          {/* Global / Entre amigos */}
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {["global","amigos"].map(k => (
              <button key={k}
                onMouseDown={e => e.preventDefault()}
                onClick={() => setRankSubTab(k)}
                style={{
                  flex:1, padding:"7px",
                  border:`1px solid ${rankSubTab===k?"var(--blue-core)":"var(--border-dim)"}`,
                  background: rankSubTab===k ? "rgba(79,140,255,0.12)" : "transparent",
                  borderRadius:7, cursor:"pointer",
                  color: rankSubTab===k ? "var(--blue-core)" : "var(--text-dim)",
                  fontFamily:"var(--font-title)", fontSize:11, letterSpacing:1,
                  transition:"none", outline:"none",
                }}>
                {k === "global" ? "🌐 GLOBAL" : "👥 ENTRE AMIGOS"}
              </button>
            ))}
          </div>

          {rankSubTab === "global" ? (
            <div>
              <div style={{ color:"var(--text-dim)", fontSize:11, marginBottom:10 }}>
                Top 50 jogadores por XP
              </div>
              {globalRank.map((u, i) => (
                <RankingRow key={u.id} pos={i+1} user={u} myId={myId}
                  onChat={friendIds.has(u.id) ? setChatFriend : null} />
              ))}
            </div>
          ) : (
            <div>
              <div style={{ color:"var(--text-dim)", fontSize:11, marginBottom:10 }}>
                Ranking entre seus amigos
              </div>
              {friendProfiles.length === 0 ? (
                <div style={{ textAlign:"center", color:"var(--text-dim)", fontSize:12, padding:"32px 0" }}>
                  Adicione amigos para ver o ranking entre vocês!
                </div>
              ) : (
                [...friendProfiles, { id: myId, name: myName || "Você", level: 1, xp: 0, streak: 0 }]
                  .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                  .map((u, i) => (
                    <RankingRow key={u.id} pos={i+1} user={u} myId={myId}
                      onChat={u.id !== myId ? () => setChatFriend(u) : null} />
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ── BUSCAR ── */}
      {subTab === "buscar" && (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Buscar jogador pelo nome…"
              style={{
                flex:1, background:"rgba(255,255,255,0.05)",
                border:"1px solid var(--border-dim)", borderRadius:8,
                color:"var(--text-bright)", fontSize:13, padding:"9px 14px",
                fontFamily:"inherit",
              }} />
            <button onClick={handleSearch} disabled={searching || !searchQ.trim()} style={{
              background:"var(--blue-core)", border:"none", borderRadius:8, cursor:"pointer",
              color:"white", padding:"9px 18px", fontFamily:"var(--font-title)",
              fontSize:11, letterSpacing:1, opacity: searchQ.trim() ? 1 : 0.5,
            }}>
              {searching ? "…" : "BUSCAR"}
            </button>
          </div>

          {searchRes.map(u => {
            const isSelf   = u.id === myId;
            const isFriend = friendIds.has(u.id);
            const isPending = pendingIds.has(u.id);
            const loading  = actionLoading[u.id];
            const rank = getRankForLevel(u.level || 1);
            const rankColor = getRankColor(u.level || 1);

            return (
              <div key={u.id} style={{
                display:"flex", alignItems:"center", gap:10, padding:"11px 13px",
                background:"rgba(255,255,255,0.03)", border:"1px solid var(--border-dim)",
                borderRadius:8, marginBottom:7,
              }}>
                <div style={{
                  width:32, height:32, borderRadius:"50%", flexShrink:0,
                  background:`linear-gradient(135deg,${rankColor}33,transparent)`,
                  border:`2px solid ${rankColor}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--font-title)", fontSize:11, fontWeight:700, color: rankColor,
                }}>{rank}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:"var(--text-bright)", fontFamily:"var(--font-title)", fontSize:13 }}>
                    {u.name}{isSelf ? " (você)" : ""}
                  </div>
                  <div style={{ color:"var(--text-dim)", fontSize:11 }}>
                    Nível {u.level||1} · {(u.xp||0).toLocaleString()} XP
                  </div>
                </div>
                {!isSelf && (
                  isFriend ? (
                    <span style={{ color:"#00ff88", fontSize:11, fontFamily:"var(--font-title)" }}>✓ AMIGO</span>
                  ) : isPending ? (
                    <span style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-title)" }}>PENDENTE</span>
                  ) : (
                    <button disabled={loading} onClick={() => handleFriendAction("send", null, u.id)} style={{
                      background:"rgba(0,255,136,0.1)", border:"1px solid rgba(0,255,136,0.4)",
                      borderRadius:6, cursor:"pointer", color:"#00ff88",
                      padding:"5px 12px", fontFamily:"var(--font-title)", fontSize:10, letterSpacing:1,
                    }}>
                      {loading ? "…" : "+ ADICIONAR"}
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
