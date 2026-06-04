import { logAudit } from '../src/lib/audit';

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
      actorId: 'patient-1',
      action: 'outcome.create',
      entity: 'outcomes',
      entityId: 'out-1',
      meta: { instrument: 'daily-function-v1' },
    });

    expect(inserted).not.toBeNull();
    expect(inserted.table).toBe('audit_logs');
    expect(inserted.row).toMatchObject({
      org_id: 'org-1',
      actor_id: 'patient-1',
      action: 'outcome.create',
      entity: 'outcomes',
      entity_id: 'out-1',
      meta: { instrument: 'daily-function-v1' },
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
