import { getActiveAssignment, getPlanItems, getTodayLogs, markDone, syncVerified, saveOutcome, exportMyData, requestDeletion } from '../src/lib/care';
import type { VerifiedResult } from '../src/lib/health/verify';

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

describe('syncVerified', () => {
  const assignment = { id: 'assign-1', org_id: 'org-1' };
  const results: VerifiedResult[] = [
    { planItemId: 'item-1', date: '2026-06-04', completed: true, value: { steps: 9000 } },
    { planItemId: 'item-2', date: '2026-06-04', completed: false, value: {} },
  ];

  it('upserts rows with source healthkit and correct onConflict', async () => {
    const client = makeChainable({ data: null, error: null });
    const result = await syncVerified(client, assignment, results, 'patient-1');
    expect(result).toEqual({ ok: true });
    expect(client.from).toHaveBeenCalledWith('adherence_logs');
    expect(client.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          assignment_id: 'assign-1',
          plan_item_id: 'item-1',
          patient_id: 'patient-1',
          org_id: 'org-1',
          date: '2026-06-04',
          completed: true,
          source: 'healthkit',
        }),
        expect.objectContaining({
          plan_item_id: 'item-2',
          completed: false,
          source: 'healthkit',
        }),
      ]),
      { onConflict: 'assignment_id,plan_item_id,date' },
    );
  });

  it('returns ok true when results is empty (no upsert needed)', async () => {
    const client = makeChainable({ data: null, error: null });
    const result = await syncVerified(client, assignment, [], 'patient-1');
    expect(result).toEqual({ ok: true });
    expect(client.upsert).not.toHaveBeenCalled();
  });

  it('returns error when upsert fails', async () => {
    const client = makeChainable({ data: null, error: { message: 'upsert failed' } });
    const result = await syncVerified(client, assignment, results, 'patient-1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('upsert failed');
  });
});

describe('saveOutcome', () => {
  function makeTableClient(outcomeError: null | { message: string }) {
    const inserts: Record<string, any[]> = { outcomes: [], audit_logs: [] };
    const client = {
      from: jest.fn((table: string) => ({
        insert: jest.fn((row: any) => {
          (inserts[table] = inserts[table] ?? []).push(row);
          const error = table === 'outcomes' ? outcomeError : null;
          return Promise.resolve({ error });
        }),
      })),
      getInserts: (table: string) => inserts[table] ?? [],
    };
    return client;
  }

  it('inserts the outcome row, logs audit, and returns ok', async () => {
    const client = makeTableClient(null);
    const result = await saveOutcome(client, {
      patientId: 'patient-1',
      orgId: 'org-1',
      instrument: 'daily-function-v1',
      score: 75,
    }, 'patient-1');
    expect(result).toEqual({ ok: true });
    expect(client.from).toHaveBeenCalledWith('outcomes');
    expect(client.from).toHaveBeenCalledWith('audit_logs');
    expect(client.getInserts('outcomes')[0]).toMatchObject({
      patient_id: 'patient-1',
      org_id: 'org-1',
      instrument: 'daily-function-v1',
      score: 75,
    });
    expect(client.getInserts('audit_logs')[0]).toMatchObject({
      org_id: 'org-1',
      actor_id: 'patient-1',
      action: 'outcome.create',
      entity: 'outcomes',
    });
  });

  it('returns error when insert fails (no audit on error)', async () => {
    const client = makeTableClient({ message: 'insert error' });
    const result = await saveOutcome(client, {
      patientId: 'patient-1',
      orgId: 'org-1',
      instrument: 'daily-function-v1',
      score: 50,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('insert error');
    // audit should NOT be called on failure
    expect(client.getInserts('audit_logs')).toHaveLength(0);
  });
});

describe('exportMyData', () => {
  it('returns assignments, adherence, and outcomes for the patient', async () => {
    const assignments = [{ id: 'a1', patient_id: 'p1' }];
    const adherence = [{ id: 'l1', patient_id: 'p1' }];
    const outcomes = [{ id: 'o1', patient_id: 'p1' }];

    const tableData: Record<string, any[]> = {
      assignments,
      adherence_logs: adherence,
      outcomes,
    };

    const client = {
      from: (table: string) => ({
        select: () => ({
          eq: () => Promise.resolve({ data: tableData[table] ?? null }),
        }),
      }),
    };

    const result = await exportMyData(client, 'p1');
    expect(result.assignments).toEqual(assignments);
    expect(result.adherence).toEqual(adherence);
    expect(result.outcomes).toEqual(outcomes);
  });

  it('returns empty arrays when data is null', async () => {
    const client = {
      from: (_table: string) => ({
        select: () => ({
          eq: () => Promise.resolve({ data: null }),
        }),
      }),
    };

    const result = await exportMyData(client, 'p1');
    expect(result.assignments).toEqual([]);
    expect(result.adherence).toEqual([]);
    expect(result.outcomes).toEqual([]);
  });
});

describe('requestDeletion', () => {
  it('logs an audit event and returns ok (no hard delete)', async () => {
    let auditRow: any = null;
    const client = {
      from: (table: string) => ({
        insert: (row: any) => {
          if (table === 'audit_logs') auditRow = row;
          return Promise.resolve({ data: null, error: null });
        },
      }),
    };

    const result = await requestDeletion(client, { patientId: 'patient-1', orgId: 'org-1' });
    expect(result).toEqual({ ok: true });
    expect(auditRow).toMatchObject({
      org_id: 'org-1',
      actor_id: 'patient-1',
      action: 'patient.deletion_requested',
      entity: 'profiles',
      entity_id: 'patient-1',
    });
  });

  it('returns ok even if audit insert fails (best-effort)', async () => {
    const client = {
      from: (_table: string) => ({
        insert: (_row: any) => Promise.reject(new Error('DB error')),
      }),
    };

    await expect(requestDeletion(client, { patientId: 'p1', orgId: 'org-1' })).resolves.toEqual({ ok: true });
  });
});
