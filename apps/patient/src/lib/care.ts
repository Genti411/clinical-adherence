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
