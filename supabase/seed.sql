-- Fixed UUIDs for deterministic test references
-- Org A
-- ORG_A_ID      = 'aaaaaaaa-0000-0000-0000-000000000001'
-- ADMIN_A_ID    = 'aaaaaaaa-0000-0000-0000-000000000010'
-- CLINICIAN_A_ID= 'aaaaaaaa-0000-0000-0000-000000000020'
-- PATIENT_P1_ID = 'aaaaaaaa-0000-0000-0000-000000000030'
-- CARE_PLAN_ID  = 'aaaaaaaa-0000-0000-0000-000000000040'
-- PLAN_ITEM_1   = 'aaaaaaaa-0000-0000-0000-000000000050'
-- PLAN_ITEM_2   = 'aaaaaaaa-0000-0000-0000-000000000051'
-- ASSIGNMENT_ID = 'aaaaaaaa-0000-0000-0000-000000000060'
-- ADHERENCE_LOG = 'aaaaaaaa-0000-0000-0000-000000000070'
-- Org B
-- ORG_B_ID      = 'bbbbbbbb-0000-0000-0000-000000000001'
-- PATIENT_P2_ID = 'bbbbbbbb-0000-0000-0000-000000000030'

-- Org A
insert into public.organizations (id, name) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Clinic A');

-- Org B
insert into public.organizations (id, name) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Clinic B');

-- Auth users for Org A
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000010', 'admin@clinica.test'),
  ('aaaaaaaa-0000-0000-0000-000000000020', 'clinician@clinica.test'),
  ('aaaaaaaa-0000-0000-0000-000000000030', 'patient1@clinica.test');

-- Auth user for Org B
insert into auth.users (id, email) values
  ('bbbbbbbb-0000-0000-0000-000000000030', 'patient2@clinicb.test');

-- Profiles for Org A
insert into public.profiles (id, org_id, role, full_name, email) values
  ('aaaaaaaa-0000-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000001', 'admin',     'Admin A',     'admin@clinica.test'),
  ('aaaaaaaa-0000-0000-0000-000000000020', 'aaaaaaaa-0000-0000-0000-000000000001', 'clinician', 'Clinician A', 'clinician@clinica.test'),
  ('aaaaaaaa-0000-0000-0000-000000000030', 'aaaaaaaa-0000-0000-0000-000000000001', 'patient',   'Patient P1',  'patient1@clinica.test');

-- Profile for Org B
insert into public.profiles (id, org_id, role, full_name, email) values
  ('bbbbbbbb-0000-0000-0000-000000000030', 'bbbbbbbb-0000-0000-0000-000000000001', 'patient',   'Patient P2',  'patient2@clinicb.test');

-- Clinician-patient link in Org A
insert into public.clinician_patient (clinician_id, patient_id, org_id) values
  ('aaaaaaaa-0000-0000-0000-000000000020', 'aaaaaaaa-0000-0000-0000-000000000030', 'aaaaaaaa-0000-0000-0000-000000000001');

-- Care plan created by clinician in Org A
insert into public.care_plans (id, org_id, created_by, title, status) values
  ('aaaaaaaa-0000-0000-0000-000000000040', 'aaaaaaaa-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000020', 'Neck Recovery Plan', 'active');

-- Plan items: one exercise (chin-tucks), one walking target
insert into public.plan_items (id, care_plan_id, type, exercise_id, target, position) values
  ('aaaaaaaa-0000-0000-0000-000000000050', 'aaaaaaaa-0000-0000-0000-000000000040', 'exercise', 'chin-tucks',
   '{"sets":2,"reps":10}'::jsonb, 1),
  ('aaaaaaaa-0000-0000-0000-000000000051', 'aaaaaaaa-0000-0000-0000-000000000040', 'walking', null,
   '{"minutes":30}'::jsonb, 2);

-- Assignment: plan -> patient P1 by clinician C1
insert into public.assignments (id, care_plan_id, patient_id, clinician_id, org_id) values
  ('aaaaaaaa-0000-0000-0000-000000000060',
   'aaaaaaaa-0000-0000-0000-000000000040',
   'aaaaaaaa-0000-0000-0000-000000000030',
   'aaaaaaaa-0000-0000-0000-000000000020',
   'aaaaaaaa-0000-0000-0000-000000000001');

-- Adherence log for patient P1
insert into public.adherence_logs (id, assignment_id, plan_item_id, patient_id, org_id, completed) values
  ('aaaaaaaa-0000-0000-0000-000000000070',
   'aaaaaaaa-0000-0000-0000-000000000060',
   'aaaaaaaa-0000-0000-0000-000000000050',
   'aaaaaaaa-0000-0000-0000-000000000030',
   'aaaaaaaa-0000-0000-0000-000000000001',
   true);

-- Audit log for Org A (inserted by admin)
insert into public.audit_logs (id, org_id, actor_id, action, entity, entity_id) values
  ('aaaaaaaa-0000-0000-0000-000000000080',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000010',
   'created_plan', 'care_plans',
   'aaaaaaaa-0000-0000-0000-000000000040');
