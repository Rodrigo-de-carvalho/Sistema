// ── data.js — constantes e dados do jogo ─────────────────────────

// ── Freemium ──────────────────────────────────────────────────────
const FREE_RANKS        = ["E", "D", "C"];
const PREMIUM_XP_BONUS  = 0.25; // 25% a mais em todo XP
const SHIELDS_FREE      = 1;    // escudos de streak por mês (free)
const SHIELDS_PREMIUM   = 4;    // escudos de streak por mês (premium)

const RANK_COLORS = {
  E:        "#8899cc",
  D:        "#00ff88",
  C:        "#4f8cff",
  B:        "#9b5de5",
  A:        "#ffd700",
  S:        "#ff66dd",
  SS:       "#ff4444",
  SSS:      "#ff8800",
  Nacional: "#ffffff",
};

const GRADE_COLOR = {
  Comum: "#aaaaaa", Incomum: "#00ff88", Raro: "#4f8cff",
  Épico: "#9b5de5", Lendário: "#ffd700", Mítico: "#ff66dd",
};

const STAT_META = [
  { key: "FOR", label: "Força",        color: "#ff6644", desc: "Exercícios de resistência" },
  { key: "VIT", label: "Vitalidade",   color: "#ff4466", desc: "Sono, hidratação e bem-estar" },
  { key: "AGI", label: "Agilidade",    color: "#00d4ff", desc: "Cardio e exercícios aeróbicos" },
  { key: "INT", label: "Inteligência", color: "#9b5de5", desc: "Estudo e aprendizado" },
  { key: "PER", label: "Percepção",    color: "#ffd700", desc: "Meditação e leitura" },
  { key: "RES", label: "Resistência",  color: "#00ff88", desc: "Consistência de streak" },
];

// ── Missões diárias por rank ──────────────────────────────────────
// Task IDs são fixos em todos os ranks para preservar o histório do questLog.
// Labels e XP mudam por rank para escalar a dificuldade.
const RANK_QUESTS = {
  E: [
    { id:"force", category:"Força", title:"Regime de Força",
      desc:"Fortaleça seu corpo. Cada repetição constrói disciplina.", icon:"zap",
      tasks:[
        { id:"push_ups", label:"10 Flexões",          xp:50,  stat:"FOR" },
        { id:"squats",   label:"15 Agachamentos",     xp:50,  stat:"FOR" },
        { id:"abs",      label:"10 Abdominais",       xp:30,  stat:"VIT" },
      ], bonusXP:30, gold:60 },
    { id:"cardio", category:"Agilidade", title:"Protocolo Cardio",
      desc:"Melhore sua resistência cardiovascular com movimento.", icon:"activity",
      tasks:[
        { id:"run_5km",  label:"Caminhar 1km",        xp:50,  stat:"AGI" },
        { id:"stretch",  label:"Alongamento 5min",    xp:30,  stat:"AGI" },
      ], bonusXP:30, gold:50 },
    { id:"study", category:"Inteligência", title:"Sessão de Estudos",
      desc:"Invista em conhecimento. A mente é sua arma mais poderosa.", icon:"book-open",
      tasks:[
        { id:"study_1h",   label:"Estudar 15 minutos",       xp:60,  stat:"INT" },
        { id:"read_30min", label:"Ler por 10 minutos",       xp:50,  stat:"PER" },
        { id:"practice",   label:"Praticar uma habilidade",  xp:40,  stat:"INT" },
      ], bonusXP:50, gold:65 },
    { id:"wellness", category:"Vitalidade", title:"Protocolo de Bem-Estar",
      desc:"Cuide do seu corpo. É o único que você tem.", icon:"moon",
      tasks:[
        { id:"water_2l",  label:"Beber 2 copos d'água", xp:30, stat:"VIT" },
        { id:"sleep_8h",  label:"Dormir 7 horas",       xp:60, stat:"VIT" },
        { id:"eat_clean", label:"Alimentação limpa",    xp:40, stat:"VIT" },
      ], bonusXP:40, gold:55 },
    { id:"mind", category:"Percepção", title:"Clareza Mental",
      desc:"Treine sua mente. Percepção aguçada é poder real.", icon:"eye",
      tasks:[
        { id:"meditate", label:"Meditar 5 minutos",  xp:50, stat:"PER" },
        { id:"journal",  label:"Escrever no diário", xp:30, stat:"PER" },
        { id:"no_phone", label:"30min sem telas",    xp:40, stat:"RES" },
      ], bonusXP:40, gold:50 },
  ],
  D: [
    { id:"force", category:"Força", title:"Regime de Força",
      desc:"Fortaleça seu corpo. Cada repetição constrói disciplina.", icon:"zap",
      tasks:[
        { id:"push_ups", label:"25 Flexões",          xp:80,  stat:"FOR" },
        { id:"squats",   label:"30 Agachamentos",     xp:80,  stat:"FOR" },
        { id:"abs",      label:"25 Abdominais",       xp:50,  stat:"VIT" },
      ], bonusXP:50, gold:100 },
    { id:"cardio", category:"Agilidade", title:"Protocolo Cardio",
      desc:"Melhore sua resistência cardiovascular com movimento.", icon:"activity",
      tasks:[
        { id:"run_5km",  label:"Correr 2km",          xp:100, stat:"AGI" },
        { id:"stretch",  label:"Alongamento 10min",   xp:50,  stat:"AGI" },
      ], bonusXP:60, gold:90 },
    { id:"study", category:"Inteligência", title:"Sessão de Estudos",
      desc:"Invista em conhecimento. A mente é sua arma mais poderosa.", icon:"book-open",
      tasks:[
        { id:"study_1h",   label:"Estudar 30 minutos",       xp:100, stat:"INT" },
        { id:"read_30min", label:"Ler por 20 minutos",       xp:80,  stat:"PER" },
        { id:"practice",   label:"Praticar uma habilidade",  xp:60,  stat:"INT" },
      ], bonusXP:80, gold:110 },
    { id:"wellness", category:"Vitalidade", title:"Protocolo de Bem-Estar",
      desc:"Cuide do seu corpo. É o único que você tem.", icon:"moon",
      tasks:[
        { id:"water_2l",  label:"Beber 4 copos d'água", xp:50, stat:"VIT" },
        { id:"sleep_8h",  label:"Dormir 7,5 horas",     xp:90, stat:"VIT" },
        { id:"eat_clean", label:"Alimentação limpa",    xp:60, stat:"VIT" },
      ], bonusXP:60, gold:90 },
    { id:"mind", category:"Percepção", title:"Clareza Mental",
      desc:"Treine sua mente. Percepção aguçada é poder real.", icon:"eye",
      tasks:[
        { id:"meditate", label:"Meditar 10 minutos", xp:80, stat:"PER" },
        { id:"journal",  label:"Escrever no diário", xp:50, stat:"PER" },
        { id:"no_phone", label:"45min sem telas",    xp:60, stat:"RES" },
      ], bonusXP:60, gold:90 },
  ],
  C: [
    { id:"force", category:"Força", title:"Regime de Força",
      desc:"Fortaleça seu corpo. Cada repetição constrói disciplina.", icon:"zap",
      tasks:[
        { id:"push_ups", label:"50 Flexões",          xp:120, stat:"FOR" },
        { id:"squats",   label:"50 Agachamentos",     xp:120, stat:"FOR" },
        { id:"abs",      label:"50 Abdominais",       xp:80,  stat:"VIT" },
      ], bonusXP:80, gold:160 },
    { id:"cardio", category:"Agilidade", title:"Protocolo Cardio",
      desc:"Melhore sua resistência cardiovascular com movimento.", icon:"activity",
      tasks:[
        { id:"run_5km",  label:"Correr 3km",          xp:150, stat:"AGI" },
        { id:"stretch",  label:"Alongamento 15min",   xp:80,  stat:"AGI" },
      ], bonusXP:90, gold:140 },
    { id:"study", category:"Inteligência", title:"Sessão de Estudos",
      desc:"Invista em conhecimento. A mente é sua arma mais poderosa.", icon:"book-open",
      tasks:[
        { id:"study_1h",   label:"Estudar 45 minutos",       xp:150, stat:"INT" },
        { id:"read_30min", label:"Ler por 30 minutos",       xp:120, stat:"PER" },
        { id:"practice",   label:"Praticar uma habilidade",  xp:90,  stat:"INT" },
      ], bonusXP:120, gold:170 },
    { id:"wellness", category:"Vitalidade", title:"Protocolo de Bem-Estar",
      desc:"Cuide do seu corpo. É o único que você tem.", icon:"moon",
      tasks:[
        { id:"water_2l",  label:"Beber 6 copos d'água", xp:80,  stat:"VIT" },
        { id:"sleep_8h",  label:"Dormir 8 horas",       xp:120, stat:"VIT" },
        { id:"eat_clean", label:"Alimentação limpa",    xp:90,  stat:"VIT" },
      ], bonusXP:90, gold:145 },
    { id:"mind", category:"Percepção", title:"Clareza Mental",
      desc:"Treine sua mente. Percepção aguçada é poder real.", icon:"eye",
      tasks:[
        { id:"meditate", label:"Meditar 15 minutos", xp:120, stat:"PER" },
        { id:"journal",  label:"Escrever no diário", xp:80,  stat:"PER" },
        { id:"no_phone", label:"1h sem telas",       xp:90,  stat:"RES" },
      ], bonusXP:90, gold:140 },
  ],
  B: [
    { id:"force", category:"Força", title:"Regime de Força",
      desc:"Fortaleça seu corpo. Cada repetição constrói disciplina.", icon:"zap",
      tasks:[
        { id:"push_ups", label:"100 Flexões",         xp:150, stat:"FOR" },
        { id:"squats",   label:"80 Agachamentos",     xp:150, stat:"FOR" },
        { id:"abs",      label:"80 Abdominais",       xp:100, stat:"VIT" },
      ], bonusXP:100, gold:200 },
    { id:"cardio", category:"Agilidade", title:"Protocolo Cardio",
      desc:"Melhore sua resistência cardiovascular com movimento.", icon:"activity",
      tasks:[
        { id:"run_5km",  label:"Correr 5km",          xp:250, stat:"AGI" },
        { id:"stretch",  label:"Alongamento 20min",   xp:100, stat:"AGI" },
      ], bonusXP:120, gold:185 },
    { id:"study", category:"Inteligência", title:"Sessão de Estudos",
      desc:"Invista em conhecimento. A mente é sua arma mais poderosa.", icon:"book-open",
      tasks:[
        { id:"study_1h",   label:"Estudar 1 hora",            xp:200, stat:"INT" },
        { id:"read_30min", label:"Ler por 30 minutos",        xp:150, stat:"PER" },
        { id:"practice",   label:"Praticar uma habilidade",   xp:150, stat:"INT" },
      ], bonusXP:150, gold:225 },
    { id:"wellness", category:"Vitalidade", title:"Protocolo de Bem-Estar",
      desc:"Cuide do seu corpo. É o único que você tem.", icon:"moon",
      tasks:[
        { id:"water_2l",  label:"Beber 8 copos d'água", xp:100, stat:"VIT" },
        { id:"sleep_8h",  label:"Dormir 8 horas",       xp:200, stat:"VIT" },
        { id:"eat_clean", label:"Alimentação limpa",    xp:100, stat:"VIT" },
      ], bonusXP:100, gold:200 },
    { id:"mind", category:"Percepção", title:"Clareza Mental",
      desc:"Treine sua mente. Percepção aguçada é poder real.", icon:"eye",
      tasks:[
        { id:"meditate", label:"Meditar 15 minutos", xp:150, stat:"PER" },
        { id:"journal",  label:"Escrever no diário", xp:100, stat:"PER" },
        { id:"no_phone", label:"1h sem telas",       xp:150, stat:"RES" },
      ], bonusXP:100, gold:175 },
  ],
  A: [
    { id:"force", category:"Força", title:"Regime de Força",
      desc:"Fortaleça seu corpo. Cada repetição constrói disciplina.", icon:"zap",
      tasks:[
        { id:"push_ups", label:"150 Flexões",         xp:200, stat:"FOR" },
        { id:"squats",   label:"120 Agachamentos",    xp:200, stat:"FOR" },
        { id:"abs",      label:"100 Abdominais",      xp:140, stat:"VIT" },
      ], bonusXP:150, gold:270 },
    { id:"cardio", category:"Agilidade", title:"Protocolo Cardio",
      desc:"Melhore sua resistência cardiovascular com movimento.", icon:"activity",
      tasks:[
        { id:"run_5km",  label:"Correr 8km",          xp:350, stat:"AGI" },
        { id:"stretch",  label:"Alongamento 20min",   xp:130, stat:"AGI" },
      ], bonusXP:160, gold:245 },
    { id:"study", category:"Inteligência", title:"Sessão de Estudos",
      desc:"Invista em conhecimento. A mente é sua arma mais poderosa.", icon:"book-open",
      tasks:[
        { id:"study_1h",   label:"Estudar 1h30",              xp:300, stat:"INT" },
        { id:"read_30min", label:"Ler por 45 minutos",        xp:200, stat:"PER" },
        { id:"practice",   label:"Praticar uma habilidade",   xp:200, stat:"INT" },
      ], bonusXP:200, gold:310 },
    { id:"wellness", category:"Vitalidade", title:"Protocolo de Bem-Estar",
      desc:"Cuide do seu corpo. É o único que você tem.", icon:"moon",
      tasks:[
        { id:"water_2l",  label:"Beber 10 copos d'água", xp:140, stat:"VIT" },
        { id:"sleep_8h",  label:"Dormir 8 horas",        xp:250, stat:"VIT" },
        { id:"eat_clean", label:"Alimentação limpa",     xp:130, stat:"VIT" },
      ], bonusXP:150, gold:260 },
    { id:"mind", category:"Percepção", title:"Clareza Mental",
      desc:"Treine sua mente. Percepção aguçada é poder real.", icon:"eye",
      tasks:[
        { id:"meditate", label:"Meditar 20 minutos", xp:200, stat:"PER" },
        { id:"journal",  label:"Escrever no diário", xp:130, stat:"PER" },
        { id:"no_phone", label:"1h sem telas",       xp:200, stat:"RES" },
      ], bonusXP:150, gold:240 },
  ],
  S: [
    { id:"force", category:"Força", title:"Regime de Força",
      desc:"Fortaleça seu corpo. Cada repetição constrói disciplina.", icon:"zap",
      tasks:[
        { id:"push_ups", label:"200 Flexões",         xp:250, stat:"FOR" },
        { id:"squats",   label:"150 Agachamentos",    xp:250, stat:"FOR" },
        { id:"abs",      label:"150 Abdominais",      xp:180, stat:"VIT" },
      ], bonusXP:200, gold:350 },
    { id:"cardio", category:"Agilidade", title:"Protocolo Cardio",
      desc:"Melhore sua resistência cardiovascular com movimento.", icon:"activity",
      tasks:[
        { id:"run_5km",  label:"Correr 10km",         xp:450, stat:"AGI" },
        { id:"stretch",  label:"Alongamento 30min",   xp:160, stat:"AGI" },
      ], bonusXP:200, gold:305 },
    { id:"study", category:"Inteligência", title:"Sessão de Estudos",
      desc:"Invista em conhecimento. A mente é sua arma mais poderosa.", icon:"book-open",
      tasks:[
        { id:"study_1h",   label:"Estudar 2 horas",           xp:400, stat:"INT" },
        { id:"read_30min", label:"Ler por 1 hora",            xp:250, stat:"PER" },
        { id:"practice",   label:"Praticar uma habilidade",   xp:250, stat:"INT" },
      ], bonusXP:250, gold:395 },
    { id:"wellness", category:"Vitalidade", title:"Protocolo de Bem-Estar",
      desc:"Cuide do seu corpo. É o único que você tem.", icon:"moon",
      tasks:[
        { id:"water_2l",  label:"Beber 12 copos d'água", xp:180, stat:"VIT" },
        { id:"sleep_8h",  label:"Dormir 8 horas",        xp:280, stat:"VIT" },
        { id:"eat_clean", label:"Alimentação limpa",     xp:160, stat:"VIT" },
      ], bonusXP:200, gold:310 },
    { id:"mind", category:"Percepção", title:"Clareza Mental",
      desc:"Treine sua mente. Percepção aguçada é poder real.", icon:"eye",
      tasks:[
        { id:"meditate", label:"Meditar 30 minutos", xp:250, stat:"PER" },
        { id:"journal",  label:"Escrever no diário", xp:160, stat:"PER" },
        { id:"no_phone", label:"1h sem telas",       xp:250, stat:"RES" },
      ], bonusXP:200, gold:300 },
  ],
  SS: [
    { id:"force", category:"Força", title:"Regime de Força",
      desc:"Fortaleça seu corpo. Cada repetição constrói disciplina.", icon:"zap",
      tasks:[
        { id:"push_ups", label:"250 Flexões",         xp:350, stat:"FOR" },
        { id:"squats",   label:"200 Agachamentos",    xp:320, stat:"FOR" },
        { id:"abs",      label:"200 Abdominais",      xp:250, stat:"VIT" },
      ], bonusXP:280, gold:450 },
    { id:"cardio", category:"Agilidade", title:"Protocolo Cardio",
      desc:"Melhore sua resistência cardiovascular com movimento.", icon:"activity",
      tasks:[
        { id:"run_5km",  label:"Correr 12km",         xp:600, stat:"AGI" },
        { id:"stretch",  label:"Alongamento 30min",   xp:200, stat:"AGI" },
      ], bonusXP:280, gold:400 },
    { id:"study", category:"Inteligência", title:"Sessão de Estudos",
      desc:"Invista em conhecimento. A mente é sua arma mais poderosa.", icon:"book-open",
      tasks:[
        { id:"study_1h",   label:"Estudar 2h30",              xp:550, stat:"INT" },
        { id:"read_30min", label:"Ler por 1 hora",            xp:350, stat:"PER" },
        { id:"practice",   label:"Praticar 2 habilidades",    xp:350, stat:"INT" },
      ], bonusXP:350, gold:540 },
    { id:"wellness", category:"Vitalidade", title:"Protocolo de Bem-Estar",
      desc:"Cuide do seu corpo. É o único que você tem.", icon:"moon",
      tasks:[
        { id:"water_2l",  label:"Beber 14 copos d'água", xp:250, stat:"VIT" },
        { id:"sleep_8h",  label:"Dormir 8 horas",        xp:350, stat:"VIT" },
        { id:"eat_clean", label:"Alimentação limpa",     xp:200, stat:"VIT" },
      ], bonusXP:280, gold:420 },
    { id:"mind", category:"Percepção", title:"Clareza Mental",
      desc:"Treine sua mente. Percepção aguçada é poder real.", icon:"eye",
      tasks:[
        { id:"meditate", label:"Meditar 30 minutos", xp:350, stat:"PER" },
        { id:"journal",  label:"Escrever no diário", xp:200, stat:"PER" },
        { id:"no_phone", label:"2h sem telas",       xp:350, stat:"RES" },
      ], bonusXP:280, gold:400 },
  ],
  SSS: [
    { id:"force", category:"Força", title:"Regime de Força",
      desc:"Fortaleça seu corpo. Cada repetição constrói disciplina.", icon:"zap",
      tasks:[
        { id:"push_ups", label:"300 Flexões",         xp:450, stat:"FOR" },
        { id:"squats",   label:"250 Agachamentos",    xp:400, stat:"FOR" },
        { id:"abs",      label:"250 Abdominais",      xp:320, stat:"VIT" },
      ], bonusXP:380, gold:565 },
    { id:"cardio", category:"Agilidade", title:"Protocolo Cardio",
      desc:"Melhore sua resistência cardiovascular com movimento.", icon:"activity",
      tasks:[
        { id:"run_5km",  label:"Correr 15km",         xp:800, stat:"AGI" },
        { id:"stretch",  label:"Alongamento 30min",   xp:250, stat:"AGI" },
      ], bonusXP:380, gold:520 },
    { id:"study", category:"Inteligência", title:"Sessão de Estudos",
      desc:"Invista em conhecimento. A mente é sua arma mais poderosa.", icon:"book-open",
      tasks:[
        { id:"study_1h",   label:"Estudar 3 horas",           xp:700, stat:"INT" },
        { id:"read_30min", label:"Ler por 1h30",              xp:450, stat:"PER" },
        { id:"practice",   label:"Praticar 2 habilidades",    xp:450, stat:"INT" },
      ], bonusXP:480, gold:720 },
    { id:"wellness", category:"Vitalidade", title:"Protocolo de Bem-Estar",
      desc:"Cuide do seu corpo. É o único que você tem.", icon:"moon",
      tasks:[
        { id:"water_2l",  label:"Beber 16 copos d'água", xp:320, stat:"VIT" },
        { id:"sleep_8h",  label:"Dormir 8 horas",        xp:400, stat:"VIT" },
        { id:"eat_clean", label:"Alimentação limpa",     xp:250, stat:"VIT" },
      ], bonusXP:380, gold:540 },
    { id:"mind", category:"Percepção", title:"Clareza Mental",
      desc:"Treine sua mente. Percepção aguçada é poder real.", icon:"eye",
      tasks:[
        { id:"meditate", label:"Meditar 45 minutos", xp:450, stat:"PER" },
        { id:"journal",  label:"Escrever no diário", xp:250, stat:"PER" },
        { id:"no_phone", label:"2h sem telas",       xp:450, stat:"RES" },
      ], bonusXP:380, gold:510 },
  ],
  Nacional: [
    { id:"force", category:"Força", title:"Regime de Força",
      desc:"Fortaleça seu corpo. Cada repetição constrói disciplina.", icon:"zap",
      tasks:[
        { id:"push_ups", label:"500 Flexões",         xp:700, stat:"FOR" },
        { id:"squats",   label:"400 Agachamentos",    xp:600, stat:"FOR" },
        { id:"abs",      label:"400 Abdominais",      xp:500, stat:"VIT" },
      ], bonusXP:600, gold:900 },
    { id:"cardio", category:"Agilidade", title:"Protocolo Cardio",
      desc:"Melhore sua resistência cardiovascular com movimento.", icon:"activity",
      tasks:[
        { id:"run_5km",  label:"Correr 20km",         xp:1200, stat:"AGI" },
        { id:"stretch",  label:"Alongamento 30min",   xp:350,  stat:"AGI" },
      ], bonusXP:600, gold:790 },
    { id:"study", category:"Inteligência", title:"Sessão de Estudos",
      desc:"Invista em conhecimento. A mente é sua arma mais poderosa.", icon:"book-open",
      tasks:[
        { id:"study_1h",   label:"Estudar 4 horas",           xp:1000, stat:"INT" },
        { id:"read_30min", label:"Ler por 2 horas",           xp:700,  stat:"PER" },
        { id:"practice",   label:"Praticar 3 habilidades",    xp:700,  stat:"INT" },
      ], bonusXP:750, gold:1100 },
    { id:"wellness", category:"Vitalidade", title:"Protocolo de Bem-Estar",
      desc:"Cuide do seu corpo. É o único que você tem.", icon:"moon",
      tasks:[
        { id:"water_2l",  label:"Beber 20 copos d'água", xp:500, stat:"VIT" },
        { id:"sleep_8h",  label:"Dormir 8 horas",        xp:600, stat:"VIT" },
        { id:"eat_clean", label:"Alimentação limpa",     xp:350, stat:"VIT" },
      ], bonusXP:600, gold:825 },
    { id:"mind", category:"Percepção", title:"Clareza Mental",
      desc:"Treine sua mente. Percepção aguçada é poder real.", icon:"eye",
      tasks:[
        { id:"meditate", label:"Meditar 1 hora",    xp:700, stat:"PER" },
        { id:"journal",  label:"Escrever no diário",xp:350, stat:"PER" },
        { id:"no_phone", label:"3h sem telas",      xp:700, stat:"RES" },
      ], bonusXP:600, gold:795 },
  ],
};

function getQuestsForRank(rank) {
  return RANK_QUESTS[rank] || RANK_QUESTS.B;
}

// Mapa de todas as tasks por ID (usa Rank E como baseline para fallback legacy)
const ALL_TASKS_MAP = Object.values(RANK_QUESTS)
  .flatMap(qs => qs.flatMap(q => q.tasks))
  .reduce((m, t) => { if (!m[t.id]) m[t.id] = t; return m; }, {});

// Alias backward-compat: Rank B corresponde ao nível original das missões
const DAILY_QUESTS = RANK_QUESTS.B;

const ACHIEVEMENTS = [
  { id: "first_task",     name: "Primeiro Passo",       desc: "Complete sua primeira tarefa.",              icon: "check",        grade: "Comum",   xp: 100  },
  { id: "first_quest",    name: "Missão Cumprida",      desc: "Complete uma missão inteira.",               icon: "star",         grade: "Incomum", xp: 200  },
  { id: "streak_3",       name: "3 Dias Seguidos",      desc: "Mantenha um streak de 3 dias.",              icon: "flame",        grade: "Incomum", xp: 300  },
  { id: "streak_7",       name: "Semana Imparável",     desc: "7 dias consecutivos de atividade.",          icon: "flame",        grade: "Raro",    xp: 500  },
  { id: "streak_30",      name: "Mês de Ferro",         desc: "30 dias consecutivos.",                      icon: "shield",       grade: "Épico",   xp: 2000 },
  { id: "level_5",        name: "Aprendiz",             desc: "Alcance o nível 5.",                         icon: "trending-up",  grade: "Incomum", xp: 300  },
  { id: "level_10",       name: "Promissor",            desc: "Alcance o nível 10.",                        icon: "trending-up",  grade: "Raro",    xp: 600  },
  { id: "rank_d",         name: "Caçador Rank D",       desc: "Ascenda ao Rank D.",                         icon: "zap",          grade: "Incomum", xp: 500  },
  { id: "rank_c",         name: "Caçador Rank C",       desc: "Ascenda ao Rank C.",                         icon: "star",         grade: "Raro",    xp: 2000 },
  { id: "str_30",         name: "Corpo de Ferro",       desc: "Força atingiu 30 pontos.",                   icon: "activity",     grade: "Raro",    xp: 400  },
  { id: "int_30",         name: "Mente Afiada",         desc: "Inteligência atingiu 30 pontos.",            icon: "book-open",    grade: "Raro",    xp: 400  },
  { id: "all_quests_day", name: "Dia Perfeito",         desc: "Complete todas as 5 missões no mesmo dia.",  icon: "check",        grade: "Épico",   xp: 800  },
  { id: "tasks_50",       name: "Disciplinado",         desc: "Complete 50 tarefas no total.",              icon: "list-checks",  grade: "Raro",    xp: 1000 },
  { id: "tasks_100",      name: "Incansável",           desc: "Complete 100 tarefas no total.",             icon: "bar-chart",    grade: "Épico",   xp: 2000 },
];

const SKILLS = [
  { id: "warrior",    name: "Corpo de Guerreiro",  rank: "E", desc: "Início de uma jornada épica. +5% XP em tarefas físicas.",          type: "Passivo", icon: "zap",        unlockBy: "first_task"     },
  { id: "consistent", name: "Ritmo Constante",     rank: "D", desc: "Nível 5 alcançado. +5% XP em todas as missões.",                   type: "Passivo", icon: "trending-up",unlockBy: "level_5"        },
  { id: "iron",       name: "Disciplina de Ferro", rank: "D", desc: "7 dias de streak. Missões físicas geram +10% XP.",                 type: "Passivo", icon: "shield",     unlockBy: "streak_7"       },
  { id: "iron_body",  name: "Corpo Resistente",    rank: "C", desc: "30 pts em Força. Exercícios ficam 20% mais eficientes.",           type: "Passivo", icon: "activity",   unlockBy: "str_30"         },
  { id: "sharp",      name: "Mente Afiada",        rank: "C", desc: "30 pts em INT. Missões de estudo geram +15% XP.",                  type: "Passivo", icon: "book-open",  unlockBy: "int_30"         },
  { id: "focus",      name: "Foco Total",          rank: "C", desc: "Dia perfeito. Completar todas as missões gera +50% XP bônus.",     type: "Passivo", icon: "eye",        unlockBy: "all_quests_day" },
  { id: "willpower",  name: "Força de Vontade",    rank: "B", desc: "30 dias de streak. Resistência psicológica permanentemente +.",    type: "Passivo", icon: "flame",      unlockBy: "streak_30"      },
  { id: "clarity",    name: "Clareza Mental",      rank: "C", desc: "Rank C alcançado. Novas missões têm +20% XP.",                    type: "Passivo", icon: "moon",       unlockBy: "rank_c"         },
];

const INVENTORY_ITEMS = [
  { id: "badge_beginner",   name: "Insígnia do Iniciante",     grade: "Comum",   type: "Insígnia", desc: "Concedida a todo Caçador que dá o primeiro passo.",      unlockBy: null           },
  { id: "badge_consistent", name: "Insígnia da Consistência",  grade: "Incomum", type: "Insígnia", desc: "Concedida após 7 dias consecutivos de atividade.",        unlockBy: "streak_7"     },
  { id: "badge_perfect",    name: "Insígnia do Dia Perfeito",  grade: "Épico",   type: "Insígnia", desc: "Por completar todas as missões no mesmo dia.",            unlockBy: "all_quests_day"},
  { id: "frame_bronze",     name: "Moldura Bronze",            grade: "Incomum", type: "Moldura",  desc: "Uma moldura sólida para seu avatar.",                     unlockBy: "rank_d"       },
  { id: "frame_silver",     name: "Moldura Prateada",          grade: "Raro",    type: "Moldura",  desc: "Uma moldura elegante para Caçadores Rank C.",             unlockBy: "rank_c"       },
  { id: "title_iron",       name: "Título: Corpo de Ferro",    grade: "Raro",    type: "Título",   desc: "Para quem dominou o treinamento físico.",                 unlockBy: "str_30"       },
  { id: "title_scholar",    name: "Título: Mente Afiada",      grade: "Raro",    type: "Título",   desc: "Para os dedicados ao conhecimento.",                      unlockBy: "int_30"       },
  { id: "theme_steel",      name: "Tema: Aço",                 grade: "Lendário",type: "Tema",     desc: "Cor de destaque muda para prata metálica.",              unlockBy: "streak_7"     },
];

// achievement → items concedidos
const ACH_TO_ITEMS = INVENTORY_ITEMS
  .filter(i => i.unlockBy)
  .reduce((m, i) => ({ ...m, [i.unlockBy]: [...(m[i.unlockBy] || []), i.id] }), {});

// achievement → skill desbloqueada
const ACH_TO_SKILL = SKILLS
  .reduce((m, s) => ({ ...m, [s.unlockBy]: s.id }), {});

// ── Missões semanais (Premium) ────────────────────────────────────
const WEEKLY_QUESTS = [
  {
    id: "wk_warrior", title: "Semana do Guerreiro", category: "Força",
    desc: "Um desafio semanal de resistência física total. Apenas para Caçadores determinados.",
    icon: "zap", premium: true,
    tasks: [
      { id: "wk_500push",  label: "500 flexões na semana",     xp: 800,  stat: "FOR" },
      { id: "wk_run25",    label: "Correr 25km na semana",     xp: 1000, stat: "AGI" },
      { id: "wk_plank5",   label: "Prancha total de 5 min",    xp: 500,  stat: "VIT" },
    ],
    bonusXP: 700, gold: 1500,
  },
  {
    id: "wk_scholar", title: "Semana do Estudioso", category: "Inteligência",
    desc: "Maximize seu conhecimento. 7 dias de imersão total no aprendizado.",
    icon: "book-open", premium: true,
    tasks: [
      { id: "wk_study7h",  label: "Estudar 7 horas na semana",      xp: 1000, stat: "INT" },
      { id: "wk_chapter",  label: "Terminar 1 capítulo de livro",   xp: 500,  stat: "PER" },
      { id: "wk_newskill", label: "Aprender 1 habilidade nova",     xp: 700,  stat: "INT" },
    ],
    bonusXP: 700, gold: 1500,
  },
  {
    id: "wk_mindmaster", title: "Semana da Mente Mestra", category: "Percepção",
    desc: "Domine seu estado mental. Foco absoluto por 7 dias.",
    icon: "eye", premium: true,
    tasks: [
      { id: "wk_med7",     label: "Meditar 7 dias seguidos",       xp: 800,  stat: "PER" },
      { id: "wk_journal7", label: "Diário por 7 dias seguidos",    xp: 500,  stat: "PER" },
      { id: "wk_nophone7", label: "7 dias de 1h sem telas",        xp: 700,  stat: "RES" },
    ],
    bonusXP: 700, gold: 1500,
  },
];

// ── Conquistas épicas/lendárias (Premium) ─────────────────────────
const PREMIUM_ACHIEVEMENTS = [
  { id: "prem_streak_60",  name: "Dois Meses Imparáveis", desc: "60 dias consecutivos de atividade.",   icon: "flame",       grade: "Épico",    xp: 5000,  premium: true },
  { id: "prem_streak_100", name: "Centurião",             desc: "100 dias consecutivos.",               icon: "shield",      grade: "Lendário", xp: 10000, premium: true },
  { id: "prem_level_20",   name: "Elite",                 desc: "Alcance o nível 20.",                  icon: "trending-up", grade: "Épico",    xp: 3000,  premium: true },
  { id: "prem_all_weekly", name: "Semanas Perfeitas",     desc: "Complete 4 missões semanais.",         icon: "star",        grade: "Lendário", xp: 8000,  premium: true },
  { id: "prem_badge",      name: "Caçador Premium",       desc: "Badge exclusivo de membro Premium.",   icon: "crown",       grade: "Mítico",   xp: 1000,  premium: true },
];

const ALL_ACHIEVEMENTS = [...ACHIEVEMENTS, ...PREMIUM_ACHIEVEMENTS];

const DEFAULT_PROFILE = {
  name: "Caçador",
  avatar: null,
  xp: 0,
  level: 1,
  stats: { FOR: 10, VIT: 10, AGI: 10, INT: 10, PER: 10, RES: 10 },
  stat_points: 0,
  streak: 0,
  last_active: null,
  gold: 0,
  titles: ["Iniciante"],
  achievements: [],
  inventory_items: ["badge_beginner"],
  quest_log: {},
  weekly_log: {},
  premium_gate_shown: false,
  is_premium: false,
  streak_shields: SHIELDS_FREE,
  shields_month: null,   // "YYYY-MM" — mês do último reset
};
