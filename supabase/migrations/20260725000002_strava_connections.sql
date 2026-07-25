-- Conexões Strava por usuário. Tokens ficam SÓ no servidor:
-- RLS ligada sem policies = nenhum acesso via client, apenas service role.
create table public.strava_connections (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  athlete_id    bigint,
  access_token  text not null,
  refresh_token text not null,
  expires_at    bigint not null,
  connected_at  timestamptz default now()
);
alter table public.strava_connections enable row level security;
