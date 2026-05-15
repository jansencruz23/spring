-- Spring v1 initial schema.
-- All tables are scoped to auth.users via user_id + RLS.

-- ---------- enums ----------

create type spring_goal as enum (
  'feel_good',
  'lose_weight',
  'build_strength',
  'eat_better',
  'sleep_deeper'
);

create type spring_meal_slot as enum (
  'breakfast',
  'lunch',
  'snack',
  'dinner'
);

create type spring_theme_mode as enum ('light', 'dark', 'system');

create type spring_chat_role as enum ('user', 'assistant', 'system');

-- ---------- profiles ----------

create table public.profiles (
  user_id          uuid primary key references auth.users on delete cascade,
  name             text not null default '',
  goal             spring_goal,
  wake_time        time not null default '07:00',
  sleep_time       time not null default '23:00',
  kcal_target      integer not null default 2000,
  protein_g        integer not null default 120,
  carbs_g          integer not null default 230,
  fat_g            integer not null default 70,
  water_ml_target  integer not null default 2000,
  accent_color     text,
  theme_mode       spring_theme_mode not null default 'system',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------- meal_plans ----------

create table public.meal_plans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users on delete cascade,
  date            date not null,
  slot            spring_meal_slot not null,
  food_name       text not null,
  kcal            integer not null default 0,
  protein_g       integer not null default 0,
  carbs_g         integer not null default 0,
  fat_g           integer not null default 0,
  tags            text[] not null default '{}',
  scheduled_time  time,
  created_at      timestamptz not null default now()
);

create index meal_plans_user_date_idx on public.meal_plans (user_id, date);

-- ---------- meal_logs ----------

create table public.meal_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users on delete cascade,
  meal_plan_id    uuid references public.meal_plans on delete set null,
  freeform_name   text,
  eaten_at        timestamptz not null default now(),
  kcal            integer not null default 0,
  protein_g       integer not null default 0,
  created_at      timestamptz not null default now()
);

create index meal_logs_user_eaten_idx on public.meal_logs (user_id, eaten_at);

-- ---------- hydration_logs ----------

create table public.hydration_logs (
  user_id  uuid not null references auth.users on delete cascade,
  date     date not null,
  cups     integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- ---------- supplement_logs ----------

create table public.supplement_logs (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users on delete cascade,
  date      date not null,
  name      text not null,
  taken     boolean not null default false,
  unique (user_id, date, name)
);

create index supplement_logs_user_date_idx on public.supplement_logs (user_id, date);

-- ---------- workout_sessions ----------

create table public.workout_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  name        text not null default 'Session',
  started_at  timestamptz not null default now(),
  ended_at    timestamptz
);

create index workout_sessions_user_started_idx on public.workout_sessions (user_id, started_at desc);

-- ---------- workout_sets ----------

create table public.workout_sets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  session_id    uuid not null references public.workout_sessions on delete cascade,
  exercise      text not null,
  reps          integer not null default 0,
  weight_kg     numeric(6,2) not null default 0,
  completed_at  timestamptz not null default now()
);

create index workout_sets_session_idx on public.workout_sets (session_id);

-- ---------- sleep_logs ----------

create table public.sleep_logs (
  user_id      uuid not null references auth.users on delete cascade,
  date         date not null,
  duration_min integer not null,
  score        integer,
  primary key (user_id, date)
);

-- ---------- chat_threads ----------

create table public.chat_threads (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  title       text,
  created_at  timestamptz not null default now()
);

-- ---------- chat_messages ----------

create table public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  thread_id   uuid not null references public.chat_threads on delete cascade,
  role        spring_chat_role not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

create index chat_messages_thread_idx on public.chat_messages (thread_id, created_at);

-- ---------- rate_limits (for chat) ----------

create table public.rate_limits (
  user_id    uuid not null references auth.users on delete cascade,
  bucket     text not null,            -- e.g. 'chat'
  window_start timestamptz not null,
  count      integer not null default 0,
  primary key (user_id, bucket, window_start)
);

-- ---------- updated_at triggers ----------

create or replace function public.tg_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.tg_touch_updated_at();

create trigger hydration_touch
  before update on public.hydration_logs
  for each row execute function public.tg_touch_updated_at();

-- ---------- RLS ----------

alter table public.profiles          enable row level security;
alter table public.meal_plans        enable row level security;
alter table public.meal_logs         enable row level security;
alter table public.hydration_logs    enable row level security;
alter table public.supplement_logs   enable row level security;
alter table public.workout_sessions  enable row level security;
alter table public.workout_sets      enable row level security;
alter table public.sleep_logs        enable row level security;
alter table public.chat_threads      enable row level security;
alter table public.chat_messages     enable row level security;
alter table public.rate_limits       enable row level security;

-- Owner-only policy template (separate policies per command for readability).

create policy "profiles_owner_select" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_owner_insert" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles_owner_update" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meal_plans_owner_all" on public.meal_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meal_logs_owner_all" on public.meal_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "hydration_logs_owner_all" on public.hydration_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "supplement_logs_owner_all" on public.supplement_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workout_sessions_owner_all" on public.workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workout_sets_owner_all" on public.workout_sets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sleep_logs_owner_all" on public.sleep_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "chat_threads_owner_all" on public.chat_threads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "chat_messages_owner_select" on public.chat_messages
  for select using (auth.uid() = user_id);
-- chat_messages writes are server-side only (via Edge Function with service role)
-- so we deliberately skip an insert policy here.

create policy "rate_limits_owner_select" on public.rate_limits
  for select using (auth.uid() = user_id);
-- rate_limits writes are server-side only (service role).
