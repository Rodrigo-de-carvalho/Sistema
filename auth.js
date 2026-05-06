// ── auth.js — tela de login/registro e setup de perfil ───────────

function AuthScreen({ onAuth }) {
  const [mode,          setMode]         = React.useState("login");
  const [email,         setEmail]        = React.useState("");
  const [password,      setPassword]     = React.useState("");
  const [error,         setError]        = React.useState("");
  const [loading,       setLoading]      = React.useState(false);
  const [googleLoading, setGoogleLoading]= React.useState(false);
  const [emailSent,     setEmailSent]    = React.useState(false);

  const isMobile = useIsMobile();

  const inputStyle = {
    width:"100%", padding:"11px 14px", borderRadius:4,
    background:"rgba(255,255,255,0.04)", border:"1px solid var(--border-dim)",
    color:"var(--text-bright)", fontFamily:"var(--font-body)", fontSize:14,
    outline:"none", transition:"border-color 0.2s",
  };

  const handleGoogle = async () => {
    setError(""); setGoogleLoading(true);
    try {
      const { error } = await window.sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) { setError(error.message); setGoogleLoading(false); }
    } catch {
      setError("Erro ao conectar com Google.");
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError("Digite seu email antes de recuperar a senha."); return; }
    const { error } = await window.sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setError(error ? error.message : "✓ Link de recuperação enviado para " + email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message === "Invalid login credentials"
            ? "Email ou senha incorretos." : error.message);
          setLoading(false); return;
        }
        onAuth(data.session, false);
      } else {
        const { data, error } = await window.sb.auth.signUp({ email, password });
        if (error) { setError(error.message); setLoading(false); return; }
        if (data.session) {
          onAuth(data.session, true);
        } else {
          setEmailSent(true);
        }
      }
    } catch {
      setError("Erro de conexão. Verifique sua internet.");
    }
    setLoading(false);
  };

  // ── Tela "verifique seu email" ──
  if (emailSent) return (
    <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center",
      justifyContent:"center", zIndex:100 }}>
      <Background />
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:400,
        padding:"0 20px", textAlign:"center", animation:"auth-fade-in 0.4s ease" }}>
        <div style={{ fontSize:52, marginBottom:20 }}>📧</div>
        <div style={{ fontFamily:"var(--font-title)", fontSize:18, color:"var(--text-bright)",
          letterSpacing:3, marginBottom:14 }}>VERIFIQUE SEU EMAIL</div>
        <div style={{ color:"var(--text-mid)", fontFamily:"var(--font-body)", fontSize:13,
          lineHeight:1.8, marginBottom:28 }}>
          Enviamos um link de confirmação para<br/>
          <strong style={{ color:"var(--blue-glow)" }}>{email}</strong><br/>
          Clique no link para ativar sua conta e entrar.
        </div>
        <button onClick={() => setEmailSent(false)} style={{
          background:"none", border:"1px solid var(--border-dim)", color:"var(--text-dim)",
          padding:"8px 24px", borderRadius:4, cursor:"pointer",
          fontFamily:"var(--font-title)", fontSize:11, letterSpacing:1,
          WebkitTapHighlightColor:"transparent",
        }}>← VOLTAR</button>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center",
      justifyContent:"center", zIndex:100 }}>
      <Background />
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:420,
        padding: isMobile ? "0 16px" : "0 20px",
        animation:"auth-fade-in 0.4s ease", maxHeight:"100vh", overflow:"auto" }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:24, paddingTop:16 }}>
          <div style={{ width:56, height:56, borderRadius:8, margin:"0 auto 14px",
            background:"linear-gradient(135deg,var(--purple-dim),var(--blue-dim))",
            border:"1px solid rgba(155,93,229,0.5)", boxShadow:"0 0 30px rgba(155,93,229,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>⚔</div>
          <div style={{ fontFamily:"var(--font-title)", fontSize:22, fontWeight:700,
            color:"var(--text-bright)", letterSpacing:3, animation:"flicker 15s ease infinite" }}>SISTEMA</div>
          <div style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)",
            letterSpacing:2, marginTop:6 }}>PRODUTIVIDADE GAMIFICADA</div>
        </div>

        {/* Card */}
        <div style={{ background:"rgba(7,7,20,0.97)", border:"1px solid var(--border-dim)",
          borderRadius:8, padding: isMobile ? 20 : 28,
          boxShadow:"0 0 40px rgba(79,140,255,0.08)", animation:"pulse-border 4s ease infinite" }}>

          {/* Tabs */}
          <div style={{ display:"flex", marginBottom:22, borderBottom:"1px solid var(--border-dim)" }}>
            {[["login","Entrar"],["register","Criar conta"]].map(([m, label]) => (
              <button key={m}
                onClick={() => { setMode(m); setError(""); }}
                onMouseDown={e => e.preventDefault()}
                style={{
                  flex:1, padding:"9px 0", background:"none", border:"none",
                  borderBottom:`2px solid ${mode===m?"var(--blue-core)":"transparent"}`,
                  color: mode===m ? "var(--text-bright)" : "var(--text-dim)",
                  fontFamily:"var(--font-title)", fontSize:11, letterSpacing:2, cursor:"pointer",
                  transition:"color 0.15s", WebkitTapHighlightColor:"transparent", outline:"none",
                }}>{label.toUpperCase()}</button>
            ))}
          </div>

          {/* Botão Google */}
          <button onClick={handleGoogle} disabled={googleLoading} style={{
            width:"100%", padding:"11px 0", borderRadius:6, marginBottom:18,
            background:"#fff", border:"none",
            cursor: googleLoading ? "default" : "pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
            fontFamily:"var(--font-body)", fontSize:14, fontWeight:600, color:"#3c4043",
            boxShadow:"0 1px 4px rgba(0,0,0,0.5)",
            opacity: googleLoading ? 0.7 : 1, transition:"opacity 0.15s",
            WebkitTapHighlightColor:"transparent",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading
              ? "Redirecionando..."
              : (mode === "login" ? "Entrar com Google" : "Registrar com Google")}
          </button>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
            <div style={{ flex:1, height:1, background:"var(--border-dim)" }} />
            <span style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)" }}>OU</span>
            <div style={{ flex:1, height:1, background:"var(--border-dim)" }} />
          </div>

          {/* Formulário */}
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
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <label style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:1 }}>
                  SENHA
                </label>
                {mode === "login" && (
                  <button type="button" onClick={handleForgotPassword} style={{
                    background:"none", border:"none", color:"var(--blue-glow)",
                    fontSize:10, fontFamily:"var(--font-mono)", cursor:"pointer",
                    letterSpacing:1, WebkitTapHighlightColor:"transparent",
                  }}>Esqueci a senha</button>
                )}
              </div>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder={mode === "register" ? "mínimo 6 caracteres" : "••••••••"}
                required minLength={6} style={inputStyle}
                onFocus={e=>e.target.style.borderColor="var(--blue-core)"}
                onBlur={e=>e.target.style.borderColor="var(--border-dim)"} />
            </div>

            {error && (
              <div style={{ fontSize:12, fontFamily:"var(--font-body)",
                background: error.startsWith("✓") ? "rgba(0,255,136,0.08)" : "rgba(255,68,102,0.08)",
                border:`1px solid ${error.startsWith("✓") ? "rgba(0,255,136,0.3)" : "rgba(255,68,102,0.25)"}`,
                color: error.startsWith("✓") ? "var(--green-core)" : "var(--red-core)",
                borderRadius:4, padding:"8px 12px" }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              padding:"12px 0", borderRadius:4, border:"1px solid rgba(79,140,255,0.4)",
              background: loading ? "rgba(79,140,255,0.05)" : "rgba(79,140,255,0.14)",
              color: loading ? "var(--text-dim)" : "var(--blue-glow)",
              fontFamily:"var(--font-title)", fontSize:12, letterSpacing:2,
              cursor: loading ? "default" : "pointer", transition:"background 0.15s",
              WebkitTapHighlightColor:"transparent",
            }}>
              {loading ? "AGUARDE..." : mode === "login" ? "ENTRAR" : "CRIAR CONTA"}
            </button>
          </form>
        </div>

        {/* Offline */}
        <div style={{ textAlign:"center", marginTop:16, paddingBottom:16 }}>
          <button onClick={() => onAuth(null, true)} style={{
            background:"none", border:"none", color:"var(--text-dim)", fontSize:11,
            fontFamily:"var(--font-mono)", cursor:"pointer", textDecoration:"underline",
            WebkitTapHighlightColor:"transparent",
          }}>Continuar sem conta (dados locais apenas)</button>
        </div>
      </div>
    </div>
  );
}

// ── ProfileSetup ──────────────────────────────────────────────────
function ProfileSetup({ onSave, session }) {
  const googleName   = session?.user?.user_metadata?.full_name
                    || session?.user?.user_metadata?.name || "";
  const googleAvatar = session?.user?.user_metadata?.avatar_url || null;

  const [name,    setName]    = React.useState(googleName);
  const [avatar,  setAvatar]  = React.useState(googleAvatar);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef();

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
    onSave({ ...DEFAULT_PROFILE, name: name.trim(), avatar });
  };

  return (
    <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center",
      justifyContent:"center", zIndex:200 }}>
      <Background />
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:380,
        padding:"0 20px", animation:"auth-fade-in 0.4s ease" }}>
        <div style={{ background:"rgba(7,7,20,0.97)", border:"1px solid var(--border-dim)",
          borderRadius:8, padding:32 }}>

          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ fontFamily:"var(--font-title)", fontSize:14, color:"var(--text-dim)",
              letterSpacing:3, marginBottom:4 }}>CONFIGURAR PERFIL</div>
            <div style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-body)" }}>
              Como você quer ser chamado no Sistema?
            </div>
          </div>

          {/* Avatar */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:24 }}>
            <div onClick={() => inputRef.current?.click()} style={{ cursor:"pointer", position:"relative" }}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width:88, height:88, borderRadius:8,
                    objectFit:"cover", border:"2px solid rgba(155,93,229,0.5)" }} />
                : <div style={{ width:88, height:88, borderRadius:8,
                    background:"linear-gradient(135deg,#0a0a2a,#1a1040)",
                    border:"2px dashed rgba(155,93,229,0.4)",
                    display:"flex", flexDirection:"column", alignItems:"center",
                    justifyContent:"center", gap:6 }}>
                    <Icon name="camera" size={26} color="var(--purple-glow)" />
                    <span style={{ color:"var(--text-dim)", fontSize:9, fontFamily:"var(--font-mono)" }}>FOTO</span>
                  </div>}
              <div style={{ position:"absolute", bottom:-6, right:-6, width:24, height:24,
                borderRadius:"50%", background:"var(--purple-core)", border:"2px solid var(--bg-void)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name="camera" size={11} color="#fff" />
              </div>
            </div>
            <input ref={inputRef} type="file" accept="image/*"
              style={{ display:"none" }} onChange={handleFile} />
            <span style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)", marginTop:10 }}>
              {googleAvatar ? "Foto importada do Google" : "Clique para adicionar foto"}
            </span>
          </div>

          {/* Nome */}
          <div style={{ marginBottom:24 }}>
            <label style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)",
              letterSpacing:1, display:"block", marginBottom:8 }}>NOME DE CAÇADOR</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="ex: João Silva" maxLength={24}
              style={{ width:"100%", padding:"11px 14px", borderRadius:4,
                background:"rgba(255,255,255,0.04)", border:"1px solid var(--border-dim)",
                color:"var(--text-bright)", fontFamily:"var(--font-body)", fontSize:15,
                outline:"none" }}
              onFocus={e => e.target.style.borderColor = "var(--blue-core)"}
              onBlur={e => e.target.style.borderColor = "var(--border-dim)"} />
          </div>

          <button onClick={handleSave} disabled={!name.trim() || loading} style={{
            width:"100%", padding:"12px 0", borderRadius:4,
            border:"1px solid rgba(155,93,229,0.4)",
            background: name.trim() ? "rgba(155,93,229,0.14)" : "rgba(255,255,255,0.03)",
            color: name.trim() ? "var(--purple-glow)" : "var(--text-dim)",
            fontFamily:"var(--font-title)", fontSize:12, letterSpacing:2,
            cursor: name.trim() ? "pointer" : "default",
            WebkitTapHighlightColor:"transparent",
          }}>
            {loading ? "SALVANDO..." : "⚔ INICIAR JORNADA"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PasswordResetModal — aparece após clicar no link do email ─────
function PasswordResetModal({ onClose }) {
  const [password,  setPassword]  = React.useState("");
  const [confirm,   setConfirm]   = React.useState("");
  const [loading,   setLoading]   = React.useState(false);
  const [done,      setDone]      = React.useState(false);
  const [error,     setError]     = React.useState("");

  const inputStyle = {
    width:"100%", padding:"11px 14px", borderRadius:4,
    background:"rgba(255,255,255,0.04)", border:"1px solid var(--border-dim)",
    color:"var(--text-bright)", fontFamily:"var(--font-body)", fontSize:14, outline:"none",
  };

  const handleSave = async () => {
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 6)  { setError("Senha deve ter pelo menos 6 caracteres."); return; }
    setLoading(true); setError("");
    const { error } = await window.sb.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true);
    setTimeout(onClose, 2500);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:700,
      display:"flex", alignItems:"center", justifyContent:"center",
      backdropFilter:"blur(6px)", padding:20 }}>
      <div style={{ background:"var(--bg-void)", border:"1px solid rgba(79,140,255,0.3)",
        borderRadius:8, padding:32, width:"100%", maxWidth:380,
        animation:"auth-fade-in 0.3s ease", textAlign:"center" }}>

        {done ? (
          <>
            <div style={{ fontSize:40, marginBottom:16 }}>✅</div>
            <div style={{ fontFamily:"var(--font-title)", fontSize:16, color:"var(--green-core)",
              letterSpacing:2, marginBottom:8 }}>SENHA ALTERADA!</div>
            <div style={{ color:"var(--text-dim)", fontFamily:"var(--font-body)", fontSize:13 }}>
              Sua nova senha foi salva com sucesso.
            </div>
          </>
        ) : (
          <>
            <div style={{ fontFamily:"var(--font-title)", fontSize:15, color:"var(--text-bright)",
              letterSpacing:2, marginBottom:6 }}>NOVA SENHA</div>
            <div style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-mono)",
              marginBottom:24 }}>Digite e confirme sua nova senha</div>

            <div style={{ display:"flex", flexDirection:"column", gap:14, textAlign:"left" }}>
              <div>
                <label style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)",
                  letterSpacing:1, display:"block", marginBottom:6 }}>NOVA SENHA</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="mínimo 6 caracteres" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="var(--blue-core)"}
                  onBlur={e=>e.target.style.borderColor="var(--border-dim)"} />
              </div>
              <div>
                <label style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)",
                  letterSpacing:1, display:"block", marginBottom:6 }}>CONFIRMAR SENHA</label>
                <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}
                  placeholder="repita a senha" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="var(--blue-core)"}
                  onBlur={e=>e.target.style.borderColor="var(--border-dim)"} />
              </div>
              {error && (
                <div style={{ color:"var(--red-core)", fontSize:12, fontFamily:"var(--font-body)",
                  background:"rgba(255,68,102,0.08)", border:"1px solid rgba(255,68,102,0.25)",
                  borderRadius:4, padding:"8px 12px" }}>{error}</div>
              )}
              <button onClick={handleSave} disabled={loading} style={{
                padding:"12px 0", borderRadius:4, border:"1px solid rgba(79,140,255,0.4)",
                background: loading ? "rgba(79,140,255,0.05)" : "rgba(79,140,255,0.14)",
                color: loading ? "var(--text-dim)" : "var(--blue-glow)",
                fontFamily:"var(--font-title)", fontSize:12, letterSpacing:2, cursor:"pointer",
                WebkitTapHighlightColor:"transparent",
              }}>
                {loading ? "SALVANDO..." : "SALVAR NOVA SENHA"}
              </button>
              <button onClick={onClose} style={{ background:"none", border:"none",
                color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-mono)",
                cursor:"pointer", textDecoration:"underline" }}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── PremiumGate (legado — substituído por PremiumModal) ───────────
function PremiumGate({ onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:500,
      display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }}>
      <div style={{ background:"rgba(7,7,20,0.98)", border:"1px solid rgba(255,215,0,0.3)",
        borderRadius:8, padding:36, maxWidth:420, width:"90%", textAlign:"center",
        animation:"badge-unlock 0.4s ease" }}>
        <div style={{ fontSize:40, marginBottom:16, animation:"streak-flame 2s ease infinite" }}>⚜</div>
        <div style={{ fontFamily:"var(--font-title)", fontSize:18, fontWeight:700,
          color:"var(--gold-core)", letterSpacing:2, marginBottom:8 }}>RANKS B, A e S</div>
        <div style={{ color:"var(--text-dim)", fontSize:10, letterSpacing:3,
          fontFamily:"var(--font-mono)", marginBottom:20 }}>CONTEÚDO PREMIUM</div>
        <div style={{ color:"var(--text-mid)", fontSize:13, fontFamily:"var(--font-body)",
          lineHeight:1.7, marginBottom:28 }}>
          Você alcançou o limite do plano gratuito.<br/>
          Os Ranks <strong style={{color:"var(--purple-glow)"}}>B</strong>,{" "}
          <strong style={{color:"var(--gold-core)"}}>A</strong> e{" "}
          <strong style={{color:"#ff66dd"}}>S</strong> desbloqueiam missões avançadas,
          habilidades exclusivas e recompensas especiais.
        </div>
        <button onClick={onClose} style={{ padding:"10px 32px", borderRadius:4,
          border:"1px solid var(--border-dim)", background:"transparent",
          color:"var(--text-dim)", fontFamily:"var(--font-title)", fontSize:11,
          letterSpacing:2, cursor:"pointer" }}>CONTINUAR NO RANK C</button>
      </div>
    </div>
  );
}
