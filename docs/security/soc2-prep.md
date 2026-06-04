# SOC 2 Preparation Checklist

> Not legal advice. SOC 2 Type I/II audits require engagement with a licensed CPA firm
> (AICPA-accredited). This checklist covers the Trust Services Criteria (TSC) most
> relevant to this product: Security (CC), Availability (A), and Confidentiality (C).
> Completing this checklist does not constitute SOC 2 compliance.

---

## Trust Services Criteria: Security (CC)

### Logical and Physical Access Controls

| Control | Status | Notes |
|---------|--------|-------|
| CC6.1 - Restrict logical access | In place | RLS, role-based auth, OTP |
| CC6.2 - Prior to issuing system credentials, register and authorize new users | In place | Supabase Auth; clinician onboarding to be documented |
| CC6.3 - Remove access when no longer required | Operational | Access removal procedure to be documented |
| CC6.6 - Restrict access from outside the network | In place | Supabase enforces HTTPS; RLS prevents cross-org access |
| CC6.7 - Manage transmission, movement, and removal of information | In place | HTTPS in transit; no file export of raw PHI except patient self-export |
| CC6.8 - Prevent unauthorized or malicious software | Operational | Dependency scanning (`npm audit`); to be integrated in CI |

### System Operations

| Control | Status | Notes |
|---------|--------|-------|
| CC7.1 - Detect and monitor for new vulnerabilities | Operational | `npm audit` manual; add to CI; Supabase CVE notifications |
| CC7.2 - Monitor for system anomalies | Operational | Supabase logs available; alerting not yet configured |
| CC7.3 - Evaluate security events | Operational | Incident response plan to be documented |
| CC7.4 - Respond to identified security incidents | Operational | See `SECURITY.md`; full runbook to be written |
| CC7.5 - Identify and disclose breaches | Operational | Breach notification procedure to be written |

### Change Management

| Control | Status | Notes |
|---------|--------|-------|
| CC8.1 - Authorize, design, develop, configure, document, test, approve, and implement changes | Partial | Git-based workflow; PR reviews in place; formal change approval process to be documented |

### Risk Mitigation

| Control | Status | Notes |
|---------|--------|-------|
| CC9.1 - Identify, assess, and manage the risk from vendors and business partners | Operational | Supabase BAA required; vendor risk register to be created |
| CC9.2 - Monitor vendor compliance | Operational | Review Supabase security page and compliance reports annually |

---

## Trust Services Criteria: Availability (A)

| Control | Status | Notes |
|---------|--------|-------|
| A1.1 - Identify, assess availability requirements | Operational | RTO/RPO targets to be defined |
| A1.2 - Environmental protections | In place (delegated) | Supabase manages infrastructure redundancy |
| A1.3 - Recovery and continuity plans | Operational | Verify Supabase backup configuration; document restore procedures |

---

## Trust Services Criteria: Confidentiality (C)

| Control | Status | Notes |
|---------|--------|-------|
| C1.1 - Identify and maintain confidential information | Partial | Data categories documented in `data-handling.md`; formal data inventory to be completed |
| C1.2 - Dispose of confidential information | Partial | Patient deletion request workflow implemented (audit log); actual deletion runbook for clinic to document |

---

## Already in place (code evidence)

- Row-Level Security with org/patient isolation (tested: `supabase/test/rls-harness.mjs`)
- Append-only audit log wired into all sensitive mutations
- Email OTP authentication (no passwords)
- Patient data export and deletion request (patient rights)
- HTTPS / TLS for all data in transit
- Encryption at rest (Supabase managed)

---

## Next steps to initiate a SOC 2 audit

1. Select a licensed CPA firm for the audit engagement.
2. Define audit scope (system description), period, and Trust Service Categories.
3. Complete all "Operational" items above.
4. Run a readiness assessment (gap analysis) with the auditor.
5. Collect evidence for Type I (point-in-time); then run for 6-12 months for Type II.
