import { logAudit } from './audit';
import type { VerifiedResult } from './health/verify';

export async function getActiveAssignment(client: any, patientId: string) {
  const { data } = await client.from('assignments')
    .select('id,care_plan_id,org_id').eq('patient_id', patientId).eq('status', 'active')
    .order('start_date', { ascending: false }).limit(1).maybeSingle();
  return data ?? null;
}

export async function getPlanItems(client: any, carePlanId: string) {
  const { data } = await client.from('plan_items')
    .select('id,type,exercise_id,target,position').eq('care_plan_id', carePlanId);
  return data ?? [];
}

export async function getTodayLogs(client: any, assignmentId: string, date: string) {
  const { data } = await client.from('adherence_logs')
    .select('plan_item_id,completed').eq('assignment_id', assignmentId).eq('date', date);
  return data ?? [];
}

export async function syncVerified(
  client: any,
  assignment: { id: string; org_id: string },
  results: VerifiedResult[],
  patientId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (results.length === 0) return { ok: true };
  const rows = results.map((r) => ({
    assignment_id: assignment.id,
    plan_item_id: r.planItemId,
    patient_id: patientId,
    org_id: assignment.org_id,
    date: r.date,
    completed: r.completed,
    source: 'healthkit',
  }));
  const { error } = await client.from('adherence_logs').upsert(rows, {
    onConflict: 'assignment_id,plan_item_id,date',
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function saveOutcome(
  client: any,
  p: { patientId: string; orgId: string; instrument: string; score: number },
  actorId?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await client.from('outcomes')
    .insert({ patient_id: p.patientId, org_id: p.orgId, instrument: p.instrument, score: p.score });
  if (error) return { ok: false, error: error.message };
  await logAudit(client, { orgId: p.orgId, actorId: actorId ?? null, action: 'outcome.create', entity: 'outcomes', entityId: null });
  return { ok: true };
}

export async function markDone(
  client: any,
  p: { assignmentId: string; planItemId: string; patientId: string; orgId: string; date: string; completed: boolean },
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await client.from('adherence_logs').upsert(
    { assignment_id: p.assignmentId, plan_item_id: p.planItemId, patient_id: p.patientId, org_id: p.orgId, date: p.date, completed: p.completed, source: 'manual' },
    { onConflict: 'assignment_id,plan_item_id,date' },
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function exportMyData(client: any, patientId: string) {
  const [a, ad, o] = await Promise.all([
    client.from('assignments').select('*').eq('patient_id', patientId),
    client.from('adherence_logs').select('*').eq('patient_id', patientId),
    client.from('outcomes').select('*').eq('patient_id', patientId),
  ]);
  return { assignments: a.data ?? [], adherence: ad.data ?? [], outcomes: o.data ?? [] };
}

export async function requestDeletion(client: any, p: { patientId: string; orgId: string }) {
  // We do not hard-delete clinical records (providers may be legally required to
  // retain them); we log the request for the clinic to action per their policy.
  await logAudit(client, { orgId: p.orgId, actorId: p.patientId, action: 'patient.deletion_requested', entity: 'profiles', entityId: p.patientId });
  return { ok: true };
}
