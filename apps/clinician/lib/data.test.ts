import { createCarePlan, assignPlan, listPatients } from './data';
import type { DraftPlan } from './plan';

// Fake chainable client builder
function makeFakeClient(overrides?: Record<string, { data: unknown; error: null | { message: string } }>) {
  const defaults = overrides ?? {};

  function makeChain(table: string) {
    let lastMethod = '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain: any = {};

    chain.select = (_cols: string) => chain;
    chain.single = async () => {
      const key = `${table}.${lastMethod}`;
      if (key in defaults) return defaults[key];
      return { data: { id: `${table}-id-1` }, error: null };
    };
    chain.eq = (_col: string, _val: unknown) => chain;

    // insert returns a thenable chain so `await client.from('x').insert(y)`
    // resolves for the plan_items case
    chain.insert = (_payload: unknown) => {
      lastMethod = 'insert';
      const insertChain = { ...chain };
      insertChain.then = (resolve: (v: unknown) => void) => {
        const key = `${table}.insert`;
        const result = key in defaults ? defaults[key] : { data: null, error: null };
        resolve(result);
        return Promise.resolve(result);
      };
      insertChain.catch = () => insertChain;
      return insertChain;
    };

    return chain;
  }

  return {
    from: (table: string) => makeChain(table),
  };
}

describe('createCarePlan', () => {
  const draft: DraftPlan = {
    title: 'Test Plan',
    description: 'A test plan',
    duration_days: 30,
    items: [
      { type: 'exercise', exercise_id: 'Chin Tucks', target: {} },
      { type: 'walking', target: { stepsPerDay: 5000 } },
    ],
  };

  it('returns the plan id on success', async () => {
    const client = makeFakeClient();
    const result = await createCarePlan(client, 'org-1', 'user-1', draft);
    expect(result.id).toBe('care_plans-id-1');
    expect(result.error).toBeUndefined();
  });

  it('returns error when plan insert fails', async () => {
    const client = {
      from: (table: string) => {
        if (table === 'care_plans') {
          return {
            insert: () => ({
              select: () => ({
                single: async () => ({ data: null, error: { message: 'Insert failed' } }),
              }),
            }),
          };
        }
        return makeFakeClient().from(table);
      },
    };
    const result = await createCarePlan(client, 'org-1', 'user-1', draft);
    expect(result.error).toBe('Insert failed');
    expect(result.id).toBeUndefined();
  });

  it('returns error when items insert fails', async () => {
    const client = {
      from: (table: string) => {
        if (table === 'care_plans') {
          return {
            insert: () => ({
              select: () => ({
                single: async () => ({ data: { id: 'plan-123' }, error: null }),
              }),
            }),
          };
        }
        if (table === 'plan_items') {
          return {
            insert: () => Promise.resolve({ data: null, error: { message: 'Items insert failed' } }),
          };
        }
        return makeFakeClient().from(table);
      },
    };
    const result = await createCarePlan(client, 'org-1', 'user-1', draft);
    expect(result.error).toBe('Items insert failed');
    expect(result.id).toBeUndefined();
  });

  it('inserts items with correct positions', async () => {
    const insertedItems: unknown[] = [];
    const client = {
      from: (table: string) => {
        if (table === 'care_plans') {
          return {
            insert: () => ({
              select: () => ({
                single: async () => ({ data: { id: 'plan-xyz' }, error: null }),
              }),
            }),
          };
        }
        if (table === 'plan_items') {
          return {
            insert: (items: unknown) => {
              insertedItems.push(...(items as unknown[]));
              return Promise.resolve({ data: null, error: null });
            },
          };
        }
        return makeFakeClient().from(table);
      },
    };
    await createCarePlan(client, 'org-1', 'user-1', draft);
    expect(insertedItems).toHaveLength(2);
    expect((insertedItems[0] as any).position).toBe(0);
    expect((insertedItems[1] as any).position).toBe(1);
    expect((insertedItems[0] as any).care_plan_id).toBe('plan-xyz');
  });
});

describe('assignPlan', () => {
  it('returns assignment id on success', async () => {
    const client = {
      from: (_table: string) => ({
        insert: () => ({
          select: () => ({
            single: async () => ({ data: { id: 'assignment-1' }, error: null }),
          }),
        }),
      }),
    };
    const result = await assignPlan(client, {
      carePlanId: 'plan-1',
      patientId: 'patient-1',
      clinicianId: 'clinician-1',
      orgId: 'org-1',
    });
    expect(result.id).toBe('assignment-1');
    expect(result.error).toBeUndefined();
  });

  it('returns error when insert fails', async () => {
    const client = {
      from: (_table: string) => ({
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: 'Assign failed' } }),
          }),
        }),
      }),
    };
    const result = await assignPlan(client, {
      carePlanId: 'plan-1',
      patientId: 'patient-1',
      clinicianId: 'clinician-1',
      orgId: 'org-1',
    });
    expect(result.error).toBe('Assign failed');
    expect(result.id).toBeUndefined();
  });
});

describe('listPatients', () => {
  it('returns patients from profiles table', async () => {
    const patients = [
      { id: 'p1', full_name: 'Alice', email: 'alice@example.com' },
      { id: 'p2', full_name: 'Bob', email: 'bob@example.com' },
    ];
    const client = {
      from: (_table: string) => ({
        select: () => ({
          eq: () => ({
            eq: async () => ({ data: patients, error: null }),
          }),
        }),
      }),
    };
    const result = await listPatients(client, 'org-1');
    expect(result).toEqual(patients);
  });

  it('returns empty array on error', async () => {
    const client = {
      from: (_table: string) => ({
        select: () => ({
          eq: () => ({
            eq: async () => ({ data: null, error: { message: 'DB error' } }),
          }),
        }),
      }),
    };
    const result = await listPatients(client, 'org-1');
    expect(result).toEqual([]);
  });

  it('returns empty array when data is null without error', async () => {
    const client = {
      from: (_table: string) => ({
        select: () => ({
          eq: () => ({
            eq: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    };
    const result = await listPatients(client, 'org-1');
    expect(result).toEqual([]);
  });
});
