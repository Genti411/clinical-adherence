# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in this product, please disclose it
responsibly. **Do not open a public GitHub issue.**

Contact: gentian.hoxha91@gmail.com

Please include:
- A description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept if possible)
- The component or file affected

We will acknowledge receipt within 2 business days and aim to resolve confirmed
vulnerabilities within 30 days.

---

## Data handling summary

| Category | Detail |
|----------|--------|
| Data stored | Patient assignments, adherence logs, outcomes (daily function scores), audit logs |
| PHI classification | Adherence and outcome data may constitute Protected Health Information (PHI) under HIPAA |
| Encryption in transit | All traffic over HTTPS (Supabase TLS) |
| Encryption at rest | Supabase-managed AES-256 disk encryption |
| Access control | Row-Level Security (RLS) per org and per patient; email OTP authentication |
| Audit logging | All sensitive mutations (plan create, assignment create, outcome create, deletion request) written to append-only `audit_logs` table |
| Subprocessors | Supabase (database, auth, storage) - see `docs/security/data-handling.md` |

---

## No real PHI until BAA is in place

This product must not be used to store or process real patient data (PHI) until:

1. A Business Associate Agreement (BAA) has been signed with Supabase.
2. A BAA or equivalent data-processing agreement is in place with any other vendors.
3. A formal risk assessment has been completed.

See `docs/security/hipaa-readiness.md` for the full HIPAA readiness status.

---

## Security controls in place

- Row-Level Security enforced at the database layer (Supabase Postgres RLS)
- Append-only audit log; application role cannot update or delete audit rows
- Authentication via Supabase email OTP; no passwords stored
- No secrets in client code; Supabase anon key is public by design; all sensitive operations are controlled by RLS
- Dependencies reviewed via `npm audit`; patch critical/high vulnerabilities before each release
