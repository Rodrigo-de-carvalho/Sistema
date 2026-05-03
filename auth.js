// ── auth.js — tela de login/registro e setup de perfil ───────────

function AuthScreen({ onAuth }) {
  const [mode, setMode]       = React.useState("login"); // "login" | "register"
  const [email, setEmail]     = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError]     = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 4,
    background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-dim)",
    color: "var(--text-bright)", fontFamily: "var(--font-ui)", fontSize: 14,
    outline: "none", transition: "border-color 0.2s",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await window.sb.auth.signInWithPassword({ email, password });
      } else {
        result = await window.sb.auth.signUp({ email, password });
      }
      if (result.error) { setError(result.error.message); setLoading(false); return; }
      onAuth(result.data.session, mode === "register");
    } catch (err) {
      setError("Erro de conexão. Verifique sua internet.");
      setLoading(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
      <Background />
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:400, padding:"0 20px",
        animation:"auth-fade-in 0.4s ease" }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:56, height:56, borderRadius:8, margin:"0 auto 16px",
            background:"linear-gradient(135deg,var(--purple-dim),var(--blue-dim))",
            border:"1px solid rgba(155,93,229,0.5)", boxShadow:"0 0 30px rgba(155,93,229,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>⚔</div>
          <div style={{ fontFamily:"var(--font-title)", fontSize:20, fontWeight:700,
            color:"var(--text-bright)", letterSpacing:3, animation:"flicker 15s ease infinite" }}>SISTEMA</div>
          <div style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-mono)",
            letterSpacing:2, marginTop:6 }}>PRODUTIVIDADE GAMIFICADA</div>
        </div>

        {/* Card */}
        <div style={{ background:"rgba(7,7,20,0.95)", border:"1px solid var(--border-dim)", borderRadius:8,
          padding:28, boxShadow:"0 0 40px rgba(79,140,255,0.08)", animation:"pulse-border 4s ease infinite" }}>

          {/* Tabs */}
          <div style={{ display:"flex", marginBottom:24, borderBottom:"1px solid var(--border-dim)" }}>
            {["login","register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex:1, padding:"8px 0", background:"none", border:"none",
                borderBottom: `2px solid ${mode===m?"var(--blue-core)":"transparent"}`,
                color: mode===m ? "var(--text-bright)" : "var(--text-dim)",
                fontFamily:"var(--font-title)", fontSize:11, letterSpacing:2, cursor:"pointer",
                transition:"all 0.15s", textTransform:"uppercase",
              }}>{m === "login" ? "Entrar" : "Registrar"}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)",
                letterSpacing:1, display:"block", marginBottom:6 }}>EMAIL</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="seu@email.com" required style={inputStyle}
                onFocus={e=>e.target.style.borderColor="var(--blue-core)"}
                onBlur={e=>e.target.style.borderColor="var(--border-dim)"} />
            </div>
            <div>
              <label style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)",
                letterSpacing:1, display:"block", marginBottom:6 }}>SENHA</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="mínimo 6 caracteres" required minLength={6} style={inputStyle}
                onFocus={e=>e.target.style.borderColor="var(--blue-core)"}
                onBlur={e=>e.target.style.borderColor="var(--border-dim)"} />
            </div>

            {error && (
              <div style={{ color:"var(--red-core)", fontSize:11, fontFamily:"var(--font-ui)",
                background:"rgba(255,68,102,0.08)", border:"1px solid rgba(255,68,102,0.25)",
                borderRadius:4, padding:"8px 12px" }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              padding:"11px 0", borderRadius:4, border:"1px solid rgba(79,140,255,0.4)",
              background: loading ? "rgba(79,140,255,0.05)" : "rgba(79,140,255,0.12)",
              color: loading ? "var(--text-dim)" : "var(--blue-glow)",
              fontFamily:"var(--font-title)", fontSize:12, letterSpacing:2,
              cursor: loading ? "default" : "pointer", transition:"all 0.15s",
            }}>
              {loading ? "AGUARDE..." : mode === "login" ? "ENTRAR NO SISTEMA" : "CRIAR CONTA"}
            </button>
          </form>
        </div>

        {/* Modo offline */}
        <div style={{ textAlign:"center", marginTop:20 }}>
          <button onClick={() => onAuth(null, true)} style={{
            background:"none", border:"none", color:"var(--text-dim)", fontSize:11,
            fontFamily:"var(--font-mono)", cursor:"pointer", textDecoration:"underline",
          }}>Continuar sem conta (dados locais apenas)</button>
        </div>
      </div>
    </div>
  );
}

function ProfileSetup({ onSave }) {
  const [name, setName]     = React.useState("");
  const [avatar, setAvatar] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 800000) { alert("Imagem muito grande. Use menos de 800KB."); return; }
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    setLoading(true);
    const profile = { ...DEFAULT_PROFILE, name: name.trim(), avatar };
    onSave(profile);
  };

  const inputRef = React.useRef();

  return (
    <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <Background />
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:380, padding:"0 20px",
        animation:"auth-fade-in 0.4s ease" }}>
        <div style={{ background:"rgba(7,7,20,0.97)", border:"1px solid var(--border-dim)", borderRadius:8, padding:32 }}>
          <div style={{ color:"var(--text-dim)", fontSize:10, letterSpacing:3, fontFamily:"var(--font-title)", marginBottom:24 }}>
            CONFIGURAR PERFIL
          </div>

          {/* Avatar */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:24 }}>
            <div onClick={()=>inputRef.current?.click()} style={{ cursor:"pointer", position:"relative" }}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width:80, height:80, borderRadius:6, objectFit:"cover",
                    border:"2px solid rgba(155,93,229,0.5)" }} />
                : <div style={{ width:80, height:80, borderRadius:6,
                    background:"linear-gradient(135deg,#0a0a2a,#1a1040)",
                    border:"2px dashed rgba(155,93,229,0.4)",
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <Icon name="camera" size={24} color="var(--purple-glow)" />
                    <span style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)" }}>FOTO</span>
                  </div>}
            </div>
            <input ref={inputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
            <span style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)", marginTop:8 }}>Clique para adicionar foto</span>
          </div>

          {/* Nome */}
          <div style={{ marginBottom:20 }}>
            <label style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:1, display:"block", marginBottom:8 }}>
              SEU NOME DE CAÇADOR
            </label>
            <input value={name} onChange={e=>setName(e.target.value)}
              placeholder="ex: João Silva" maxLength={24}
              style={{ width:"100%", padding:"10px 14px", borderRadius:4,
                background:"rgba(255,255,255,0.04)", border:"1px solid var(--border-dim)",
                color:"var(--text-bright)", fontFamily:"var(--font-ui)", fontSize:15 }}
              onFocus={e=>e.target.style.borderColor="var(--blue-core)"}
              onBlur={e=>e.target.style.borderColor="var(--border-dim)"} />
          </div>

          <button onClick={handleSave} disabled={!name.trim() || loading} style={{
            width:"100%", padding:"11px 0", borderRadius:4,
            border:"1px solid rgba(155,93,229,0.4)",
            background: name.trim() ? "rgba(155,93,229,0.12)" : "rgba(255,255,255,0.03)",
            color: name.trim() ? "var(--purple-glow)" : "var(--text-dim)",
            fontFamily:"var(--font-title)", fontSize:12, letterSpacing:2, cursor: name.trim()?"pointer":"default",
          }}>
            {loading ? "SALVANDO..." : "INICIAR JORNADA"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PremiumGate({ onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:500,
      display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }}>
      <div style={{ background:"rgba(7,7,20,0.98)", border:"1px solid rgba(255,215,0,0.3)", borderRadius:8,
        padding:36, maxWidth:420, width:"90%", textAlign:"center", animation:"badge-unlock 0.4s ease" }}>
        <div style={{ fontSize:40, marginBottom:16, animation:"streak-flame 2s ease infinite" }}>⚜</div>
        <div style={{ fontFamily:"var(--font-title)", fontSize:18, fontWeight:700,
          color:"var(--gold-core)", letterSpacing:2, marginBottom:8 }}>RANKS B, A e S</div>
        <div style={{ color:"var(--text-dim)", fontSize:10, letterSpacing:3, fontFamily:"var(--font-mono)", marginBottom:20 }}>
          CONTEÚDO PREMIUM
        </div>
        <div style={{ color:"var(--text-mid)", fontSize:13, fontFamily:"var(--font-body)", lineHeight:1.7, marginBottom:28 }}>
          Você alcançou o limite do plano gratuito.<br/>
          Os Ranks <strong style={{color:"var(--purple-glow)"}}>B</strong>,{" "}
          <strong style={{color:"var(--gold-core)"}}>A</strong> e{" "}
          <strong style={{color:"#ff66dd"}}>S</strong> desbloqueiam missões avançadas,
          habilidades exclusivas e recompensas especiais.
        </div>
        <div style={{ background:"rgba(255,215,0,0.06)", border:"1px solid rgba(255,215,0,0.2)",
          borderRadius:6, padding:"12px 20px", marginBottom:24 }}>
          <div style={{ color:"var(--gold-core)", fontSize:12, fontFamily:"var(--font-title)", letterSpacing:1, marginBottom:6 }}>
            EM BREVE
          </div>
          <div style={{ color:"var(--text-mid)", fontSize:12, fontFamily:"var(--font-body)" }}>
            Plano Premium com acesso completo ao Sistema
          </div>
        </div>
        <button onClick={onClose} style={{ padding:"10px 32px", borderRadius:4,
          border:"1px solid var(--border-dim)", background:"transparent",
          color:"var(--text-dim)", fontFamily:"var(--font-title)", fontSize:11,
          letterSpacing:2, cursor:"pointer" }}>CONTINUAR NO RANK C</button>
      </div>
    </div>
  );
}
