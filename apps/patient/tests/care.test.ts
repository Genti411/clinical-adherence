import { getActiveAssignment, getPlanItems, getTodayLogs, markDone } from '../src/lib/care';

// Fake chainable Supabase client builder.
// Each method returns a thenable chain so callers can either chain further or await directly.
function makeChainable(resolveWith: { data?: any; error?: any }) {
  // The chain is both an object (for chaining) and a thenable (for awaiting at any point).
  const chain: Record<string, any> = {
    then: (resolve: (v: any) => any) => Promise.resolve(resolveWith).then(resolve),
    catch: (reject: (v: any) => any) => Promise.resolve(resolveWith).catch(reject),
  };
  const methods = ['from', 'select', 'eq', 'order', 'limit', 'maybeSingle', 'upsert'];
  for (const m of methods) {
    chain[m] = jest.fn((..._args: any[]) => {
      if (m === 'maybeSingle' || m === 'upsert') {
        return Promise.resolve(resolveWith);
      }
      return chain;
    });
  }
  return chain;
}

describe('getActiveAssignment', () => {
  it('returns the row when found', async () => {
    const row = { id: 'assign-1', care_plan_id: 'plan-1', org_id: 'org-1' };
    const client = makeChainable({ data: row });
    const result = await getActiveAssignment(client, 'patient-1');
    expect(result).toEqual(row);
    expect(client.from).toHaveBeenCalledWith('assignments');
  });

  it('returns null when no row', async () => {
    const client = makeChainable({ data: null });
    const result = await getActiveAssignment(client, 'patient-1');
    expect(result).toBeNull();
  });
});

describe('getPlanItems', () => {
  it('returns array of items', async () => {
    const items = [
      { id: 'item-1', type: 'exercise', exercise_id: 'Chin Tucks', target: {}, position: 0 },
    ];
    const client = makeChainable({ data: items });
    const result = await getPlanItems(client, 'plan-1');
    expect(result).toEqual(items);
    expect(client.from).toHaveBeenCalledWith('plan_items');
  });

  it('returns empty array when data is null', async () => {
    const client = makeChainable({ data: null });
    const result = await getPlanItems(client, 'plan-1');
    expect(result).toEqual([]);
  });
});

describe('getTodayLogs', () => {
  it('returns array of logs', async () => {
    const logs = [{ plan_item_id: 'item-1', completed: true }];
    const client = makeChainable({ data: logs });
    const result = await getTodayLogs(client, 'assign-1', '2026-06-03');
    expect(result).toEqual(logs);
    expect(client.from).toHaveBeenCalledWith('adherence_logs');
  });

  it('returns empty array when data is null', async () => {
    const client = makeChainable({ data: null });
    const result = await getTodayLogs(client, 'assign-1', '2026-06-03');
    expect(result).toEqual([]);
  });
});

describe('markDone', () => {
  it('calls upsert with correct onConflict and returns ok', async () => {
    const client = makeChainable({ data: null, error: null });
    const params = {
      assignmentId: 'assign-1',
      planItemId: 'item-1',
      patientId: 'patient-1',
      orgId: 'org-1',
      date: '2026-06-03',
      completed: true,
    };
    const result = await markDone(client, params);
    expect(result).toEqual({ ok: true });
    expect(client.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        assignment_id: 'assign-1',
        plan_item_id: 'item-1',
        patient_id: 'patient-1',
        org_id: 'org-1',
        date: '2026-06-03',
        completed: true,
        source: 'manual',
      }),
      { onConflict: 'assignment_id,plan_item_id,date' },
    );
  });

  it('returns error when upsert fails', async () => {
    const client = makeChainable({ data: null, error: { message: 'DB error' } });
    const result = await markDone(client, {
      assignmentId: 'a',
      planItemId: 'b',
      patientId: 'c',
      orgId: 'd',
      date: '2026-06-03',
      completed: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('DB error');
    }
  });
});
