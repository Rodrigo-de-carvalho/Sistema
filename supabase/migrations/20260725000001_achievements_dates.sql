-- Data em que cada conquista foi obtida (id → "YYYY-MM-DD").
-- Conquista obtida hoje é revogável ao desmarcar (clique sem querer);
-- a partir do dia seguinte ela congela e vira permanente.
alter table public.profiles add column if not exists achievements_dates jsonb default '{}';
