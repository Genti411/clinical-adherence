import { logAudit } from './audit';

describe('logAudit', () => {
  it('inserts a row with the correct fields', async () => {
    let inserted: any = null;
    const client = {
      from: (_table: string) => ({
        insert: (row: any) => {
          inserted = { table: _table, row };
          return Promise.resolve({ data: null, error: null });
        },
      }),
    };

    await logAudit(client, {
      orgId: 'org-1',
      actorId: 'user-1',
      action: 'care_plan.create',
      entity: 'care_plans',
      entityId: 'plan-1',
      meta: { title: 'Test' },
    });

    expect(inserted).not.toBeNull();
    expect(inserted.table).toBe('audit_logs');
    expect(inserted.row).toMatchObject({
      org_id: 'org-1',
      actor_id: 'user-1',
      action: 'care_plan.create',
      entity: 'care_plans',
      entity_id: 'plan-1',
      meta: { title: 'Test' },
    });
  });

  it('uses null for optional fields when not provided', async () => {
    let inserted: any = null;
    const client = {
      from: (_table: string) => ({
        insert: (row: any) => {
          inserted = row;
          return Promise.resolve({ data: null, error: null });
        },
      }),
    };

    await logAudit(client, { orgId: 'org-2', actorId: null, action: 'some.action' });

    expect(inserted).toMatchObject({
      org_id: 'org-2',
      actor_id: null,
      action: 'some.action',
      entity: null,
      entity_id: null,
      meta: null,
    });
  });

  it('does not reject when the client throws', async () => {
    const client = {
      from: (_table: string) => ({
        insert: (_row: any) => {
          throw new Error('DB connection failed');
        },
      }),
    };

    // Must not throw
    await expect(
      logAudit(client, { orgId: 'org-1', actorId: null, action: 'test.action' }),
    ).resolves.toBeUndefined();
  });

  it('does not reject when the client returns a rejected promise', async () => {
    const client = {
      from: (_table: string) => ({
        insert: (_row: any) => Promise.reject(new Error('Network error')),
      }),
    };

    await expect(
      logAudit(client, { orgId: 'org-1', actorId: null, action: 'test.action' }),
    ).resolves.toBeUndefined();
  });
});
