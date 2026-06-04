import type { DraftPlan } from './plan';

export interface DbResult { id?: string; error?: string }

export async function createCarePlan(client: any, orgId: string, createdBy: string, draft: DraftPlan): Promise<DbResult> {
  const { data, error } = await client.from('care_plans')
    .insert({ org_id: orgId, created_by: createdBy, title: draft.title, description: draft.description ?? null, duration_days: draft.duration_days ?? null, status: 'active' })
    .select('id').single();
  if (error) return { error: error.message };
  const items = draft.items.map((it, i) => ({ care_plan_id: data.id, type: it.type, exercise_id: it.exercise_id ?? null, target: it.target, position: i }));
  const { error: e2 } = await client.from('plan_items').insert(items);
  if (e2) return { error: e2.message };
  return { id: data.id };
}

export async function assignPlan(client: any, params: { carePlanId: string; patientId: string; clinicianId: string; orgId: string }): Promise<DbResult> {
  const { data, error } = await client.from('assignments')
    .insert({ care_plan_id: params.carePlanId, patient_id: params.patientId, clinician_id: params.clinicianId, org_id: params.orgId, status: 'active' })
    .select('id').single();
  return error ? { error: error.message } : { id: data.id };
}

export async function listPatients(client: any, orgId: string): Promise<{ id: string; full_name: string | null; email: string | null }[]> {
  const { data, error } = await client.from('profiles').select('id,full_name,email').eq('org_id', orgId).eq('role', 'patient');
  if (error) return [];
  return data ?? [];
}

export async function listAssignments(client: any, orgId: string) {
  const { data } = await client.from('assignments')
    .select('id,patient_id,care_plan_id,status').eq('org_id', orgId).eq('status', 'active');
  return data ?? [];
}

export async function getAdherenceLogs(client: any, orgId: string) {
  const { data } = await client.from('adherence_logs')
    .select('assignment_id,plan_item_id,patient_id,date,completed').eq('org_id', orgId);
  return data ?? [];
}

export async function getOutcomes(client: any, orgId: string) {
  const { data } = await client.from('outcomes')
    .select('patient_id,instrument,score,recorded_at').eq('org_id', orgId).order('recorded_at', { ascending: false });
  return data ?? [];
}
