# Data Handling

> Not legal advice. This document describes how the clinical-adherence product collects,
> stores, uses, and allows deletion of personal data, including Protected Health
> Information (PHI). It must be reviewed by a qualified legal or compliance professional
> before the product is used with real patient data.

---

## Data categories

| Category | Fields | PHI? | Stored where |
|----------|--------|------|--------------|
| Patient profile | user id, email, full name, org_id | Yes | Supabase `profiles` table |
| Care plans | title, description, duration, items | No (plan template) | Supabase `care_plans`, `plan_items` |
| Assignments | patient_id, care_plan_id, clinician_id, org_id, status | Yes | Supabase `assignments` |
| Adherence logs | patient_id, plan_item_id, date, completed, source | Yes | Supabase `adherence_logs` |
| Outcomes | patient_id, instrument, score, recorded_at | Yes | Supabase `outcomes` |
| Audit logs | actor_id, action, entity, entity_id, org_id, meta, created_at | Yes (contains user IDs) | Supabase `audit_logs` |

---

## Data retention

| Category | Retention policy |
|----------|-----------------|
| Adherence logs | Retained indefinitely by default; clinics may be legally required to retain clinical records for 7-10 years (jurisdiction-dependent) |
| Outcomes | Same as adherence logs |
| Audit logs | Append-only; no deletion by application role; retention matches clinical records |
| Profile data | Retained while account is active; deletion requests are logged (see below) |

---

## Patient rights

### Export

Patients can export all their data (assignments, adherence logs, outcomes) in JSON
format via the Privacy & Data screen in the patient app. This is implemented in
`apps/patient/src/lib/care.ts::exportMyData`.

### Deletion request

Patients can submit a deletion request via the Privacy & Data screen. This logs an
audit event (`patient.deletion_requested`) and returns a confirmation to the patient.

**Important:** The product does not perform hard deletion of clinical records.
Clinical data (adherence logs, outcomes, assignments) may need to be retained by
the clinic under applicable law (e.g., HIPAA requires covered entities to retain
records for 6 years from creation or last use, whichever is later; some states
require longer). The clinic is responsible for reviewing each deletion request and
taking action consistent with their legal obligations.

The `requestDeletion` function in `apps/patient/src/lib/care.ts` implements the
request logging. Actual deletion is an operational workflow for the clinic.

---

## Subprocessors

| Vendor | Role | Data processed | HIPAA BAA available |
|--------|------|---------------|---------------------|
| Supabase | Database, Auth, Storage | All PHI listed above | Yes (Pro plan and above) |

No other subprocessors currently handle PHI. If additional vendors are added
(e.g., analytics, error tracking, push notifications), this table must be updated
and appropriate DPAs/BAAs obtained before PHI is shared.

---

## Data flows

```
Patient app (Expo / React Native)
  --> Supabase REST API (HTTPS)
      --> Postgres (RLS enforced, encrypted at rest)

Clinician app (Next.js)
  --> Supabase REST API (HTTPS)
      --> Postgres (RLS enforced, encrypted at rest)
```

No PHI is sent to any third-party analytics, logging, or monitoring service.

---

## No real PHI in development

Development and test environments use synthetic data only. The RLS test harness
(`supabase/test/rls-harness.mjs`) uses fake UUIDs and no real patient information.
CI pipelines must not be configured with production credentials.
