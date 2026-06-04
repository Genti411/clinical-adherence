-- Tables first, then the helper functions that reference them (so the function
-- bodies validate on a fresh database with check_function_bodies on), then RLS.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  role text not null check (role in ('admin','clinician','patient')),
  full_name text, email text,
  created_at timestamptz not null default now()
);

create table public.clinician_patient (
  clinician_id uuid not null references public.profiles(id) on delete cascade,
  patient_id  uuid not null references public.profiles(id) on delete cascade,
  org_id      uuid not null references public.organizations(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (clinician_id, patient_id)
);

create table public.care_plans (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  title text not null, description text, duration_days int,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  created_at timestamptz not null default now()
);

create table public.plan_items (
  id uuid primary key default gen_random_uuid(),
  care_plan_id uuid not null references public.care_plans(id) on delete cascade,
  type text not null check (type in ('exercise','walking','swimming','strength','weigh_in','custom')),
  exercise_id text, target jsonb not null default '{}'::jsonb,
  schedule jsonb not null default '{}'::jsonb, position int not null default 0
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  care_plan_id uuid not null references public.care_plans(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  clinician_id uuid not null references public.profiles(id),
  org_id uuid not null references public.organizations(id) on delete cascade,
  start_date date not null default current_date, end_date date,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table public.adherence_logs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  plan_item_id uuid not null references public.plan_items(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  date date not null default current_date, completed boolean not null default false,
  value jsonb, source text not null default 'manual' check (source in ('manual','healthkit','health_connect')),
  note text, created_at timestamptz not null default now()
);

create table public.outcomes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  instrument text not null, score numeric, recorded_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null, actor_id uuid, action text not null,
  entity text, entity_id uuid, at timestamptz not null default now(), meta jsonb
);

-- Helpers (Supabase already provides auth.uid(); these read the caller's profile).
create or replace function public.current_org() returns uuid
  language sql stable security definer set search_path = public as
$$ select org_id from public.profiles where id = auth.uid() $$;

create or replace function public.current_app_role() returns text
  language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

-- Enable RLS
alter table public.organizations    enable row level security;
alter table public.profiles         enable row level security;
alter table public.clinician_patient enable row level security;
alter table public.care_plans       enable row level security;
alter table public.plan_items       enable row level security;
alter table public.assignments      enable row level security;
alter table public.adherence_logs   enable row level security;
alter table public.outcomes         enable row level security;
alter table public.audit_logs       enable row level security;

-- organizations
create policy org_select on public.organizations for select using (id = public.current_org());
create policy org_update on public.organizations for update using (id = public.current_org() and public.current_app_role() = 'admin');

-- profiles
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or (org_id = public.current_org() and public.current_app_role() in ('admin','clinician')));
create policy profiles_self_update on public.profiles for update using (id = auth.uid());
create policy profiles_admin_insert on public.profiles for insert
  with check (org_id = public.current_org() and public.current_app_role() = 'admin');

-- clinician_patient
create policy cp_staff on public.clinician_patient for all
  using (org_id = public.current_org() and public.current_app_role() in ('admin','clinician'))
  with check (org_id = public.current_org() and public.current_app_role() in ('admin','clinician'));

-- care_plans / plan_items (staff only; patients have no policy => denied)
create policy plans_staff on public.care_plans for all
  using (org_id = public.current_org() and public.current_app_role() in ('admin','clinician'))
  with check (org_id = public.current_org() and public.current_app_role() in ('admin','clinician'));
create policy items_staff on public.plan_items for all
  using (exists (select 1 from public.care_plans p where p.id = care_plan_id
                 and p.org_id = public.current_org() and public.current_app_role() in ('admin','clinician')))
  with check (exists (select 1 from public.care_plans p where p.id = care_plan_id
                 and p.org_id = public.current_org() and public.current_app_role() in ('admin','clinician')));

-- assignments
create policy assignments_staff on public.assignments for all
  using (org_id = public.current_org() and public.current_app_role() in ('admin','clinician'))
  with check (org_id = public.current_org() and public.current_app_role() in ('admin','clinician'));
create policy assignments_patient_select on public.assignments for select using (patient_id = auth.uid());

-- adherence_logs
create policy adherence_patient on public.adherence_logs for all
  using (patient_id = auth.uid()) with check (patient_id = auth.uid());
create policy adherence_staff_select on public.adherence_logs for select
  using (org_id = public.current_org() and public.current_app_role() in ('admin','clinician'));

-- outcomes
create policy outcomes_patient on public.outcomes for all
  using (patient_id = auth.uid()) with check (patient_id = auth.uid());
create policy outcomes_staff_select on public.outcomes for select
  using (org_id = public.current_org() and public.current_app_role() in ('admin','clinician'));

-- audit_logs (append-only: insert in own org; select admins; no update/delete policy => denied)
create policy audit_insert on public.audit_logs for insert with check (org_id = public.current_org());
create policy audit_admin_select on public.audit_logs for select
  using (org_id = public.current_org() and public.current_app_role() = 'admin');
