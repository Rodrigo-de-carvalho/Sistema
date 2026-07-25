// ── verify.js — verificação real de tarefas ──────────────────────
//   📷 Câmera + IA de pose (flexões, agachamentos, abdominais)
//   🏃 Strava (corridas/caminhadas com GPS real)

const STRAVA_EDGE_URL = `${SUPABASE_URL}/functions/v1/strava`;

// Tarefas verificáveis por câmera → id do exercício no RepCounter
const CAMERA_TASKS = { push_ups: true, squats: true, abs: true };
// Tarefa verificável pelo Strava
const STRAVA_TASKS = { run_5km: true };
// Tarefas de tempo → verificáveis por timer no app
const TIMER_TASKS  = { study_1h: true, read_30min: true, stretch: true, meditate: true, no_phone: true };

function parseRepTarget(label)  { const n = parseInt(label, 10); return Number.isFinite(n) && n > 0 ? n : 10; }
function parseKmTarget(label)   {
  const m = label.match(/([\d.,]+)\s*km/i);
  return m ? parseFloat(m[1].replace(",", ".")) : 1;
}
function parseMinutesTarget(label) {
  const l = label.toLowerCase();
  let m = l.match(/(\d+)\s*h\s*(\d+)/);            // "1h30"
  if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  m = l.match(/(\d+)\s*(?:horas?|h)\b/);           // "2 horas", "3h", "1 hora"
  if (m) return parseInt(m[1], 10) * 60;
  m = l.match(/(\d+)\s*(?:minutos?|min)\b/);       // "15 minutos", "5min", "30min"
  if (m) return parseInt(m[1], 10);
  return 10;
}

function formatTimerSec(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return (h ? `${h}:${String(m).padStart(2, "0")}` : String(m)) + ":" + String(sec).padStart(2, "0");
}

// Uma tarefa é "verificável" se tem algum método de comprovação.
// Marcar manualmente uma tarefa verificável SEM comprovar dá metade do XP.
function isVerifiableTask(taskId) {
  return !!(CAMERA_TASKS[taskId] || STRAVA_TASKS[taskId] || TIMER_TASKS[taskId]);
}

// ── Registro de tarefas comprovadas hoje (por aparelho) ───────────
// Depois de comprovada (timer/câmera/GPS), a prova vale o dia inteiro:
// desmarcar e remarcar mantém o XP cheio e os botões de verificação somem.

const LS_VERIFIED_KEY = "sistema_verified_tasks";

function _loadVerifiedTasks() {
  try {
    const v = JSON.parse(localStorage.getItem(LS_VERIFIED_KEY));
    if (v && v.date === todayKey()) return v.tasks || {};
  } catch {}
  return {};
}

function markTaskVerified(questId, taskId) {
  try {
    const tasks = _loadVerifiedTasks();
    tasks[`${questId}/${taskId}`] = true;
    localStorage.setItem(LS_VERIFIED_KEY, JSON.stringify({ date: todayKey(), tasks }));
  } catch {}
}

function isTaskVerified(questId, taskId) {
  return !!_loadVerifiedTasks()[`${questId}/${taskId}`];
}

// ── Timer de tarefa (em memória; 1 por vez) ───────────────────────
// Regra: o timer só vale com o app aberto. Trocar de aba ou minimizar
// tudo bem (é relógio de parede), mas RECARREGAR ou FECHAR a página
// perde o timer — sair antes do fim não conta.
function useTaskTimer(onComplete) {
  const [active, setActive] = React.useState(null);
  const [, setTick] = React.useState(0);
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  React.useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [!!active]);

  React.useEffect(() => {
    if (!active) return;
    if (Date.now() >= active.endsAt) {
      const t = active;
      setActive(null);
      onCompleteRef.current(t);
    }
  });

  const start = React.useCallback((quest, task, minutes) => {
    setActive({
      questId: quest.id, taskId: task.id, taskXP: task.xp, taskStat: task.stat,
      label: task.label, totalMin: minutes,
      startedAt: Date.now(), endsAt: Date.now() + minutes * 60000,
    });
  }, []);

  const cancel = React.useCallback(() => { setActive(null); }, []);

  const remainingSec = active ? Math.max(0, Math.ceil((active.endsAt - Date.now()) / 1000)) : 0;
  return { active, remainingSec, start, cancel };
}

// ── Modal: timer de tarefa ────────────────────────────────────────

function TimerModal({ quest, task, minutes, timer, onClose }) {
  const isMine      = !!(timer.active && timer.active.questId === quest.id && timer.active.taskId === task.id);
  const otherActive = !!(timer.active && !isMine);
  const wasMineRef  = React.useRef(false);
  const [cancelled, setCancelled] = React.useState(false);
  if (isMine) wasMineRef.current = true;
  // "finalizado" só quando o timer TERMINOU sozinho — cancelar não conta
  const finished = wasMineRef.current && !timer.active;

  const handleCancel = () => {
    setCancelled(true);
    wasMineRef.current = false;
    timer.cancel();
  };

  const totalSec = (isMine ? timer.active.totalMin : minutes) * 60;
  const remSec   = isMine ? timer.remainingSec : totalSec;
  const pct      = finished ? 100 : isMine ? Math.min(100, Math.round(((totalSec - remSec) / totalSec) * 100)) : 0;

  const hint = task.id === "no_phone"
    ? "Aperte iniciar, larga o celular e vai viver 😉 — quando o tempo acabar, a tarefa marca sozinha com XP cheio."
    : "Pode minimizar ou trocar de aba — mas recarregar/sair da página ou cancelar perde o timer e NÃO conta.";

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:8000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"var(--bg-void)", border:"1px solid rgba(0,255,136,0.3)",
        borderRadius:10, width:"100%", maxWidth:380, padding:28, textAlign:"center",
        animation:"auth-fade-in 0.3s ease" }}>

        <div style={{ fontSize:28, marginBottom:8 }}>⏱</div>
        <div style={{ color:"var(--green-core)", fontFamily:"var(--font-title)", fontSize:14,
          letterSpacing:2, marginBottom:4 }}>TIMER DE TAREFA</div>
        <div style={{ color:"var(--text-dim)", fontSize:11, marginBottom:20 }}>{task.label}</div>

        {finished ? (
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:8 }}>
            <span style={{ fontSize:36 }}>🎉</span>
            <div style={{ color:"var(--green-core)", fontFamily:"var(--font-title)",
              fontSize:16, letterSpacing:2 }}>TEMPO CUMPRIDO!</div>
            <div style={{ color:"var(--text-dim)", fontSize:12 }}>Tarefa verificada e marcada.</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily:"var(--font-title)", fontWeight:900, fontSize:44,
              color: isMine ? "var(--green-core)" : "var(--text-mid)", marginBottom:10 }}>
              {formatTimerSec(remSec)}
            </div>
            <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:4,
              overflow:"hidden", marginBottom:16 }}>
              <div style={{ height:"100%", width:`${pct}%`, borderRadius:4,
                background:"var(--green-core)", transition:"width 1s linear" }} />
            </div>

            {otherActive && (
              <div style={{ background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.3)",
                borderRadius:6, padding:"10px 14px", marginBottom:12, fontSize:11,
                color:"var(--gold-core)", lineHeight:1.5 }}>
                Você já tem um timer rodando: <strong>{timer.active.label}</strong>{" "}
                ({formatTimerSec(timer.remainingSec)} restantes). Cancele-o para iniciar outro.
              </div>
            )}

            {cancelled && !timer.active && (
              <div style={{ background:"rgba(255,68,102,0.08)", border:"1px solid rgba(255,68,102,0.3)",
                borderRadius:6, padding:"8px 12px", marginBottom:12, fontSize:11,
                color:"var(--red-core)" }}>
                Timer cancelado — não conta como comprovação.
              </div>
            )}

            {!isMine && !otherActive && (
              <button onClick={() => timer.start(quest, task, minutes)}
                style={{ width:"100%", padding:"13px 0", borderRadius:6,
                  background:"rgba(0,255,136,0.12)", border:"1px solid rgba(0,255,136,0.5)",
                  color:"var(--green-core)", fontFamily:"var(--font-title)", fontSize:13,
                  letterSpacing:2, cursor:"pointer", marginBottom:10 }}>
                ▶ INICIAR ({minutes >= 60 ? formatTimerSec(minutes * 60).replace(/:00$/, "") + "" : `${minutes} min`})
              </button>
            )}

            {(isMine || otherActive) && (
              <button onClick={handleCancel}
                style={{ width:"100%", padding:"11px 0", borderRadius:6,
                  background:"rgba(255,68,102,0.08)", border:"1px solid rgba(255,68,102,0.35)",
                  color:"var(--red-core)", fontFamily:"var(--font-title)", fontSize:11,
                  letterSpacing:2, cursor:"pointer", marginBottom:10 }}>
                CANCELAR TIMER
              </button>
            )}

            <div style={{ color:"var(--text-dim)", fontSize:10, lineHeight:1.6 }}>{hint}</div>
          </>
        )}

        <button onClick={onClose} style={{ background:"none", border:"none", marginTop:14,
          color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-mono)",
          cursor:"pointer", textDecoration:"underline" }}>Fechar</button>
      </div>
    </div>
  );
}

// ── Strava API (via Edge Function; tokens ficam só no servidor) ───

async function stravaApi(params, opts = {}) {
  if (!window.sb) return { error: "Strava requer conta online." };
  const { data: { session } } = await window.sb.auth.getSession();
  if (!session) return { error: "Faça login para usar o Strava." };
  try {
    const res = await fetch(`${STRAVA_EDGE_URL}?${new URLSearchParams(params)}`, {
      method:  opts.method || "GET",
      headers: {
        "apikey":        SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type":  "application/json",
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || `Erro ${res.status}` };
    return data;
  } catch {
    return { error: "Sem conexão com o servidor." };
  }
}

async function stravaStartConnect() {
  const cfg = await stravaApi({ action: "config" });
  if (cfg.error) return cfg;
  if (!cfg.client_id) {
    return { error: "Strava ainda não configurado no servidor (falta STRAVA_CLIENT_ID)." };
  }
  const redirect = window.location.origin + window.location.pathname + "?strava=1";
  window.location.href = "https://www.strava.com/oauth/authorize?" + new URLSearchParams({
    client_id:       cfg.client_id,
    response_type:   "code",
    redirect_uri:    redirect,
    scope:           "activity:read_all",
    approval_prompt: "auto",
  });
  return {};
}

async function stravaExchangeCode(code) {
  return await stravaApi({ action: "exchange" }, { method: "POST", body: { code } });
}

async function stravaStatus() { return await stravaApi({ action: "status" }); }

async function stravaTodayKm() {
  const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
  return await stravaApi({ action: "today", since: String(Math.floor(midnight.getTime() / 1000)) });
}

// ── Modal: contador por câmera ────────────────────────────────────

function TrainerModal({ task, target, onVerified, onClose }) {
  const videoRef  = React.useRef(null);
  const canvasRef = React.useRef(null);
  const doneRef   = React.useRef(false);
  const [st, setSt] = React.useState({ status: "starting", count: 0, detected: false, hint: "" });
  const isMobile = useIsMobile();

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await window.RepCounter.start(videoRef.current, canvasRef.current, task.id, (u) => {
          if (cancelled) return;
          setSt(prev => ({ ...prev, ...u }));
          if (u.count >= target && !doneRef.current) {
            doneRef.current = true;
            window.RepCounter.stop();
            setSt(prev => ({ ...prev, ...u, status: "done" }));
            onVerified();
          }
        });
      } catch (err) {
        if (!cancelled) setSt({ status: "error", count: 0,
          error: err?.message || "Não foi possível acessar a câmera." });
      }
    })();
    return () => { cancelled = true; window.RepCounter.stop(); };
  }, []);

  const pct = Math.min(100, Math.round((st.count / target) * 100));

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:8000,
      display:"flex", alignItems:"center", justifyContent:"center", padding: isMobile ? 0 : 20 }}>
      <div style={{ background:"var(--bg-void)", border:"1px solid rgba(0,212,255,0.3)",
        borderRadius: isMobile ? 0 : 10, width: isMobile ? "100%" : 560,
        height: isMobile ? "100%" : "auto", maxHeight:"100vh", overflow:"auto",
        display:"flex", flexDirection:"column" }}>

        {/* Header */}
        <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border-dim)",
          display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:18 }}>📷</span>
          <div style={{ flex:1 }}>
            <div style={{ color:"var(--cyan-core)", fontFamily:"var(--font-title)", fontSize:13,
              letterSpacing:2 }}>MODO TREINO — VERIFICAÇÃO POR IA</div>
            <div style={{ color:"var(--text-dim)", fontSize:11 }}>{task.label}</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.05)",
            border:"1px solid var(--border-dim)", color:"var(--text-dim)", cursor:"pointer",
            padding:"6px 10px", borderRadius:4 }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Câmera */}
        <div style={{ position:"relative", background:"#000", minHeight:240 }}>
          <video ref={videoRef} playsInline muted
            style={{ width:"100%", display:"block", transform:"scaleX(-1)" }} />
          <canvas ref={canvasRef}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", transform:"scaleX(-1)" }} />

          {(st.status === "starting" || st.status === "loading-model") && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
              justifyContent:"center", flexDirection:"column", gap:10, background:"rgba(2,2,10,0.85)" }}>
              <div style={{ fontSize:26, animation:"spin-slow 1.5s linear infinite", display:"inline-block" }}>⚙</div>
              <div style={{ color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-mono)" }}>
                {st.status === "starting" ? "Iniciando câmera..." : "Carregando IA de pose (~5MB, só na 1ª vez)..."}
              </div>
            </div>
          )}

          {st.status === "error" && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
              justifyContent:"center", flexDirection:"column", gap:10, padding:20,
              background:"rgba(2,2,10,0.9)", textAlign:"center" }}>
              <span style={{ fontSize:26 }}>🚫</span>
              <div style={{ color:"var(--red-core)", fontSize:12 }}>{st.error}</div>
              <div style={{ color:"var(--text-dim)", fontSize:10 }}>
                Permita o acesso à câmera nas configurações do navegador e tente de novo.
              </div>
            </div>
          )}

          {st.status === "running" && !st.detected && (
            <div style={{ position:"absolute", top:10, left:10, right:10, textAlign:"center",
              background:"rgba(255,68,102,0.15)", border:"1px solid rgba(255,68,102,0.4)",
              borderRadius:6, padding:"6px 10px", color:"#ffb3c0", fontSize:11 }}>
              Não estou te vendo — {st.hint}
            </div>
          )}

          {st.status === "done" && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
              justifyContent:"center", flexDirection:"column", gap:8, background:"rgba(0,20,10,0.85)" }}>
              <span style={{ fontSize:42 }}>🎉</span>
              <div style={{ color:"var(--green-core)", fontFamily:"var(--font-title)",
                fontSize:18, letterSpacing:2 }}>META CUMPRIDA!</div>
              <div style={{ color:"var(--text-dim)", fontSize:11 }}>Tarefa verificada e marcada.</div>
            </div>
          )}
        </div>

        {/* Contador */}
        <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontFamily:"var(--font-title)", fontWeight:900, fontSize:34,
            color: st.status === "done" ? "var(--green-core)" : "var(--cyan-core)",
            minWidth:110, textAlign:"center" }}>
            {st.count}<span style={{ fontSize:16, color:"var(--text-dim)" }}> / {target}</span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, borderRadius:4, transition:"width 0.3s",
                background: st.status === "done" ? "var(--green-core)" : "var(--cyan-core)" }} />
            </div>
            <div style={{ color:"var(--text-dim)", fontSize:10, fontFamily:"var(--font-mono)", marginTop:6 }}>
              {st.status === "done" ? "✓ Verificado pela IA"
                : st.detected ? (st.armed ? "⬇ desce... agora SOBE para contar" : "⬆ pronto — faça o movimento completo")
                : st.hint || ""}
            </div>
          </div>
        </div>

        <div style={{ padding:"0 18px 14px", color:"var(--text-dim)", fontSize:9,
          fontFamily:"var(--font-mono)", textAlign:"center" }}>
          🔒 A análise roda no seu aparelho — nenhuma imagem é enviada para servidores.
        </div>
      </div>
    </div>
  );
}

// ── Modal: verificação pelo Strava ────────────────────────────────

function StravaModal({ task, targetKm, onVerified, onClose }) {
  const [st, setSt] = React.useState({ phase: "loading" });
  const isMobile = useIsMobile();

  React.useEffect(() => {
    (async () => {
      const s = await stravaStatus();
      if (s.error)           setSt({ phase: "error", msg: s.error });
      else if (!s.connected) setSt({ phase: "disconnected" });
      else                   setSt({ phase: "connected" });
    })();
  }, []);

  const handleConnect = async () => {
    setSt({ phase: "connecting" });
    const r = await stravaStartConnect();
    if (r && r.error) setSt({ phase: "error", msg: r.error });
  };

  const handleCheck = async () => {
    setSt({ phase: "checking" });
    const r = await stravaTodayKm();
    if (r.error) { setSt({ phase: "error", msg: r.error }); return; }
    const km = r.km || 0;
    if (km >= targetKm) { setSt({ phase: "ok", km }); onVerified(); }
    else setSt({ phase: "insufficient", km });
  };

  const btn = (label, onClick, color = "#fc4c02") => (
    <button onClick={onClick} style={{ width:"100%", padding:"12px 0", borderRadius:6,
      background:`${color}22`, border:`1px solid ${color}88`, color:"#ff8a5c",
      fontFamily:"var(--font-title)", fontSize:12, letterSpacing:2, cursor:"pointer" }}>
      {label}
    </button>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:8000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"var(--bg-void)", border:"1px solid rgba(252,76,2,0.35)",
        borderRadius:10, width:"100%", maxWidth:400, padding: isMobile ? 20 : 28,
        textAlign:"center", animation:"auth-fade-in 0.3s ease" }}>

        <div style={{ fontSize:30, marginBottom:10 }}>🏃</div>
        <div style={{ color:"#fc4c02", fontFamily:"var(--font-title)", fontSize:15,
          letterSpacing:2, marginBottom:4 }}>VERIFICAR COM STRAVA</div>
        <div style={{ color:"var(--text-dim)", fontSize:11, marginBottom:20 }}>
          {task.label} — meta de hoje: <strong style={{ color:"var(--text-mid)" }}>{targetKm} km</strong>
        </div>

        {st.phase === "loading" && (
          <div style={{ color:"var(--text-dim)", fontSize:12, padding:"16px 0" }}>Verificando conexão…</div>
        )}

        {st.phase === "disconnected" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ color:"var(--text-mid)", fontSize:12, lineHeight:1.6 }}>
              Conecte sua conta Strava (grátis) para validar corridas e caminhadas
              com o GPS de verdade.
            </div>
            {btn("CONECTAR COM STRAVA", handleConnect)}
          </div>
        )}

        {st.phase === "connecting" && (
          <div style={{ color:"var(--text-dim)", fontSize:12, padding:"16px 0" }}>Redirecionando para o Strava…</div>
        )}

        {st.phase === "connected" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ color:"var(--green-core)", fontSize:11 }}>✓ Conta Strava conectada</div>
            {btn("CHECAR ATIVIDADES DE HOJE", handleCheck)}
          </div>
        )}

        {st.phase === "checking" && (
          <div style={{ color:"var(--text-dim)", fontSize:12, padding:"16px 0" }}>
            Consultando suas atividades de hoje…
          </div>
        )}

        {st.phase === "ok" && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <span style={{ fontSize:34 }}>🎉</span>
            <div style={{ color:"var(--green-core)", fontFamily:"var(--font-title)",
              fontSize:15, letterSpacing:2 }}>VERIFICADO!</div>
            <div style={{ color:"var(--text-mid)", fontSize:12 }}>
              {st.km.toFixed(2)} km registrados hoje no Strava. Tarefa marcada.
            </div>
          </div>
        )}

        {st.phase === "insufficient" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ color:"var(--gold-core)", fontSize:12, lineHeight:1.6 }}>
              Hoje o Strava registrou <strong>{st.km.toFixed(2)} km</strong> — ainda
              falta para a meta de {targetKm} km. Continue e cheque de novo!
            </div>
            {btn("CHECAR DE NOVO", handleCheck)}
          </div>
        )}

        {st.phase === "error" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ color:"var(--red-core)", fontSize:12 }}>{st.msg}</div>
            {btn("TENTAR DE NOVO", handleCheck)}
          </div>
        )}

        <button onClick={onClose} style={{ background:"none", border:"none", marginTop:16,
          color:"var(--text-dim)", fontSize:11, fontFamily:"var(--font-mono)",
          cursor:"pointer", textDecoration:"underline" }}>Fechar</button>
      </div>
    </div>
  );
}
