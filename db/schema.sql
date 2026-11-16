-- Lucero: esquema completo (idempotente). Correr con `npm run db:migrate`.
create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  password_hash text not null,
  name text not null,
  plan text not null default 'trial' check (plan in ('trial', 'esencial', 'pro')),
  plan_source text check (plan_source in ('mp', 'manual')),
  trial_ends_at timestamptz not null,
  trial_reminder_sent_at timestamptz,
  referral_code text not null unique,
  referred_by uuid references users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token_hash text primary key,
  user_id uuid not null references users (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_idx on sessions (user_id);

create table if not exists password_resets (
  token_hash text primary key,
  user_id uuid not null references users (id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz
);

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users (id) on delete cascade,
  name text not null,
  slug text not null unique,
  google_review_url text not null,
  category text,
  tone text not null default 'cercano',
  country_code text not null default '54',
  whatsapp_template text not null,
  created_at timestamptz not null default now()
);
create index if not exists businesses_owner_idx on businesses (owner_id);

-- Clientes a los que se les pide reseña (uno por pedido).
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  phone text not null,
  token text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'opened', 'rated', 'google')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists customers_business_idx on customers (business_id, created_at desc);

create table if not exists events (
  id bigint generated always as identity primary key,
  business_id uuid not null references businesses (id) on delete cascade,
  customer_id uuid references customers (id) on delete set null,
  type text not null check (type in ('view', 'rating', 'google_click', 'feedback')),
  rating smallint check (rating between 1 and 5),
  source text not null default 'link' check (source in ('qr', 'whatsapp', 'link')),
  created_at timestamptz not null default now()
);
create index if not exists events_business_idx on events (business_id, created_at desc);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  customer_id uuid references customers (id) on delete set null,
  rating smallint check (rating between 1 and 5),
  message text not null,
  contact text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists feedback_business_idx on feedback (business_id, created_at desc);

create table if not exists ai_replies (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  reviewer text,
  rating smallint not null check (rating between 1 and 5),
  review_text text not null,
  reply text not null,
  created_at timestamptz not null default now()
);
create index if not exists ai_replies_business_idx on ai_replies (business_id, created_at desc);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  provider_id text not null unique,           -- id del preapproval de Mercado Pago
  plan text not null check (plan in ('esencial', 'pro')),
  status text not null,                       -- pending | authorized | paused | cancelled
  amount numeric(12, 2) not null,
  currency text not null,
  payer_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on subscriptions (user_id);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  provider_id text not null unique,           -- id del authorized_payment de Mercado Pago
  subscription_provider_id text,
  amount numeric(12, 2),
  currency text,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references users (id) on delete cascade,
  referred_id uuid not null unique references users (id) on delete cascade,
  status text not null default 'signed_up'
    check (status in ('signed_up', 'pending_reward', 'rewarded')),
  created_at timestamptz not null default now(),
  converted_at timestamptz
);

create table if not exists rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 1,
  primary key (key, window_start)
);

-- === v2: QR múltiples, plan Agencia ===
create table if not exists qr_points (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  label text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists qr_points_business_idx on qr_points (business_id);
alter table events add column if not exists qr_id uuid references qr_points (id) on delete set null;

alter table users drop constraint if exists users_plan_check;
alter table users add constraint users_plan_check check (plan in ('trial', 'esencial', 'pro', 'agencia'));
alter table subscriptions drop constraint if exists subscriptions_plan_check;
alter table subscriptions add constraint subscriptions_plan_check check (plan in ('esencial', 'pro', 'agencia'));

-- === v3: planes cobrados por transferencia (vencen solos) ===
alter table users add column if not exists manual_until timestamptz;
