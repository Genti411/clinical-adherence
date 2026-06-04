// Append-only audit log. Never throws - an audit failure must not break the action.
export async function logAudit(
  client: any,
  e: { orgId: string; actorId: string | null; action: string; entity?: string; entityId?: string | null; meta?: Record<string, unknown> },
): Promise<void> {
  try {
    await client.from('audit_logs').insert({
      org_id: e.orgId, actor_id: e.actorId, action: e.action,
      entity: e.entity ?? null, entity_id: e.entityId ?? null, meta: e.meta ?? null,
    });
  } catch {
    /* swallow - audit is best-effort, never blocks the user action */
  }
}
