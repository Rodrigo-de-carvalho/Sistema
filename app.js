const { useState, useEffect, useRef, useCallback } = React;

// ── DATA ──────────────────────────────────────────────────────────────────────

const PLAYER = {
  name: "Sung Jin-Woo",
  title: "Monarca das Sombras",
  class: "Necromante",
  rank: "S",
  level: 147,
  xp: 74200,
  xpNext: 100000,
  hp: 84200,
  hpMax: 84200,
  mp: 31400,
  mpMax: 35000,
  gold: 2847300,
  fatigue: 0,
};

const STATS = [
  { key: "FOR", label: "Força",        value: 382, max: 500, color: "#ff6644" },
  { key: "VIT", label: "Vitalidade",   value: 247, max: 500, color: "#ff4466" },
  { key: "AGI", label: "Agilidade",    value: 451, max: 500, color: "#00d4ff" },
  { key: "INT", label: "Inteligência", value: 303, max: 500, color: "#9b5de5" },
  { key: "PER", label: "Percepção",    value: 415, max: 500, color: "#ffd700" },
  { key: "RES", label: "Resistência",  value: 290, max: 500, color: "#00ff88" },
];

const SKILLS = [
  { id: 1, name: "Extração de Sombra",     rank: "EX", mp: 1500, cd: 0,  desc: "Extrai a sombra de um inimigo abatido, vinculando-o permanentemente como soldado das sombras.", type: "Ativo",   icon: "ghost" },
  { id: 2, name: "Troca de Sombra",        rank: "S",  mp: 800,  cd: 3,  desc: "Troca instantaneamente de posição com qualquer soldado das sombras dentro do alcance.", type: "Ativo",   icon: "shuffle" },
  { id: 3, name: "Autoridade do Soberano", rank: "S",  mp: 200,  cd: 0,  desc: "Manipula telecineticamente objetos e pessoas usando o poder dos Soberanos.", type: "Ativo",   icon: "magnet" },
  { id: 4, name: "Expansão de Domínio",    rank: "EX", mp: 5000, cd: 60, desc: "Cria um domínio inescapável ao redor do usuário. Todos dentro estão sujeitos à lei do Monarca das Sombras.", type: "Ativo",   icon: "layers" },
  { id: 5, name: "Reserva de Sombras",     rank: "A",  mp: 0,    cd: 0,  desc: "Armazena passivamente as sombras de inimigos caídos para extração posterior.", type: "Passivo", icon: "archive" },
  { id: 6, name: "Sede de Sangue",         rank: "S",  mp: 300,  cd: 5,  desc: "Libera instinto assassino, suprimindo inimigos mais fracos e reduzindo sua eficácia em combate.", type: "Ativo",   icon: "flame" },
  { id: 7, name: "Furtividade",            rank: "A",  mp: 100,  cd: 0,  desc: "Oculta a presença, tornando-se praticamente indetectável para monstros e caçadores abaixo do Rank S.", type: "Ativo",   icon: "eye-off" },
  { id: 8, name: "Domínio do Monarca",     rank: "EX", mp: 0,    cd: 0,  desc: "Aura passiva do Monarca das Sombras. Todos os soldados das sombras ganham atributos aprimorados dentro do alcance.", type: "Passivo", icon: "crown" },
];

const QUESTS = [
  {
    id: 1, type: "Diária", status: "active",
    title: "Regime de Treinamento",
    desc: "Complete o protocolo diário de condicionamento físico atribuído pelo Sistema.",
    tasks: [
      { label: "100 Flexões",      done: true },
      { label: "100 Abdominais",   done: true },
      { label: "100 Agachamentos", done: false },
      { label: "Corrida 10km",     done: false },
    ],
    reward: { xp: 5000, gold: 10000, stat: "+2 VIT/FOR" },
    timeLeft: "04:23:11",
  },
  {
    id: 2, type: "Principal", status: "active",
    title: "O Julgamento do Arquiteto",
    desc: "Infiltre o Portão Vermelho e neutralize o Rei Formiga antes que o portão colapse.",
    tasks: [
      { label: "Entrar no Portão Vermelho",          done: true },
      { label: "Derrotar 1000 bestas mágicas",       done: true },
      { label: "Localizar a câmara do Rei Formiga",  done: true },
      { label: "Derrotar o Rei Formiga",             done: false },
    ],
    reward: { xp: 500000, gold: 2000000, stat: "Novo Título Desbloqueado" },
    timeLeft: null,
  },
  {
    id: 3, type: "Secundária", status: "completed",
    title: "Expansão do Exército de Sombras",
    desc: "Extraia 50 novos soldados das sombras para fortalecer o exército do Monarca.",
    tasks: [
      { label: "Extrair 50 sombras", done: true },
    ],
    reward: { xp: 20000, gold: 50000, stat: "+5 Slots de Sombra" },
    timeLeft: null,
  },
  {
    id: 4, type: "Penalidade", status: "active",
    title: "Não ignore o Sistema",
    desc: "Falhar nesta missão resultará em penalidade imediata.",
    tasks: [
      { label: "Reconhecer notificação do Sistema", done: false },
      { label: "Aceitar missão atribuída",          done: false },
    ],
    reward: { xp: 0, gold: 0, stat: "Evitar penalidade" },
    timeLeft: "00:47:33",
    isPenalty: true,
  },
];

const INVENTORY = [
  { id: 1, name: "Espadão do Rei Demônio",      grade: "Lendário",  type: "Arma",       slot: "Mão Principal",  atk: "+880",       equipped: true,  desc: "Uma lâmina que carrega a aura de um monarca demônio." },
  { id: 2, name: "Armadura das Sombras",         grade: "Mítico",    type: "Armadura",   slot: "Corpo",          def: "+650",       equipped: true,  desc: "Armadura forjada com energia das sombras condensada." },
  { id: 3, name: "Matador de Cavaleiros",        grade: "Raro",      type: "Arma",       slot: "Mão Secundária", atk: "+320",       equipped: false, desc: "Uma adaga veloz projetada para perfurar armaduras mágicas." },
  { id: 4, name: "Poção de Recuperação de HP",   grade: "Comum",     type: "Consumível", qty: 47,                heal: "15.000 HP", equipped: false, desc: "Restaura instantaneamente 15.000 de HP." },
  { id: 5, name: "Poção de Recuperação de MP",   grade: "Incomum",   type: "Consumível", qty: 22,                heal: "8.000 MP",  equipped: false, desc: "Restaura instantaneamente 8.000 de MP." },
  { id: 6, name: "Caixa Aleatória Abençoada",    grade: "Épico",     type: "Caixa",      qty: 3,                                    equipped: false, desc: "Contém o item que o Jogador mais deseja." },
  { id: 7, name: "Núcleo de Kaisel",             grade: "Lendário",  type: "Material",   qty: 1,                                    equipped: false, desc: "O núcleo cristalizado do dragão Kaisel. Usado para forjar equipamentos de grau mítico." },
  { id: 8, name: "Fragmento de Runa das Sombras",grade: "Raro",      type: "Material",   qty: 12,                                   equipped: false, desc: "Fragmentos de magia das sombras condensada. Podem ser unidos para formar uma runa." },
];

const SHADOWS = [
  { id: 1, name: "Igris",                   rank: "Marechal",      type: "Cavaleiro",  level: 130, str: 341, vit: 287, agi: 310, icon: "shield" },
  { id: 2, name: "Beru",                    rank: "Marechal",      type: "Mago",       level: 128, str: 290, vit: 240, agi: 380, icon: "zap" },
  { id: 3, name: "Bellion",                 rank: "Grão-Marechal", type: "Guerreiro",  level: 147, str: 490, vit: 430, agi: 350, icon: "sword" },
  { id: 4, name: "Tank",                    rank: "General",       type: "Tanque",     level: 98,  str: 220, vit: 380, agi: 160, icon: "shield-check" },
  { id: 5, name: "Iron",                    rank: "Cavaleiro",     type: "Guerreiro",  level: 87,  str: 250, vit: 210, agi: 230, icon: "sword" },
  { id: 6, name: "Greed",                   rank: "General",       type: "Assassino",  level: 105, str: 195, vit: 180, agi: 420, icon: "eye" },
  { id: 7, name: "Tusk",                    rank: "General",       type: "Mago",       level: 100, str: 170, vit: 155, agi: 200, icon: "sparkles" },
  { id: 8, name: "Soldado das Sombras #1847",rank: "Soldado",      type: "Infantaria", level: 43,  str: 88,  vit: 70,  agi: 92,  icon: "user" },
];

const GRADE_COLOR = {
  Comum:    "#aaaaaa",
  Incomum:  "#00ff88",
  Raro:     "#4f8cff",
  Épico:    "#9b5de5",
  Lendário: "#ffd700",
  Mítico:   "#ff66dd",
};

const RANK_COLOR = {
  Soldado:         "#8899cc",
  Cavaleiro:       "#4f8cff",
  General:         "#9b5de5",
  Marechal:        "#ffd700",
  "Grão-Marechal": "#ff66dd",
};

// ── ICONS ──────────────────────────────────────────────────────────────────────

const ICON_PATHS = {
  "ghost":            "M9 2a7 7 0 0 0-7 7v8l3-3 2 2 2-2 2 2 2-2 3 3V9a7 7 0 0 0-7-7zm-2 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z",
  "shuffle":          "M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5",
  "magnet":           "M6 15A6 6 0 1 0 18 15M6 15v4M18 15v4M9 19h6",
  "layers":           "M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  "archive":          "M21 8v13H3V8M1 3h22v5H1zM10 12h4",
  "flame":            "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  "eye-off":          "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
  "crown":            "M2 20h20M5 20V10l7-7 7 7v10",
  "shield":           "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  "zap":              "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  "sword":            "M14.5 17.5 3 6V3h3l11.5 11.5-3 3zM13 19l6-6M2 2l5 5M20 16l2 2-4 4-2-2",
  "shield-check":     "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm-2-5l-3-3 1.5-1.5L10 14l4.5-4.5L16 11l-6 6z",
  "eye":              "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  "sparkles":         "M12 3l1.5 4.5H18l-3.75 2.75L15.75 15 12 12.25 8.25 15l1.5-4.75L6 7.5h4.5zM5 3v4M3 5h4M19 17v4M17 19h4",
  "user":             "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  "layout-dashboard": "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  "book-open":        "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  "package":          "M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
  "users":            "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  "list-checks":      "M11 5H21M11 9H21M11 13H21M11 17H21M3 5l1 1 2-2M3 9l1 1 2-2M3 13l1 1 2-2M3 17l1 1 2-2",
  "bell":             "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  "x":                "M18 6 6 18M6 6l12 12",
  "check":            "M20 6 9 17l-5-5",
  "clock":            "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
  "alert-triangle":   "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  "star":             "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  "bar-chart":        "M12 20V10M18 20V4M6 20v-4",
  "trending-up":      "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  "activity":         "M22 12h-4l-3 9L9 3l-3 9H2",
  "lock":             "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  "moon":             "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
};

function LucideIcon({ name, size = 16, color, style = {} }) {
  const d = ICON_PATHS[name] || ICON_PATHS["star"];
  const c = color || "currentColor";
  const paths = d.split(/(?=M)/).filter(Boolean);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0, ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {paths.map((p, i) => <path key={i} d={p} />)}
      </svg>
    </span>
  );
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────

function Bar({ value, max, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        borderRadius: 3, transition: "width 0.8s ease",
        boxShadow: `0 0 8px ${color}66`,
      }} />
    </div>
  );
}

function SystemAlert({ message, sub, type = "info", onClose }) {
  const colors = { info: "#4f8cff", warning: "#ffd700", danger: "#ff4466", success: "#00ff88" };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      background: "rgba(5,5,20,0.97)", border: `1px solid ${c}55`,
      borderLeft: `3px solid ${c}`, borderRadius: 4, padding: "14px 18px",
      minWidth: 300, maxWidth: 380,
      boxShadow: `0 0 30px ${c}22, 0 8px 32px rgba(0,0,0,0.8)`,
      animation: "notification-in 0.3s ease",
      fontFamily: "var(--font-ui)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ color: c, fontSize: 11, letterSpacing: 2, fontWeight: 700, marginBottom: 4, fontFamily: "var(--font-title)" }}>
            [ SISTEMA ]
          </div>
          <div style={{ color: "var(--text-bright)", fontSize: 13, fontWeight: 600 }}>{message}</div>
          {sub && <div style={{ color: "var(--text-mid)", fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>{sub}</div>}
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: 0, marginTop: 2 }}>
          <LucideIcon name="x" size={14} />
        </button>
      </div>
    </div>
  );
}

// ── BACKGROUND ────────────────────────────────────────────────────────────────

function Background() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(30,20,80,0.4) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 80% 60%, rgba(10,10,60,0.5) 0%, transparent 70%), var(--bg-void)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(79,140,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,140,255,0.04) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      <div style={{
        position: "absolute", left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, rgba(79,140,255,0.15), transparent)",
        animation: "scan-line 8s linear infinite",
      }} />
      {[...Array(14)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${5 + (i * 7) % 90}%`,
          bottom: `-${10 + (i * 13) % 30}%`,
          width: `${1 + (i % 3)}px`,
          height: `${1 + (i % 3)}px`,
          borderRadius: "50%",
          background: i % 3 === 0 ? "var(--purple-core)" : i % 3 === 1 ? "var(--blue-core)" : "var(--cyan-core)",
          animation: `float-particles ${8 + (i * 2.3) % 10}s ${(i * 1.1) % 5}s linear infinite`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

// ── STAT RADAR ────────────────────────────────────────────────────────────────

function StatRadar({ stats }) {
  const cx = 90, cy = 90, r = 70;
  const n = stats.length;

  const toXY = (i, val) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const norm = val / 500;
    return [cx + r * norm * Math.cos(angle), cy + r * norm * Math.sin(angle)];
  };

  const gridPoints = (level) =>
    stats.map((_, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      return `${cx + r * level * Math.cos(angle)},${cy + r * level * Math.sin(angle)}`;
    }).join(" ");

  const dataPoints = stats.map((s, i) => toXY(i, s.value).join(",")).join(" ");

  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      {[0.25, 0.5, 0.75, 1].map(l => (
        <polygon key={l} points={gridPoints(l)} fill="none" stroke="rgba(79,140,255,0.12)" strokeWidth="1" />
      ))}
      {stats.map((_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="rgba(79,140,255,0.12)" strokeWidth="1" />;
      })}
      <polygon points={dataPoints} fill="rgba(79,140,255,0.15)" stroke="rgba(79,140,255,0.8)" strokeWidth="1.5" />
      {stats.map((s, i) => {
        const [x, y] = toXY(i, s.value);
        return <circle key={i} cx={x} cy={y} r={3} fill={s.color} style={{ filter: `drop-shadow(0 0 4px ${s.color})` }} />;
      })}
      {stats.map((s, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const lx = cx + (r + 16) * Math.cos(angle);
        const ly = cy + (r + 16) * Math.sin(angle);
        return (
          <text key={i} x={lx} y={ly + 4} textAnchor="middle" fill={s.color} fontSize="9"
            fontFamily="Orbitron, monospace" fontWeight="700"
            style={{ filter: `drop-shadow(0 0 4px ${s.color}77)` }}>
            {s.key}
          </text>
        );
      })}
    </svg>
  );
}

// ── STATUS TAB ────────────────────────────────────────────────────────────────

function StatusTab({ player, stats }) {
  const xpPct = Math.round((player.xp / player.xpNext) * 100);
  const [points, setPoints] = useState(5);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, animation: "appear-up 0.4s ease" }}>

      {/* LEFT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Player card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 6, padding: 20, position: "relative", overflow: "hidden", animation: "pulse-border 4s ease infinite" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 20%, rgba(155,93,229,0.06) 0%, transparent 60%)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 4,
              background: "linear-gradient(135deg, #0a0a2a, #1a1040)",
              border: "1px solid rgba(155,93,229,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", flexShrink: 0,
              boxShadow: "0 0 20px rgba(155,93,229,0.25)",
            }}>
              <div style={{ fontSize: 28, animation: "shadow-pulse 3s ease infinite" }}>⚔</div>
              <div style={{
                position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
                background: "var(--purple-core)", color: "#fff", fontSize: 9,
                fontFamily: "var(--font-title)", fontWeight: 700, padding: "1px 8px",
                borderRadius: 2, whiteSpace: "nowrap",
              }}>Lv. {player.level}</div>
            </div>

            <div>
              <div style={{ color: "var(--text-dim)", fontSize: 10, letterSpacing: 2, fontFamily: "var(--font-mono)", marginBottom: 3 }}>CAÇADOR</div>
              <div style={{ color: "var(--text-bright)", fontSize: 20, fontFamily: "var(--font-title)", fontWeight: 700, letterSpacing: 1, animation: "flicker 12s ease infinite" }}>
                {player.name}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 5 }}>
                <span style={{
                  background: "rgba(155,93,229,0.15)", border: "1px solid rgba(155,93,229,0.4)",
                  color: "var(--purple-glow)", fontSize: 10, padding: "2px 8px",
                  fontFamily: "var(--font-title)", letterSpacing: 1, borderRadius: 2,
                }}>{player.title}</span>
                <span style={{
                  background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.35)",
                  color: "var(--gold-core)", fontSize: 11, padding: "2px 8px",
                  fontFamily: "var(--font-title)", fontWeight: 700, borderRadius: 2,
                  animation: "rank-glow 2.5s ease infinite",
                }}>RANK {player.rank}</span>
              </div>
            </div>
          </div>

          {[
            { label: "HP", value: player.hp, max: player.hpMax, color: "#ff4466" },
            { label: "MP", value: player.mp, max: player.mpMax, color: "#4f8cff" },
          ].map(b => (
            <div key={b.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: b.color, fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: 1 }}>{b.label}</span>
                <span style={{ color: "var(--text-mid)", fontSize: 10, fontFamily: "var(--font-mono)" }}>
                  {b.value.toLocaleString()} / {b.max.toLocaleString()}
                </span>
              </div>
              <Bar value={b.value} max={b.max} color={b.color} />
            </div>
          ))}

          <div style={{ marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "var(--text-dim)", fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: 1 }}>
                EXP &nbsp;<span style={{ color: "var(--text-mid)" }}>{player.xp.toLocaleString()} / {player.xpNext.toLocaleString()}</span>
              </span>
              <span style={{ color: "var(--purple-glow)", fontSize: 10, fontFamily: "var(--font-mono)" }}>{xpPct}%</span>
            </div>
            <div style={{ height: 8, background: "rgba(155,93,229,0.1)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${xpPct}%`,
                background: "linear-gradient(90deg, rgba(155,93,229,0.6), var(--purple-core))",
                borderRadius: 4, boxShadow: "0 0 10px rgba(155,93,229,0.5)",
                transition: "width 1s ease",
              }} />
            </div>
          </div>
        </div>

        {/* Stat points */}
        <div style={{ background: "var(--bg-card)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 6, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "var(--gold-core)", fontSize: 11, fontFamily: "var(--font-title)", letterSpacing: 1 }}>PONTOS DE ATRIBUTO DISPONÍVEIS</span>
            <span style={{
              background: "rgba(255,215,0,0.15)", color: "var(--gold-core)",
              fontFamily: "var(--font-title)", fontSize: 16, fontWeight: 700,
              padding: "2px 12px", borderRadius: 3, border: "1px solid rgba(255,215,0,0.3)",
            }}>{points}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {stats.map(s => (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: s.color, width: 32, fontSize: 10, fontFamily: "var(--font-title)", fontWeight: 700 }}>{s.key}</span>
                <span style={{ color: "var(--text-mid)", width: 26, fontSize: 11, fontFamily: "var(--font-mono)", textAlign: "right" }}>{s.value}</span>
                <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(s.value / s.max) * 100}%`, background: s.color, borderRadius: 2, boxShadow: `0 0 6px ${s.color}66` }} />
                </div>
                <button
                  onClick={() => points > 0 && setPoints(p => p - 1)}
                  disabled={points === 0}
                  style={{
                    width: 22, height: 22, borderRadius: 2, border: `1px solid ${s.color}44`,
                    background: `${s.color}11`, color: s.color, cursor: points > 0 ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: points === 0 ? 0.3 : 1, transition: "all 0.15s",
                    fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
                  }}>+</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Radar */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 6, padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ color: "var(--text-dim)", fontSize: 10, letterSpacing: 3, fontFamily: "var(--font-title)", marginBottom: 12 }}>VISÃO GERAL DOS ATRIBUTOS</div>
          <StatRadar stats={stats} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 16px", marginTop: 12, width: "100%" }}>
            {stats.map(s => (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: 1, background: s.color, boxShadow: `0 0 4px ${s.color}` }} />
                <span style={{ color: "var(--text-dim)", fontSize: 10, fontFamily: "var(--font-mono)" }}>{s.key}: </span>
                <span style={{ color: s.color, fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info grid */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 6, padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Classe",  value: player.class,                    color: "var(--purple-glow)" },
            { label: "Rank",    value: "Rank S",                        color: "var(--gold-core)" },
            { label: "Nível",   value: player.level,                    color: "var(--blue-glow)" },
            { label: "Guilda",  value: "Ahjin",                         color: "var(--cyan-core)" },
            { label: "Ouro",    value: `◆ ${player.gold.toLocaleString()}`, color: "var(--gold-core)" },
            { label: "Sombras", value: "XXXXXXXX/∞",                    color: "var(--text-mid)" },
          ].map(item => (
            <div key={item.label} style={{ borderLeft: "2px solid rgba(79,140,255,0.25)", paddingLeft: 10 }}>
              <div style={{ color: "var(--text-dim)", fontSize: 9, letterSpacing: 1, fontFamily: "var(--font-mono)", marginBottom: 2 }}>{item.label}</div>
              <div style={{ color: item.color, fontSize: 13, fontFamily: "var(--font-title)", fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Titles */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 6, padding: 16 }}>
          <div style={{ color: "var(--text-dim)", fontSize: 10, letterSpacing: 3, fontFamily: "var(--font-title)", marginBottom: 10 }}>TÍTULOS ADQUIRIDOS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Monarca das Sombras", "Conquistador de Masmorras", "Matador do Rei Formiga", "O Mais Forte do Mundo", "Soberano da Morte", "Sucessor dos Soberanos"].map(t => (
              <span key={t} style={{
                background: "rgba(155,93,229,0.1)", border: "1px solid rgba(155,93,229,0.25)",
                color: "var(--purple-glow)", fontSize: 10, padding: "3px 10px",
                fontFamily: "var(--font-ui)", borderRadius: 2, fontWeight: 600,
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SKILLS TAB ────────────────────────────────────────────────────────────────

function SkillsTab() {
  const [selected, setSelected] = useState(null);
  const rankColors = { EX: "#ff66dd", S: "#ffd700", A: "#9b5de5", B: "#4f8cff", C: "#00ff88" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, animation: "appear-up 0.4s ease" }}>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ color: "var(--text-dim)", fontSize: 10, letterSpacing: 3, fontFamily: "var(--font-title)", marginBottom: 4 }}>LIVRO DE HABILIDADES</div>
        {SKILLS.map(sk => {
          const rc = rankColors[sk.rank] || "var(--text-mid)";
          const isSelected = selected?.id === sk.id;
          return (
            <div key={sk.id} onClick={() => setSelected(sk)} style={{
              background: isSelected ? "rgba(79,140,255,0.08)" : "var(--bg-card)",
              border: `1px solid ${isSelected ? "rgba(79,140,255,0.4)" : "var(--border-dim)"}`,
              borderRadius: 5, padding: "12px 14px", cursor: "pointer",
              transition: "all 0.2s", position: "relative", overflow: "hidden",
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "var(--bg-card)"; }}
            >
              {isSelected && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "var(--blue-core)", boxShadow: "0 0 8px var(--blue-core)" }} />}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 3,
                    background: `${rc}15`, border: `1px solid ${rc}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: rc, flexShrink: 0,
                  }}>
                    <LucideIcon name={sk.icon} size={15} color={rc} />
                  </div>
                  <div>
                    <div style={{ color: "var(--text-bright)", fontSize: 13, fontFamily: "var(--font-ui)", fontWeight: 600 }}>{sk.name}</div>
                    <div style={{ color: "var(--text-dim)", fontSize: 10, fontFamily: "var(--font-mono)", marginTop: 1 }}>
                      {sk.type === "Ativo" ? `MP: ${sk.mp.toLocaleString()}` : "Passivo"}
                      {sk.cd > 0 && ` · CD: ${sk.cd}s`}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{
                    background: `${rc}18`, border: `1px solid ${rc}44`,
                    color: rc, fontSize: 10, padding: "2px 8px",
                    fontFamily: "var(--font-title)", fontWeight: 700, borderRadius: 2,
                  }}>Rank {sk.rank}</span>
                  <span style={{
                    background: sk.type === "Ativo" ? "rgba(79,140,255,0.1)" : "rgba(0,255,136,0.1)",
                    color: sk.type === "Ativo" ? "var(--blue-glow)" : "var(--green-core)",
                    fontSize: 9, padding: "1px 6px", borderRadius: 2, fontFamily: "var(--font-mono)",
                  }}>{sk.type}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        {selected ? (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 6, padding: 24, height: "100%", animation: "appear-up 0.25s ease" }}>
            <div style={{ color: "var(--text-dim)", fontSize: 10, letterSpacing: 3, fontFamily: "var(--font-title)", marginBottom: 18 }}>DETALHES DA HABILIDADE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 5,
                background: "rgba(79,140,255,0.08)", border: "1px solid rgba(79,140,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 20px rgba(79,140,255,0.1)",
              }}>
                <LucideIcon name={selected.icon} size={26} color="var(--blue-glow)" />
              </div>
              <div>
                <div style={{ color: "var(--text-bright)", fontSize: 18, fontFamily: "var(--font-title)", fontWeight: 700, marginBottom: 6 }}>{selected.name}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Rank " + selected.rank, selected.type].map(tag => (
                    <span key={tag} style={{
                      background: "rgba(155,93,229,0.1)", border: "1px solid rgba(155,93,229,0.3)",
                      color: "var(--purple-glow)", fontSize: 10, padding: "2px 8px",
                      fontFamily: "var(--font-title)", borderRadius: 2,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ color: "var(--text-mid)", fontSize: 12, lineHeight: 1.7, marginBottom: 20, fontFamily: "var(--font-body)", borderLeft: "2px solid rgba(155,93,229,0.3)", paddingLeft: 14 }}>
              {selected.desc}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Custo MP", value: selected.type === "Ativo" ? selected.mp.toLocaleString() : "—" },
                { label: "Recarga",  value: selected.cd > 0 ? `${selected.cd} segundos` : "Nenhuma" },
                { label: "Tipo",     value: selected.type },
                { label: "Rank",     value: `Rank ${selected.rank}` },
              ].map(d => (
                <div key={d.label} style={{ background: "rgba(79,140,255,0.05)", border: "1px solid var(--border-dim)", borderRadius: 4, padding: "10px 14px" }}>
                  <div style={{ color: "var(--text-dim)", fontSize: 9, letterSpacing: 1, fontFamily: "var(--font-mono)", marginBottom: 4 }}>{d.label}</div>
                  <div style={{ color: "var(--blue-glow)", fontSize: 13, fontFamily: "var(--font-ui)", fontWeight: 600 }}>{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 6, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, opacity: 0.5 }}>
            <LucideIcon name="book-open" size={36} color="var(--text-dim)" />
            <div style={{ color: "var(--text-dim)", fontSize: 12, fontFamily: "var(--font-ui)", letterSpacing: 1 }}>Selecione uma habilidade para ver detalhes</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── QUESTS TAB ────────────────────────────────────────────────────────────────

function QuestsTab() {
  const [filter, setFilter] = useState("Todas");
  const filters = ["Todas", "Diária", "Principal", "Secundária", "Penalidade"];
  const shown = filter === "Todas" ? QUESTS : QUESTS.filter(q => q.type === filter);
  const typeColors = { Diária: "#00d4ff", Principal: "#ffd700", Secundária: "#9b5de5", Penalidade: "#ff4466" };

  return (
    <div style={{ animation: "appear-up 0.4s ease" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? "rgba(79,140,255,0.15)" : "transparent",
            border: `1px solid ${filter === f ? "rgba(79,140,255,0.5)" : "var(--border-dim)"}`,
            color: filter === f ? "var(--blue-glow)" : "var(--text-dim)",
            padding: "5px 14px", borderRadius: 3, cursor: "pointer",
            fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: 1, transition: "all 0.15s",
          }}>{f}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {shown.map(q => {
          const tc = typeColors[q.type] || "var(--text-mid)";
          const done = q.tasks.filter(t => t.done).length;
          const total = q.tasks.length;
          const pct = Math.round((done / total) * 100);
          return (
            <div key={q.id} style={{
              background: q.isPenalty ? "rgba(255,68,102,0.04)" : "var(--bg-card)",
              border: `1px solid ${q.isPenalty ? "rgba(255,68,102,0.25)" : q.status === "completed" ? "rgba(0,255,136,0.2)" : "var(--border-dim)"}`,
              borderRadius: 6, padding: 18, position: "relative", overflow: "hidden",
            }}>
              {q.isPenalty && <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, rgba(255,68,102,0.02) 0px, rgba(255,68,102,0.02) 2px, transparent 2px, transparent 12px)" }} />}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{
                      background: `${tc}18`, border: `1px solid ${tc}44`,
                      color: tc, fontSize: 9, padding: "2px 8px",
                      fontFamily: "var(--font-title)", letterSpacing: 1, borderRadius: 2,
                    }}>{q.type} Quest</span>
                    {q.status === "completed" && (
                      <span style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", color: "var(--green-core)", fontSize: 9, padding: "2px 8px", fontFamily: "var(--font-title)", borderRadius: 2 }}>✓ Concluída</span>
                    )}
                    {q.isPenalty && <span style={{ color: "#ff4466", fontSize: 11, fontFamily: "var(--font-title)", animation: "flicker 2s ease infinite" }}>⚠ PENALIDADE</span>}
                  </div>
                  <div style={{ color: "var(--text-bright)", fontSize: 15, fontFamily: "var(--font-title)", fontWeight: 600, marginBottom: 4 }}>{q.title}</div>
                  <div style={{ color: "var(--text-mid)", fontSize: 11, fontFamily: "var(--font-body)", lineHeight: 1.5, maxWidth: 500 }}>{q.desc}</div>
                </div>
                {q.timeLeft && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,68,102,0.08)", border: "1px solid rgba(255,68,102,0.2)", borderRadius: 4, padding: "6px 12px", flexShrink: 0 }}>
                    <LucideIcon name="clock" size={12} color="var(--red-core)" />
                    <span style={{ color: "var(--red-core)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{q.timeLeft}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6, marginBottom: 14 }}>
                {q.tasks.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 2,
                      border: `1px solid ${t.done ? "var(--green-core)" : "var(--border-dim)"}`,
                      background: t.done ? "rgba(0,255,136,0.15)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {t.done && <LucideIcon name="check" size={10} color="var(--green-core)" />}
                    </div>
                    <span style={{ color: t.done ? "var(--text-dim)" : "var(--text-mid)", fontSize: 11, fontFamily: "var(--font-body)", textDecoration: t.done ? "line-through" : "none" }}>
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "var(--text-dim)", fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: 1 }}>PROGRESSO</span>
                    <span style={{ color: pct === 100 ? "var(--green-core)" : "var(--text-mid)", fontSize: 9, fontFamily: "var(--font-mono)" }}>{done}/{total}</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "var(--green-core)" : tc, borderRadius: 2, transition: "width 0.5s", boxShadow: `0 0 6px ${tc}66` }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  {q.reward.xp > 0 && <span style={{ color: "var(--purple-glow)", fontSize: 10, fontFamily: "var(--font-mono)" }}>+{q.reward.xp.toLocaleString()} XP</span>}
                  {q.reward.gold > 0 && <span style={{ color: "var(--gold-core)", fontSize: 10, fontFamily: "var(--font-mono)" }}>+{q.reward.gold.toLocaleString()} G</span>}
                  {q.reward.stat && <span style={{ color: "var(--cyan-core)", fontSize: 10, fontFamily: "var(--font-mono)" }}>{q.reward.stat}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── INVENTORY TAB ─────────────────────────────────────────────────────────────

function InventoryTab() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("Todos");
  const types = ["Todos", "Arma", "Armadura", "Consumível", "Material", "Caixa"];
  const shown = filter === "Todos" ? INVENTORY : INVENTORY.filter(i => i.type === filter);

  const itemIcon = (type) => {
    if (type === "Arma") return "⚔";
    if (type === "Armadura") return "🛡";
    if (type === "Consumível") return "⚗";
    if (type === "Caixa") return "📦";
    return "💎";
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, animation: "appear-up 0.4s ease" }}>
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              background: filter === t ? "rgba(79,140,255,0.15)" : "transparent",
              border: `1px solid ${filter === t ? "rgba(79,140,255,0.5)" : "var(--border-dim)"}`,
              color: filter === t ? "var(--blue-glow)" : "var(--text-dim)",
              padding: "4px 12px", borderRadius: 3, cursor: "pointer",
              fontFamily: "var(--font-title)", fontSize: 10, letterSpacing: 1, transition: "all 0.15s",
            }}>{t}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
          {shown.map(item => {
            const gc = GRADE_COLOR[item.grade] || "var(--text-mid)";
            const isSelected = selected?.id === item.id;
            return (
              <div key={item.id} onClick={() => setSelected(item)} style={{
                background: isSelected ? `${gc}08` : "var(--bg-card)",
                border: `1px solid ${isSelected ? `${gc}55` : "var(--border-dim)"}`,
                borderRadius: 5, padding: 12, cursor: "pointer", transition: "all 0.2s", position: "relative",
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--bg-hover)"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "var(--bg-card)"; }}
              >
                {item.equipped && (
                  <div style={{
                    position: "absolute", top: 6, right: 6,
                    background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.4)",
                    color: "var(--green-core)", fontSize: 8, padding: "1px 5px", borderRadius: 2,
                    fontFamily: "var(--font-title)",
                  }}>EQ</div>
                )}
                <div style={{
                  width: 36, height: 36, borderRadius: 4,
                  background: `${gc}12`, border: `1px solid ${gc}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 10, fontSize: 18,
                }}>{itemIcon(item.type)}</div>
                <div style={{ color: gc, fontSize: 12, fontFamily: "var(--font-ui)", fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>{item.name}</div>
                <div style={{ color: "var(--text-dim)", fontSize: 9, fontFamily: "var(--font-mono)" }}>
                  {item.grade} · {item.type}{item.qty && ` · x${item.qty}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        {selected ? (() => {
          const gc = GRADE_COLOR[selected.grade] || "var(--text-mid)";
          return (
            <div style={{ background: "var(--bg-card)", border: `1px solid ${gc}33`, borderRadius: 6, padding: 20, animation: "appear-up 0.25s ease", position: "sticky", top: 0 }}>
              <div style={{ color: "var(--text-dim)", fontSize: 10, letterSpacing: 3, fontFamily: "var(--font-title)", marginBottom: 16 }}>DETALHES DO ITEM</div>
              <div style={{ width: 60, height: 60, borderRadius: 6, background: `${gc}12`, border: `1px solid ${gc}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 14, boxShadow: `0 0 20px ${gc}22` }}>
                {itemIcon(selected.type)}
              </div>
              <div style={{ color: gc, fontSize: 15, fontFamily: "var(--font-title)", fontWeight: 700, marginBottom: 6, textShadow: `0 0 10px ${gc}66` }}>{selected.name}</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                <span style={{ background: `${gc}15`, border: `1px solid ${gc}33`, color: gc, fontSize: 10, padding: "2px 8px", fontFamily: "var(--font-title)", borderRadius: 2 }}>{selected.grade}</span>
                <span style={{ background: "rgba(79,140,255,0.1)", border: "1px solid rgba(79,140,255,0.25)", color: "var(--blue-glow)", fontSize: 10, padding: "2px 8px", fontFamily: "var(--font-title)", borderRadius: 2 }}>{selected.type}</span>
              </div>
              <div style={{ color: "var(--text-mid)", fontSize: 11, lineHeight: 1.6, fontFamily: "var(--font-body)", marginBottom: 16, borderLeft: "2px solid rgba(79,140,255,0.25)", paddingLeft: 12 }}>{selected.desc}</div>
              {selected.atk  && <div style={{ color: "#ff6644", fontSize: 12, fontFamily: "var(--font-mono)", marginBottom: 4 }}>ATK {selected.atk}</div>}
              {selected.def  && <div style={{ color: "#4f8cff", fontSize: 12, fontFamily: "var(--font-mono)", marginBottom: 4 }}>DEF {selected.def}</div>}
              {selected.heal && <div style={{ color: "#00ff88", fontSize: 12, fontFamily: "var(--font-mono)", marginBottom: 4 }}>HEAL {selected.heal}</div>}
              {selected.slot && <div style={{ color: "var(--text-dim)", fontSize: 10, fontFamily: "var(--font-mono)", marginBottom: 12 }}>ENCAIXE: {selected.slot}</div>}
              <button style={{
                width: "100%", padding: "8px 0", borderRadius: 4,
                background: selected.equipped ? "rgba(255,68,102,0.1)" : "rgba(79,140,255,0.1)",
                border: `1px solid ${selected.equipped ? "rgba(255,68,102,0.35)" : "rgba(79,140,255,0.35)"}`,
                color: selected.equipped ? "var(--red-core)" : "var(--blue-glow)",
                fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: 1, cursor: "pointer",
              }}>
                {selected.equipped ? "DESEQUIPAR" : selected.type === "Consumível" ? "USAR" : "EQUIPAR"}
              </button>
            </div>
          );
        })() : (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 6, height: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, opacity: 0.5 }}>
            <LucideIcon name="package" size={30} color="var(--text-dim)" />
            <div style={{ color: "var(--text-dim)", fontSize: 11, fontFamily: "var(--font-ui)", letterSpacing: 1 }}>Selecione um item</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SHADOW ARMY TAB ───────────────────────────────────────────────────────────

function ShadowArmyTab() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ animation: "appear-up 0.4s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Total de Soldados", value: "2.847 / ∞", color: "var(--purple-core)" },
          { label: "Marechais",         value: "2",          color: "var(--gold-core)" },
          { label: "Poder Combinado",   value: "S+",         color: "var(--red-core)" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 5, padding: 14, textAlign: "center" }}>
            <div style={{ color: s.color, fontSize: 20, fontFamily: "var(--font-title)", fontWeight: 700, marginBottom: 4 }}>{s.value}</div>
            <div style={{ color: "var(--text-dim)", fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {SHADOWS.map(s => {
          const rc = RANK_COLOR[s.rank] || "var(--text-mid)";
          const isSelected = selected?.id === s.id;
          return (
            <div key={s.id} onClick={() => setSelected(isSelected ? null : s)} style={{
              background: isSelected ? "rgba(155,93,229,0.07)" : "var(--bg-card)",
              border: `1px solid ${isSelected ? "rgba(155,93,229,0.4)" : "var(--border-dim)"}`,
              borderRadius: 6, padding: 16, cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "var(--bg-card)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 4, flexShrink: 0,
                  background: `${rc}12`, border: `1px solid ${rc}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 12px ${rc}22`,
                }}>
                  <LucideIcon name={s.icon} size={20} color={rc} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "var(--text-bright)", fontSize: 14, fontFamily: "var(--font-title)", fontWeight: 600, marginBottom: 4 }}>{s.name}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ background: `${rc}15`, border: `1px solid ${rc}33`, color: rc, fontSize: 9, padding: "1px 7px", fontFamily: "var(--font-title)", borderRadius: 2 }}>{s.rank}</span>
                    <span style={{ color: "var(--text-dim)", fontSize: 10, fontFamily: "var(--font-mono)" }}>{s.type}</span>
                  </div>
                </div>
                <div style={{ color: "var(--purple-glow)", fontSize: 13, fontFamily: "var(--font-title)", fontWeight: 700 }}>Lv.{s.level}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {[
                  { k: "STR", v: s.str, c: "#ff6644" },
                  { k: "VIT", v: s.vit, c: "#ff4466" },
                  { k: "AGI", v: s.agi, c: "#00d4ff" },
                ].map(st => (
                  <div key={st.k}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ color: st.c, fontSize: 8, fontFamily: "var(--font-title)" }}>{st.k}</span>
                      <span style={{ color: "var(--text-mid)", fontSize: 8, fontFamily: "var(--font-mono)" }}>{st.v}</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(st.v / 500) * 100}%`, background: st.c, borderRadius: 2, boxShadow: `0 0 4px ${st.c}66` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── NAVIGATION TABS ───────────────────────────────────────────────────────────

const TABS = [
  { id: "status",    label: "Status",              icon: "layout-dashboard" },
  { id: "skills",    label: "Habilidades",         icon: "book-open" },
  { id: "quests",    label: "Missões",             icon: "list-checks" },
  { id: "inventory", label: "Inventário",          icon: "package" },
  { id: "army",      label: "Exército de Sombras", icon: "users" },
];

// ── APP ───────────────────────────────────────────────────────────────────────

function App() {
  const [tab, setTab] = useState("status");
  const [alerts, setAlerts] = useState([
    { id: 1, msg: "Uma nova missão foi atribuída.", sub: "Verifique o seu Registro de Missões imediatamente.", type: "warning" },
  ]);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => setClock(new Date().toTimeString().slice(0, 8));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAlerts(a => [...a, {
        id: Date.now(),
        msg: "Timer da Missão Diária ativo.",
        sub: "04:23:11 restantes para concluir o treinamento.",
        type: "danger",
      }]);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismissAlert = (id) => setAlerts(a => a.filter(x => x.id !== id));

  const tabContent = {
    status:    <StatusTab player={PLAYER} stats={STATS} />,
    skills:    <SkillsTab />,
    quests:    <QuestsTab />,
    inventory: <InventoryTab />,
    army:      <ShadowArmyTab />,
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <Background />

      {/* Alerts */}
      <div style={{ position: "fixed", top: 70, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {alerts.map(a => (
          <SystemAlert key={a.id} message={a.msg} sub={a.sub} type={a.type} onClose={() => dismissAlert(a.id)} />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <div style={{
          height: 52, background: "rgba(5,5,15,0.95)", borderBottom: "1px solid var(--border-dim)",
          display: "flex", alignItems: "center", padding: "0 24px",
          backdropFilter: "blur(8px)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginRight: 32 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 3,
              background: "linear-gradient(135deg, var(--purple-dim), var(--blue-dim))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, border: "1px solid rgba(155,93,229,0.4)",
              boxShadow: "0 0 12px rgba(155,93,229,0.3)",
            }}>⚔</div>
            <div style={{ fontFamily: "var(--font-title)", fontSize: 13, fontWeight: 700, color: "var(--text-bright)", letterSpacing: 2, animation: "flicker 15s ease infinite" }}>
              SISTEMA
            </div>
          </div>

          <div style={{ display: "flex", gap: 2, flex: 1 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 7,
                background: tab === t.id ? "rgba(79,140,255,0.12)" : "transparent",
                border: "none", borderBottom: `2px solid ${tab === t.id ? "var(--blue-core)" : "transparent"}`,
                color: tab === t.id ? "var(--text-bright)" : "var(--text-dim)",
                padding: "0 16px", height: 52, cursor: "pointer",
                fontFamily: "var(--font-title)", fontSize: 11, letterSpacing: 1,
                transition: "all 0.15s",
              }}>
                <LucideIcon name={t.icon} size={14} color={tab === t.id ? "var(--blue-core)" : undefined} />
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ color: "var(--text-dim)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{clock}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <LucideIcon name="bell" size={14} color={alerts.length > 0 ? "var(--gold-core)" : "var(--text-dim)"} />
              {alerts.length > 0 && (
                <span style={{
                  background: "var(--red-core)", color: "#fff", fontSize: 9,
                  width: 16, height: 16, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontWeight: 700,
                }}>{alerts.length}</span>
              )}
            </div>
            <div style={{
              background: "rgba(155,93,229,0.12)", border: "1px solid rgba(155,93,229,0.35)",
              color: "var(--purple-glow)", padding: "4px 12px", borderRadius: 3,
              fontFamily: "var(--font-title)", fontSize: 11, fontWeight: 700, letterSpacing: 1,
              animation: "rank-glow 3s ease infinite",
            }}>RANK S</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          {tabContent[tab]}
        </div>

        {/* Bottom bar */}
        <div style={{
          height: 28, background: "rgba(3,3,12,0.98)", borderTop: "1px solid var(--border-dim)",
          display: "flex", alignItems: "center", padding: "0 20px", gap: 24, flexShrink: 0,
        }}>
          <span style={{ color: "var(--text-dim)", fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: 1 }}>SISTEMA v4.1.0</span>
          <span style={{ color: "rgba(0,255,136,0.7)", fontSize: 9, fontFamily: "var(--font-mono)" }}>● ONLINE</span>
          <span style={{ color: "var(--text-dim)", fontSize: 9, fontFamily: "var(--font-mono)" }}>JOGADOR: {PLAYER.name.toUpperCase()}</span>
          <span style={{ color: "var(--text-dim)", fontSize: 9, fontFamily: "var(--font-mono)" }}>LV.{PLAYER.level}</span>
          <span style={{ flex: 1 }} />
          <span style={{ color: "var(--text-dim)", fontSize: 9, fontFamily: "var(--font-mono)" }}>PROTOCOLO DO MONARCA DAS SOMBRAS — ATIVO</span>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
