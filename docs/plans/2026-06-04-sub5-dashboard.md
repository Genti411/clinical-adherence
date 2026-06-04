# Sub-project 5: Clinician Dashboard + Reporting - Plan

> REQUIRED SUB-SKILL: subagent-driven-development / executing-plans.

**Goal:** In the clinician app, a dashboard of the org's patients with adherence %, last-active, and non-adherence flags, plus a per-patient breakdown and CSV export. Pure stats + CSV are fully tested; data layer DI-tested; guarded (no live backend for tests/build).

**Where:** `C:\Users\Genti\clinical-adherence\apps\clinician`.

---

## Task 1: Adherence stats (pure, TDD)

- [ ] `lib/dashboard.ts` + `lib/dashboard.test.ts`:

```ts
export interface LogRow { plan_item_id: string; date: string; completed: boolean; }

export interface AdherenceStats { totalLogged: number; completed: number; pct: number; lastActive: string | null; flagged: boolean; }

// pct = completed / totalLogged (0 when none). lastActive = latest date with a completed log.
// flagged = pct < 50, OR no completed activity within the last `windowDays` (default 7) before `today`.
export function adherenceStats(logs: LogRow[], today: string, windowDays = 7): AdherenceStats {
  const total = logs.length;
  const completed = logs.filter((l) => l.completed).length;
  const pct = total === 0 ? 0 : Math.round((100 * completed) / total);
  const completedDates = logs.filter((l) => l.completed).map((l) => l.date).sort();
  const lastActive = completedDates.length ? completedDates[completedDates.length - 1] : null;
  const cutoff = addDays(today, -windowDays);
  const activeRecently = lastActive != null && lastActive >= cutoff;
  const flagged = total === 0 || pct < 50 || !activeRecently;
  return { totalLogged: total, completed, pct, lastActive, flagged };
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
```

Tests: empty -> pct 0, flagged true; all completed recently -> pct 100, not flagged;
50/50 boundary; stale lastActive (older than window) -> flagged; `addDays` correctness.
Commit: `feat(clinician): adherence stats`.

---

## Task 2: CSV serialization (pure, TDD)

- [ ] `lib/csv.ts` + `lib/csv.test.ts`:

```ts
export function toCsv(rows: Record<string, string | number | boolean | null>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
}
```

Tests: header + rows; quoting for commas/quotes/newlines; empty -> ''. Commit: `feat(clinician): CSV export helper`.

---

## Task 3: Dashboard data layer (DI, TDD)

- [ ] Add to `lib/data.ts`:

```ts
export async function listAssignments(client: any, orgId: string) {
  const { data } = await client.from('assignments')
    .select('id,patient_id,care_plan_id,status').eq('org_id', orgId).eq('status', 'active');
  return data ?? [];
}
export async function getAdherenceLogs(client: any, orgId: string) {
  const { data } = await client.from('adherence_logs')
    .select('assignment_id,plan_item_id,patient_id,date,completed').eq('org_id', orgId);
  return data ?? [];
}
```

Tests with a fake client: both return arrays / fall back to []. Commit: `feat(clinician): dashboard data layer`.

---

## Task 4: Dashboard pages

- [ ] `app/dashboard/page.tsx` (server or client): when unconfigured -> notice. Else
  load patients (`listPatients`) + logs (`getAdherenceLogs`), group logs by patient,
  compute `adherenceStats` per patient, render a table (name, adherence %, last
  active, a "Needs attention" badge when flagged), sorted flagged-first.
- [ ] A per-patient view (`app/dashboard/[patientId]/page.tsx` or an expandable row)
  showing that patient's logs and an **Export CSV** button (builds rows from the logs
  via `toCsv`, triggers a client download).
- [ ] One component test (mock data layer): the dashboard renders a flagged and a
  healthy patient with the right badge.
- [ ] `npx tsc --noEmit` clean; `npm test` green. Commit: `feat(clinician): adherence dashboard + CSV export`.

---

## Task 5: Verify

- [ ] `npx tsc --noEmit` clean; `npm test` in apps/clinician green (dashboard + csv +
  data + page, plus the existing 32); `npm run build` succeeds with no Supabase env.

## Notes
- Guarded; no live backend for tests/build.
- pct is over logged item-days (MVP approximation); a stricter "expected vs done"
  metric using plan schedules is a later refinement.
- Out of scope: charts/graphs library, PDF export, date-range pickers (CSV covers
  reporting for MVP).
