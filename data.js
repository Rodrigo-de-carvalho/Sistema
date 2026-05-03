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

const DAILY_QUESTS = [
  {
    id: "force", category: "Força", title: "Regime de Força",
    desc: "Fortaleça seu corpo. Cada repetição constrói disciplina.",
    icon: "zap",
    tasks: [
      { id: "push_ups", label: "100 Flexões",       xp: 150, stat: "FOR" },
      { id: "squats",   label: "100 Agachamentos",  xp: 150, stat: "FOR" },
      { id: "abs",      label: "100 Abdominais",    xp: 100, stat: "VIT" },
    ],
    bonusXP: 100, gold: 200,
  },
  {
    id: "cardio", category: "Agilidade", title: "Protocolo Cardio",
    desc: "Melhore sua resistência cardiovascular com movimento.",
    icon: "activity",
    tasks: [
      { id: "run_5km", label: "Correr 5km",         xp: 250, stat: "AGI" },
      { id: "stretch", label: "Alongamento 15min",  xp: 100, stat: "AGI" },
    ],
    bonusXP: 100, gold: 175,
  },
  {
    id: "study", category: "Inteligência", title: "Sessão de Estudos",
    desc: "Invista em conhecimento. A mente é sua arma mais poderosa.",
    icon: "book-open",
    tasks: [
      { id: "study_1h",    label: "Estudar 1 hora",            xp: 200, stat: "INT" },
      { id: "read_30min",  label: "Ler por 30 minutos",        xp: 150, stat: "PER" },
      { id: "practice",    label: "Praticar uma habilidade",   xp: 150, stat: "INT" },
    ],
    bonusXP: 150, gold: 225,
  },
  {
    id: "wellness", category: "Vitalidade", title: "Protocolo de Bem-Estar",
    desc: "Cuide do seu corpo. É o único que você tem.",
    icon: "moon",
    tasks: [
      { id: "water_2l",  label: "Beber 2L de água",   xp: 100, stat: "VIT" },
      { id: "sleep_8h",  label: "Dormir 8 horas",     xp: 200, stat: "VIT" },
      { id: "eat_clean", label: "Alimentação limpa",  xp: 100, stat: "VIT" },
    ],
    bonusXP: 100, gold: 200,
  },
  {
    id: "mind", category: "Percepção", title: "Clareza Mental",
    desc: "Treine sua mente. Percepção aguçada é poder real.",
    icon: "eye",
    tasks: [
      { id: "meditate", label: "Meditar 15 minutos",  xp: 150, stat: "PER" },
      { id: "journal",  label: "Escrever no diário",  xp: 100, stat: "PER" },
      { id: "no_phone", label: "1h sem telas",        xp: 150, stat: "RES" },
    ],
    bonusXP: 100, gold: 175,
  },
];

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
