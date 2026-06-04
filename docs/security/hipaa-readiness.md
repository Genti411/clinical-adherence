# HIPAA Readiness

> Not legal advice. This document describes the current technical and operational state
> of the product relative to the HIPAA Security Rule. Achieving full compliance requires
> completing the operational items below and having them assessed by a qualified
> professional. No PHI should be stored until BAAs are in place.

---

## HIPAA Security Rule safeguard mapping

| Safeguard | Requirement | Status |
|-----------|-------------|--------|
| **Access Control** | Unique user identification | Implemented - Supabase Auth with per-user sessions (email OTP) |
| **Access Control** | Minimum necessary / role-based access | Implemented - Row-Level Security (RLS) enforces per-org and per-patient data isolation; clinician and patient roles scoped separately; tested via RLS harness (7 assertions) |
| **Access Control** | Least-privilege DB role | Implemented - anon/authenticated Supabase roles; no admin credentials in client |
| **Audit Controls** | Record and examine activity in systems containing PHI | Implemented - append-only `audit_logs` table; all sensitive mutations (care plan create, assignment create, outcome create, deletion request) write audit rows; `logAudit` is best-effort and never blocks user actions |
| **Integrity** | Protect PHI from improper alteration or destruction | Implemented - audit_logs is insert-only by policy (no UPDATE/DELETE in RLS); outcomes and adherence logs use upsert with conflict keys |
| **Transmission Security** | Encrypt PHI in transit | Implemented - all client-to-Supabase traffic over HTTPS/TLS (Supabase managed) |
| **Encryption at Rest** | Protect stored PHI | Implemented - Supabase managed encryption at rest (AES-256) |
| **Authentication** | Verify identity before granting access | Implemented - Supabase email OTP; session tokens; screens guarded against unauthenticated access |
| **Automatic Logoff** | Terminate sessions after inactivity | Not implemented - idle-timeout auto-logout is out of scope for this release; operational workaround: users should sign out |
| **Business Associate Agreements (BAAs)** | Written agreement with each BA handling PHI | Operational - must be signed with Supabase and any other subprocessors before go-live with real PHI |
| **Risk Analysis** | Conduct accurate, thorough assessment of risks | Operational - formal risk assessment required; not yet performed |
| **Workforce Training** | Train all workforce members on policies/procedures | Operational - HIPAA workforce training required for all staff and contractors |
| **Incident / Breach Response** | Procedures to identify, respond to, mitigate breaches | Operational - incident response plan and breach notification procedure must be documented and drilled |
| **Backup and Disaster Recovery** | Data backup and restore procedures | Operational - Supabase provides automated backups (Pro plan+); DR plan and RTO/RPO targets must be documented |
| **Access Review** | Regular review of access rights | Operational - periodic access reviews not yet scheduled |
| **Physical Safeguards** | Control physical access to systems containing PHI | Operational - cloud-hosted (Supabase); physical safeguards delegated to Supabase; document in BAA |
| **Policies and Procedures** | Written policies covering all HIPAA requirements | Operational - privacy policy, acceptable-use policy, and HIPAA-specific procedures must be drafted |

---

## What "Implemented in code" means

The items marked "Implemented" are tested technical controls present in the codebase:

- **RLS per-org/per-patient**: every data table has RLS policies that restrict reads and writes to the authenticated user's org (clinician) or patient ID (patient). Verified by `supabase/test/rls-harness.mjs` (7 assertions, runs against a local Docker Supabase instance).
- **Role-based access**: patient app can only read/write its own rows; clinician app can read all rows in the org.
- **Append-only audit logs**: `audit_logs` rows cannot be updated or deleted by the application role. The `logAudit` helper inserts a row on every sensitive mutation; it swallows errors so audit failures never break user-facing flows.
- **Auth (OTP)**: Supabase email OTP; no passwords stored.
- **Encryption in transit**: HTTPS enforced by Supabase; the apps do not make plain-HTTP calls.
- **Encryption at rest**: Supabase manages disk encryption for all stored data.

---

## Operational items (your action required)

The following require non-code work by the product owner and/or a qualified compliance officer:

1. **Sign BAAs** - with Supabase (available on Pro plan) and any other vendors that may handle PHI.
2. **Formal risk analysis** - document threats, vulnerabilities, likelihood, and impact.
3. **Policies and procedures** - privacy policy, security policy, incident response plan, breach notification procedure, access control policy.
4. **Workforce training** - HIPAA awareness training for all staff before go-live.
5. **Breach response plan** - documented procedure for identifying, containing, and notifying affected parties within 60 days.
6. **Backup / DR documentation** - confirm Supabase backup configuration; define RTO/RPO; test restore.
7. **Access reviews** - schedule periodic reviews of who has access to PHI.
8. **Idle-timeout auto-logout** - implement session expiry on inactivity if required by your risk assessment.
