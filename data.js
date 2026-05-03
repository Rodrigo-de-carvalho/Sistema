// ── data.js — constantes e dados do jogo ─────────────────────────

const FREE_RANKS = ["E", "D", "C"];

const RANK_COLORS = {
  E: "#8899cc", D: "#00ff88", C: "#4f8cff",
  B: "#9b5de5", A: "#ffd700", S: "#ff66dd",
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
  premium_gate_shown: false,
};
