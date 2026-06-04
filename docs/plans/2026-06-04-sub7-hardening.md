# Sub-project 7: HIPAA / Security Hardening + SOC 2 Prep - Plan

> REQUIRED SUB-SKILL: subagent-driven-development / executing-plans.

**Goal:** Make the product HIPAA-*ready* in code + documentation: append-only audit logging wired into sensitive mutations, patient data-rights (export + deletion request), and the compliance docs (HIPAA-readiness, SECURITY, SOC 2 prep, data handling). Pure/DI logic tested; guarded; no live backend for tests.

**Where:** patient + clinician apps + repo `docs/security/`.

---

## Task 1: Audit helper (both apps, TDD)

- [ ] `apps/clinician/lib/audit.ts` and `apps/patient/src/lib/audit.ts` (identical small helper):

```ts
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
```

- [ ] Tests (both apps, fake client): inserts with the right fields; a throwing client
  does not reject. Commit (each app): `feat(audit): append-only audit helper`.

---

## Task 2: Wire audit into sensitive mutations (TDD)

- [ ] Clinician `lib/data.ts`: `createCarePlan` and `assignPlan` take an extra
  `actorId` arg and call `logAudit` internally after success
  (`care_plan.create` / `assignment.create`, entityId = new id, org from the row).
  Update their tests to assert BOTH the entity insert and the `audit_logs` insert on
  the fake client. Update the builder page call sites to pass the clinician's id.
- [ ] Patient `src/lib/care.ts`: `saveOutcome` takes `actorId` and logs
  `outcome.create`. Update its test + the check-in screen call site.
- [ ] Commit: `feat(audit): record plan/assignment/outcome actions`.

---

## Task 3: Patient data rights (export + deletion request, TDD)

- [ ] Add to `apps/patient/src/lib/care.ts`:

```ts
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
  const { logAudit } = await import('./audit');
  await logAudit(client, { orgId: p.orgId, actorId: p.patientId, action: 'patient.deletion_requested', entity: 'profiles', entityId: p.patientId });
  return { ok: true };
}
```

- [ ] Tests: `exportMyData` returns the three datasets; `requestDeletion` writes an
  audit row and returns ok.
- [ ] `apps/patient/src/app/privacy.tsx`: a Privacy & Data screen with **Export my
  data** (renders the JSON) and **Request data deletion** (calls `requestDeletion`,
  shows a note that clinical records may be retained per the clinic's policy/law).
  Header link from Today. Light screen test.
- [ ] Commit: `feat(patient): data export + deletion request (patient rights)`.

---

## Task 4: Compliance docs

- [ ] `docs/security/hipaa-readiness.md`: a table mapping HIPAA Security Rule safeguards
  to status - **Implemented in code:** RLS per-org/per-patient (tested harness),
  role-based access, append-only audit logs, auth (OTP), least-privilege DB role,
  encryption in transit (HTTPS) and at rest (Supabase managed). **Operational (your
  action):** signed BAAs (Supabase + clinics), risk assessment, workforce training,
  incident/breach response, backup/DR, access reviews. Marked "not legal advice".
- [ ] `docs/security/SECURITY.md`: vulnerability-disclosure contact; data-handling
  summary; "no real PHI until BAA".
- [ ] `docs/security/soc2-prep.md`: checklist of SOC 2 Trust Services controls to
  pursue (security, availability, confidentiality) and what's already in place.
- [ ] `docs/security/data-handling.md`: data categories (PHI), retention, patient
  rights (export/deletion-request), subprocessors (Supabase).
- [ ] Commit: `docs(security): HIPAA-readiness, SECURITY, SOC2 prep, data handling`.

---

## Task 5: Verify

- [ ] `npx tsc --noEmit` clean in both apps.
- [ ] `npm test` green in both (audit + wired mutations + data-rights + existing
  patient 63 / clinician 69).
- [ ] `npx expo export --platform web` (patient) + `npm run build` (clinician) succeed.
- [ ] Re-run `node supabase/test/rls-harness.mjs` - 7 assertions still pass
  (audit_logs remains append-only/admin-select).

## Notes
- HIPAA-*ready* in code; the operational items (BAAs, risk assessment, SOC 2 audit,
  training, breach process) are non-code work for the owner + assessors.
- We log deletion *requests* rather than hard-deleting clinical records (retention).
- Out of scope: idle-timeout auto-logout, field-level encryption, full DSAR workflow.
