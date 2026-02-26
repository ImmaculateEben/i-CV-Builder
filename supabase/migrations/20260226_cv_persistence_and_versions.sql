-- CV persistence standardization
-- Adds structured CV payload storage and version snapshots for editor history.

alter table if exists public.cvs
  add column if not exists title text;

alter table if exists public.cvs
  add column if not exists cv_data jsonb;

alter table if exists public.cvs
  add column if not exists template_id text;

alter table if exists public.cvs
  add column if not exists created_at timestamptz default now();

alter table if exists public.cvs
  add column if not exists updated_at timestamptz default now();

create index if not exists cvs_user_id_updated_at_idx
  on public.cvs (user_id, updated_at desc);

create table if not exists public.cv_versions (
  id uuid primary key default gen_random_uuid(),
  cv_id uuid not null references public.cvs(id) on delete cascade,
  user_id uuid not null,
  cv_snapshot jsonb not null,
  change_summary text,
  created_at timestamptz not null default now()
);

create index if not exists cv_versions_cv_id_created_at_idx
  on public.cv_versions (cv_id, created_at desc);

create index if not exists cv_versions_user_id_created_at_idx
  on public.cv_versions (user_id, created_at desc);
