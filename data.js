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

// ── Missões por Rank ──────────────────────────────────────────────
const RANK_QUESTS = {
  E: [
    { id:"force",    category:"Força",        title:"Regime de Força",       desc:"Inicie sua jornada. Cada repetição conta.",                  icon:"zap",
      tasks:[ { id:"push_10",   label:"10 Flexões",           xp:50,  stat:"FOR" },
              { id:"squat_15",  label:"15 Agachamentos",      xp:50,  stat:"FOR" } ], bonusXP:50,  gold:100 },
    { id:"cardio",   category:"Agilidade",    title:"Protocolo Cardio",      desc:"Mova seu corpo. Um passo de cada vez.",                     icon:"activity",
      tasks:[ { id:"walk_1k",   label:"Caminhar 1km",         xp:80,  stat:"AGI" } ], bonusXP:40,  gold:80  },
    { id:"study",    category:"Inteligência", title:"Sessão de Estudos",     desc:"A mente é uma arma. Comece a afiá-la.",                     icon:"book-open",
      tasks:[ { id:"study_15m", label:"Estudar 15 minutos",   xp:80,  stat:"INT" } ], bonusXP:40,  gold:80  },
    { id:"wellness", category:"Vitalidade",   title:"Protocolo de Bem-Estar",desc:"Cuide do seu corpo. É a base de tudo.",                     icon:"moon",
      tasks:[ { id:"water_2",   label:"Beber 2 copos de água",xp:60,  stat:"VIT" } ], bonusXP:30,  gold:60  },
    { id:"mind",     category:"Percepção",    title:"Clareza Mental",        desc:"Cinco minutos de silêncio valem horas de ruído.",           icon:"eye",
      tasks:[ { id:"med_5",     label:"Meditar 5 minutos",    xp:60,  stat:"PER" } ], bonusXP:30,  gold:60  },
  ],
  D: [
    { id:"force",    category:"Força",        title:"Regime de Força",       desc:"Seu corpo está se adaptando. Exija mais.",                  icon:"zap",
      tasks:[ { id:"push_25",   label:"25 Flexões",           xp:100, stat:"FOR" },
              { id:"squat_30",  label:"30 Agachamentos",      xp:100, stat:"FOR" } ], bonusXP:80,  gold:150 },
    { id:"cardio",   category:"Agilidade",    title:"Protocolo Cardio",      desc:"A resistência cardiovascular é sua armadura.",              icon:"activity",
      tasks:[ { id:"run_2k",    label:"Correr 2km",           xp:150, stat:"AGI" } ], bonusXP:70,  gold:130 },
    { id:"study",    category:"Inteligência", title:"Sessão de Estudos",     desc:"30 minutos de foco superam horas de distração.",           icon:"book-open",
      tasks:[ { id:"study_30m", label:"Estudar 30 minutos",   xp:120, stat:"INT" } ], bonusXP:60,  gold:120 },
    { id:"wellness", category:"Vitalidade",   title:"Protocolo de Bem-Estar",desc:"Hidratação é desempenho.",                                  icon:"moon",
      tasks:[ { id:"water_4",   label:"Beber 4 copos de água",xp:80,  stat:"VIT" } ], bonusXP:50,  gold:100 },
    { id:"mind",     category:"Percepção",    title:"Clareza Mental",        desc:"A meditação forja a resistência mental.",                   icon:"eye",
      tasks:[ { id:"med_10",    label:"Meditar 10 minutos",   xp:80,  stat:"PER" } ], bonusXP:50,  gold:100 },
  ],
  C: [
    { id:"force",    category:"Força",        title:"Regime de Força",       desc:"Meio centum. A disciplina está se tornando hábito.",        icon:"zap",
      tasks:[ { id:"push_50",   label:"50 Flexões",           xp:150, stat:"FOR" },
              { id:"squat_50",  label:"50 Agachamentos",      xp:150, stat:"FOR" } ], bonusXP:120, gold:200 },
    { id:"cardio",   category:"Agilidade",    title:"Protocolo Cardio",      desc:"3km por dia constrói um corredor de elite.",               icon:"activity",
      tasks:[ { id:"run_3k",    label:"Correr 3km",           xp:200, stat:"AGI" } ], bonusXP:100, gold:175 },
    { id:"study",    category:"Inteligência", title:"Sessão de Estudos",     desc:"45 minutos de estudo profundo. Sem distrações.",           icon:"book-open",
      tasks:[ { id:"study_45m", label:"Estudar 45 minutos",   xp:160, stat:"INT" } ], bonusXP:90,  gold:170 },
    { id:"wellness", category:"Vitalidade",   title:"Protocolo de Bem-Estar",desc:"Seis copos por dia. Seu corpo agradece.",                   icon:"moon",
      tasks:[ { id:"water_6",   label:"Beber 6 copos de água",xp:100, stat:"VIT" } ], bonusXP:70,  gold:140 },
    { id:"mind",     category:"Percepção",    title:"Clareza Mental",        desc:"A mente quieta enxerga o que a mente agitada não vê.",     icon:"eye",
      tasks:[ { id:"med_15",    label:"Meditar 15 minutos",   xp:100, stat:"PER" } ], bonusXP:70,  gold:140 },
  ],
  B: [
    { id:"force",    category:"Força",        title:"Regime de Força",       desc:"Centum. Um guerreiro forja o corpo sem piedade.",           icon:"zap",
      tasks:[ { id:"push_100",  label:"100 Flexões",          xp:200, stat:"FOR" },
              { id:"squat_80",  label:"80 Agachamentos",      xp:180, stat:"FOR" } ], bonusXP:160, gold:280 },
    { id:"cardio",   category:"Agilidade",    title:"Protocolo Cardio",      desc:"5km é onde os fortes se separam dos medianos.",            icon:"activity",
      tasks:[ { id:"run_5k",    label:"Correr 5km",           xp:280, stat:"AGI" } ], bonusXP:130, gold:250 },
    { id:"study",    category:"Inteligência", title:"Sessão de Estudos",     desc:"Uma hora de foco absoluto. A mente como um laser.",        icon:"book-open",
      tasks:[ { id:"study_1h",  label:"Estudar 1 hora",       xp:220, stat:"INT" } ], bonusXP:120, gold:220 },
    { id:"wellness", category:"Vitalidade",   title:"Protocolo de Bem-Estar",desc:"Oito copos. Sem negociação.",                              icon:"moon",
      tasks:[ { id:"water_8",   label:"Beber 8 copos de água",xp:130, stat:"VIT" } ], bonusXP:90,  gold:180 },
    { id:"mind",     category:"Percepção",    title:"Clareza Mental",        desc:"20 minutos de meditação profunda. Domínio mental.",        icon:"eye",
      tasks:[ { id:"med_20",    label:"Meditar 20 minutos",   xp:130, stat:"PER" } ], bonusXP:90,  gold:180 },
  ],
  A: [
    { id:"force",    category:"Força",        title:"Regime de Força",       desc:"Elite. 150 repetições que testam os limites humanos.",     icon:"zap",
      tasks:[ { id:"push_150",  label:"150 Flexões",          xp:270, stat:"FOR" },
              { id:"squat_120", label:"120 Agachamentos",     xp:240, stat:"FOR" } ], bonusXP:210, gold:380 },
    { id:"cardio",   category:"Agilidade",    title:"Protocolo Cardio",      desc:"8km. Cada metro é uma vitória sobre si mesmo.",           icon:"activity",
      tasks:[ { id:"run_8k",    label:"Correr 8km",           xp:380, stat:"AGI" } ], bonusXP:170, gold:320 },
    { id:"study",    category:"Inteligência", title:"Sessão de Estudos",     desc:"1h30 de imersão total. Conhecimento é poder.",             icon:"book-open",
      tasks:[ { id:"study_1h30",label:"Estudar 1h30",         xp:300, stat:"INT" } ], bonusXP:160, gold:300 },
    { id:"wellness", category:"Vitalidade",   title:"Protocolo de Bem-Estar",desc:"10 copos. O corpo de elite exige combustível de elite.",   icon:"moon",
      tasks:[ { id:"water_10",  label:"Beber 10 copos de água",xp:170, stat:"VIT" } ], bonusXP:120, gold:240 },
    { id:"mind",     category:"Percepção",    title:"Clareza Mental",        desc:"25 minutos. A mente afiada como uma lâmina.",              icon:"eye",
      tasks:[ { id:"med_25",    label:"Meditar 25 minutos",   xp:170, stat:"PER" } ], bonusXP:120, gold:240 },
  ],
  S: [
    { id:"force",    category:"Força",        title:"Regime de Força",       desc:"200 repetições. Apenas os lendários chegam aqui.",         icon:"zap",
      tasks:[ { id:"push_200",  label:"200 Flexões",          xp:340, stat:"FOR" },
              { id:"squat_150", label:"150 Agachamentos",     xp:300, stat:"FOR" } ], bonusXP:270, gold:500 },
    { id:"cardio",   category:"Agilidade",    title:"Protocolo Cardio",      desc:"10km diários. A resistência de um predador.",             icon:"activity",
      tasks:[ { id:"run_10k",   label:"Correr 10km",          xp:480, stat:"AGI" } ], bonusXP:210, gold:400 },
    { id:"study",    category:"Inteligência", title:"Sessão de Estudos",     desc:"2 horas de maestria. O sábio nunca para de aprender.",    icon:"book-open",
      tasks:[ { id:"study_2h",  label:"Estudar 2 horas",      xp:380, stat:"INT" } ], bonusXP:200, gold:380 },
    { id:"wellness", category:"Vitalidade",   title:"Protocolo de Bem-Estar",desc:"12 copos. O corpo Rank S não aceita menos.",              icon:"moon",
      tasks:[ { id:"water_12",  label:"Beber 12 copos de água",xp:210, stat:"VIT" } ], bonusXP:150, gold:300 },
    { id:"mind",     category:"Percepção",    title:"Clareza Mental",        desc:"30 minutos de silêncio absoluto. Mente de mestre.",        icon:"eye",
      tasks:[ { id:"med_30",    label:"Meditar 30 minutos",   xp:210, stat:"PER" } ], bonusXP:150, gold:300 },
  ],
  SS: [
    { id:"force",    category:"Força",        title:"Regime de Força",       desc:"250 repetições. Transcende o limite humano convencional.", icon:"zap",
      tasks:[ { id:"push_250",  label:"250 Flexões",          xp:400, stat:"FOR" },
              { id:"squat_200", label:"200 Agachamentos",     xp:360, stat:"FOR" } ], bonusXP:340, gold:620 },
    { id:"cardio",   category:"Agilidade",    title:"Protocolo Cardio",      desc:"15km. A velocidade do raio.",                             icon:"activity",
      tasks:[ { id:"run_15k",   label:"Correr 15km",          xp:580, stat:"AGI" } ], bonusXP:260, gold:490 },
    { id:"study",    category:"Inteligência", title:"Sessão de Estudos",     desc:"3 horas de concentração sobrenatural.",                   icon:"book-open",
      tasks:[ { id:"study_3h",  label:"Estudar 3 horas",      xp:460, stat:"INT" } ], bonusXP:240, gold:460 },
    { id:"wellness", category:"Vitalidade",   title:"Protocolo de Bem-Estar",desc:"14 copos. O corpo SS opera no limite da perfeição.",      icon:"moon",
      tasks:[ { id:"water_14",  label:"Beber 14 copos de água",xp:250, stat:"VIT" } ], bonusXP:190, gold:370 },
    { id:"mind",     category:"Percepção",    title:"Clareza Mental",        desc:"40 minutos. Percepção além do normal.",                   icon:"eye",
      tasks:[ { id:"med_40",    label:"Meditar 40 minutos",   xp:250, stat:"PER" } ], bonusXP:190, gold:370 },
  ],
  SSS: [
    { id:"force",    category:"Força",        title:"Regime de Força",       desc:"300 repetições. Um corpo forjado em outra dimensão.",     icon:"zap",
      tasks:[ { id:"push_300",  label:"300 Flexões",          xp:460, stat:"FOR" },
              { id:"squat_250", label:"250 Agachamentos",     xp:420, stat:"FOR" } ], bonusXP:400, gold:750 },
    { id:"cardio",   category:"Agilidade",    title:"Protocolo Cardio",      desc:"20km. A resistência de uma lenda viva.",                  icon:"activity",
      tasks:[ { id:"run_20k",   label:"Correr 20km",          xp:680, stat:"AGI" } ], bonusXP:310, gold:580 },
    { id:"study",    category:"Inteligência", title:"Sessão de Estudos",     desc:"4 horas de absorção absoluta de conhecimento.",           icon:"book-open",
      tasks:[ { id:"study_4h",  label:"Estudar 4 horas",      xp:540, stat:"INT" } ], bonusXP:290, gold:550 },
    { id:"wellness", category:"Vitalidade",   title:"Protocolo de Bem-Estar",desc:"16 copos. Vitalidade transcendente.",                     icon:"moon",
      tasks:[ { id:"water_16",  label:"Beber 16 copos de água",xp:300, stat:"VIT" } ], bonusXP:230, gold:450 },
    { id:"mind",     category:"Percepção",    title:"Clareza Mental",        desc:"50 minutos. A mente que vê além do véu.",                 icon:"eye",
      tasks:[ { id:"med_50",    label:"Meditar 50 minutos",   xp:300, stat:"PER" } ], bonusXP:230, gold:450 },
  ],
  Nacional: [
    { id:"force",    category:"Força",        title:"Regime de Força",       desc:"400 repetições. O pico absoluto da humanidade.",          icon:"zap",
      tasks:[ { id:"push_400",  label:"400 Flexões",          xp:550, stat:"FOR" },
              { id:"squat_300", label:"300 Agachamentos",     xp:500, stat:"FOR" } ], bonusXP:500, gold:950 },
    { id:"cardio",   category:"Agilidade",    title:"Protocolo Cardio",      desc:"25km. Uma lenda que corre além do horizonte.",            icon:"activity",
      tasks:[ { id:"run_25k",   label:"Correr 25km",          xp:800, stat:"AGI" } ], bonusXP:380, gold:720 },
    { id:"study",    category:"Inteligência", title:"Sessão de Estudos",     desc:"5 horas de iluminação. Um sábio entre sábios.",           icon:"book-open",
      tasks:[ { id:"study_5h",  label:"Estudar 5 horas",      xp:650, stat:"INT" } ], bonusXP:360, gold:680 },
    { id:"wellness", category:"Vitalidade",   title:"Protocolo de Bem-Estar",desc:"18 copos. O corpo Nacional é uma obra de arte.",         icon:"moon",
      tasks:[ { id:"water_18",  label:"Beber 18 copos de água",xp:360, stat:"VIT" } ], bonusXP:280, gold:540 },
    { id:"mind",     category:"Percepção",    title:"Clareza Mental",        desc:"60 minutos. A mente de um campeão nacional.",             icon:"eye",
      tasks:[ { id:"med_60",    label:"Meditar 60 minutos",   xp:360, stat:"PER" } ], bonusXP:280, gold:540 },
  ],
};

function getQuestsForRank(rank) {
  return RANK_QUESTS[rank] || RANK_QUESTS.E;
}

// Mapa global de todos os tasks para lookup de XP (usado em getMonthXP)
const ALL_TASKS_MAP = {};
Object.values(RANK_QUESTS).forEach(quests =>
  quests.forEach(q => q.tasks.forEach(t => { ALL_TASKS_MAP[t.id] = t; }))
);

// Mantido para compatibilidade — equivale às missões do Rank E
const DAILY_QUESTS = RANK_QUESTS.E;

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
