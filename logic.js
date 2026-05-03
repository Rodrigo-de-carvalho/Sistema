// ── logic.js — funções de jogo e storage ─────────────────────────

const LS_KEY = "sistema_profile";

// ── Datas ────────────────────────────────────────────────────────
const todayKey     = () => new Date().toISOString().slice(0, 10);
const yesterdayKey = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);

function getTimeToMidnight() {
  const now      = new Date();
  const midnight = new Date(); midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// ── XP / Nível ───────────────────────────────────────────────────
function computeLevel(totalXP) {
  let level = 1, accum = 0;
  while (true) {
    const req = level * 200;
    if (totalXP < accum + req) return { level, xpInLevel: totalXP - accum, xpToNext: req };
    accum += req;
    level++;
  }
}

function getRankForLevel(level) {
  if (level >= 200) return "Nacional";
  if (level >= 161) return "SSS";
  if (level >= 121) return "SS";
  if (level >= 81)  return "S";
  if (level >= 51)  return "A";
  if (level >= 31)  return "B";
  if (level >= 16)  return "C";
  if (level >= 6)   return "D";
  return "E";
}

// ── Quest helpers ────────────────────────────────────────────────
function getDayLog(questLog, date) {
  return questLog[date] || {};
}

function isTaskDone(questLog, questId, taskId, date) {
  const day = getDayLog(questLog, date || todayKey());
  return !!(day[questId] && day[questId][taskId]);
}

function isQuestComplete(questLog, questId, date) {
  const quest = DAILY_QUESTS.find(q => q.id === questId);
  if (!quest) return false;
  return quest.tasks.every(t => isTaskDone(questLog, questId, t.id, date));
}

function countTotalTasks(questLog) {
  return Object.values(questLog).reduce((sum, day) =>
    sum + Object.values(day).reduce((s2, q) =>
      s2 + Object.values(q).filter(Boolean).length, 0), 0);
}

function allQuestsDoneToday(questLog) {
  return DAILY_QUESTS.every(q => isQuestComplete(questLog, q.id, todayKey()));
}

function getWeeklyProgress(questLog) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10);
    const day  = questLog[date] || {};
    const done = Object.values(day).reduce((s, q) => s + Object.values(q).filter(Boolean).length, 0);
    const max  = DAILY_QUESTS.reduce((s, q) => s + q.tasks.length, 0);
    return { date, done, max, pct: Math.round((done / max) * 100) };
  });
}

// ── Streak ───────────────────────────────────────────────────────
function computeStreak(lastActive, currentStreak) {
  const today     = todayKey();
  const yesterday = yesterdayKey();
  if (lastActive === today)     return currentStreak;
  if (lastActive === yesterday) return currentStreak + 1;
  return 1;
}

// ── Conquistas ───────────────────────────────────────────────────
function checkNewAchievements(profile, questLog) {
  const total  = countTotalTasks(questLog);
  const rank   = getRankForLevel(profile.level);
  const checks = {
    first_task:     total >= 1,
    first_quest:    DAILY_QUESTS.some(q => isQuestComplete(questLog, q.id)),
    streak_3:       profile.streak >= 3,
    streak_7:       profile.streak >= 7,
    streak_30:      profile.streak >= 30,
    level_5:        profile.level >= 5,
    level_10:       profile.level >= 10,
    rank_d:         ["D","C","B","A","S","SS","SSS","Nacional"].includes(rank),
    rank_c:         ["C","B","A","S","SS","SSS","Nacional"].includes(rank),
    str_30:         profile.stats.FOR >= 30,
    int_30:         profile.stats.INT >= 30,
    all_quests_day: allQuestsDoneToday(questLog),
    tasks_50:       total >= 50,
    tasks_100:      total >= 100,
  };
  return ACHIEVEMENTS.filter(a => checks[a.id] && !profile.achievements.includes(a.id));
}

// ── Storage ──────────────────────────────────────────────────────
function loadProfile() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ ...profile, updated_at: new Date().toISOString() }));
  } catch {}
}

async function syncToSupabase(profile, userId) {
  if (!window.sb || !userId) return;
  try {
    const { error } = await window.sb.from("profiles").upsert({
      id: userId,
      name:               profile.name,
      avatar:             profile.avatar,
      xp:                 profile.xp,
      level:              profile.level,
      stats:              profile.stats,
      stat_points:        profile.stat_points,
      streak:             profile.streak,
      last_active:        profile.last_active,
      gold:               profile.gold,
      titles:             profile.titles,
      achievements:       profile.achievements,
      inventory_items:    profile.inventory_items,
      quest_log:          pruneQuestLog(profile.quest_log),
      premium_gate_shown: profile.premium_gate_shown,
      updated_at:         new Date().toISOString(),
    });
    if (error) console.warn("[SISTEMA] Sync error:", error.message);
  } catch {}
}

async function loadFromSupabase(userId) {
  if (!window.sb || !userId) return null;
  try {
    const { data, error } = await window.sb.from("profiles").select("*").eq("id", userId).single();
    if (error || !data) return null;
    return {
      name:               data.name             || DEFAULT_PROFILE.name,
      avatar:             data.avatar           || null,
      xp:                 data.xp              || 0,
      level:              data.level           || 1,
      stats:              data.stats           || DEFAULT_PROFILE.stats,
      stat_points:        data.stat_points     || 0,
      streak:             data.streak          || 0,
      last_active:        data.last_active     || null,
      gold:               data.gold            || 0,
      titles:             data.titles          || ["Iniciante"],
      achievements:       data.achievements    || [],
      inventory_items:    data.inventory_items || ["badge_beginner"],
      quest_log:          data.quest_log       || {},
      premium_gate_shown: data.premium_gate_shown || false,
    };
  } catch { return null; }
}

function pruneQuestLog(questLog) {
  const keys = Object.keys(questLog).sort();
  if (keys.length <= 30) return questLog;
  return Object.fromEntries(keys.slice(-30).map(k => [k, questLog[k]]));
}

// ── Freemium helpers ─────────────────────────────────────────────

// XP ganho neste mês (para calcular o bônus perdido)
function getMonthXP(questLog) {
  const month = new Date().toISOString().slice(0, 7);
  return Object.entries(questLog)
    .filter(([date]) => date.startsWith(month))
    .reduce((sum, [, dayLog]) => {
      return sum + Object.values(dayLog).reduce((s, qLog) => {
        return s + Object.entries(qLog)
          .filter(([, done]) => done)
          .reduce((s2, [taskId]) => {
            const task = DAILY_QUESTS.flatMap(q => q.tasks).find(t => t.id === taskId);
            return s2 + (task ? task.xp : 0);
          }, 0);
      }, 0);
    }, 0);
}

// XP que o usuário teria ganho a mais se fosse Premium
function getPremiumXPLost(questLog) {
  return Math.floor(getMonthXP(questLog) * PREMIUM_XP_BONUS);
}

// Reseta escudos se for um novo mês
function resetShieldsIfNewMonth(profile) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (profile.shields_month === currentMonth) return profile;
  return {
    ...profile,
    streak_shields: profile.is_premium ? SHIELDS_PREMIUM : SHIELDS_FREE,
    shields_month:  currentMonth,
  };
}

// Verifica se precisa consumir escudo de streak (chamado no carregamento do app)
function checkStreakShield(profile) {
  const today     = todayKey();
  const yesterday = yesterdayKey();
  if (!profile.last_active) return { profile, shieldUsed: false };
  if (profile.last_active === today || profile.last_active === yesterday) return { profile, shieldUsed: false };

  // Streak quebrou — tem escudo?
  if (profile.streak_shields > 0 && profile.streak > 0) {
    return {
      profile: { ...profile, streak_shields: profile.streak_shields - 1, last_active: yesterday },
      shieldUsed: true,
    };
  }
  // Sem escudo — reset streak
  return { profile: { ...profile, streak: 0 }, shieldUsed: false };
}

// Semana atual (segunda-feira)
function currentWeekKey() {
  const d   = new Date();
  const day = d.getDay() || 7; // 1=Mon … 7=Sun
  d.setDate(d.getDate() - (day - 1));
  return d.toISOString().slice(0, 10);
}
