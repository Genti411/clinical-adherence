# Sub-project 2: Clinician Care-Plan Builder (Next.js) - Plan

> REQUIRED SUB-SKILL: subagent-driven-development / executing-plans.

**Goal:** A Next.js clinician portal in `apps/clinician` to sign in, build a care plan from the exercise library + activity targets, save it, and assign it to a patient. Works against Supabase when configured; graceful + unit-tested without it.

**Stack:** Next 16 (app router), React 19, `@supabase/ssr` + `@supabase/supabase-js`, `@clinical/exercise-core` (workspace), Jest + Testing Library. Model config on `C:\Users\Genti\beauty-ai-web`.

**Where:** `C:\Users\Genti\clinical-adherence\apps\clinician`. Repo is `Genti411/clinical-adherence`.

---

## Task 1: Scaffold the Next.js app

- [ ] In `apps/clinician`, create a minimal Next 16 app modeled on `beauty-ai-web`
  (copy + trim its `next.config.ts`, `tsconfig.json`, `eslint`, `jest.config`,
  `app/globals.css`, `app/layout.tsx`). `package.json`:

```json
{
  "name": "clinician",
  "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start", "test": "jest", "lint": "eslint" },
  "dependencies": {
    "next": "16.2.6", "react": "19.2.4", "react-dom": "19.2.4",
    "@supabase/ssr": "^0.10.3", "@supabase/supabase-js": "^2.106.2",
    "@clinical/exercise-core": "*"
  },
  "devDependencies": {
    "typescript": "~5.6.0", "@types/react": "^19", "@types/node": "^20",
    "jest": "^29.7.0", "ts-jest": "^29.1.0", "@types/jest": "^29.5.14",
    "@testing-library/react": "^16", "@testing-library/jest-dom": "^6", "jest-environment-jsdom": "^29.7.0"
  }
}
```

- [ ] `.env.example`: `NEXT_PUBLIC_SUPABASE_URL=` and `NEXT_PUBLIC_SUPABASE_ANON_KEY=`.
- [ ] `npm install` at the repo root (workspaces). `npx tsc --noEmit` clean. Commit: `chore(clinician): scaffold Next.js app`.

---

## Task 2: Guarded Supabase clients

- [ ] `lib/supabase/config.ts`:

```ts
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
```

- [ ] `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server) using
  `@supabase/ssr` `createBrowserClient`/`createServerClient`, each returning `null`
  when `!isSupabaseConfigured` (model cookie handling on beauty-ai-web). Commit:
  `feat(clinician): guarded supabase clients`.

---

## Task 3: Pure care-plan logic (TDD)

- [ ] Create `lib/plan.ts` + `lib/plan.test.ts`. Implement and test:

```ts
import { STRETCH_DATASET } from '@clinical/exercise-core';

export type ItemType = 'exercise' | 'walking' | 'swimming' | 'strength' | 'weigh_in' | 'custom';
export interface DraftItem { type: ItemType; exercise_id?: string; target: Record<string, unknown>; }
export interface DraftPlan { title: string; description?: string; duration_days?: number; items: DraftItem[]; }
export interface ExerciseOption { id: string; name: string; area: string; }

export function listExercises(): ExerciseOption[] {
  const out: ExerciseOption[] = [];
  for (const [area, recs] of Object.entries(STRETCH_DATASET)) {
    for (const r of recs as { name: string }[]) out.push({ id: r.name, name: r.name, area });
  }
  return out;
}

export function exerciseItem(name: string, target: Record<string, unknown> = {}): DraftItem {
  return { type: 'exercise', exercise_id: name, target };
}

export function activityItem(type: 'walking' | 'swimming' | 'weigh_in', target: Record<string, unknown>): DraftItem {
  return { type, target };
}

export function validatePlan(p: DraftPlan): string[] {
  const errors: string[] = [];
  if (!p.title || !p.title.trim()) errors.push('Title is required.');
  if (!p.items || p.items.length === 0) errors.push('Add at least one item.');
  (p.items || []).forEach((it, i) => {
    if (it.type === 'exercise' && !it.exercise_id) errors.push(`Item ${i + 1}: choose an exercise.`);
    if (it.type === 'walking' && !(Number(it.target?.stepsPerDay) > 0)) errors.push(`Item ${i + 1}: set steps per day.`);
    if (it.type === 'swimming' && !(Number(it.target?.sessionsPerWeek) > 0)) errors.push(`Item ${i + 1}: set sessions per week.`);
  });
  return errors;
}
```

Tests: `listExercises()` returns 39 options each with id/name/area; `exerciseItem`/`activityItem` shape; `validatePlan` flags empty title, no items, missing exercise/steps/sessions; returns `[]` for a valid plan. Commit: `feat(clinician): care-plan assembly + validation logic`.

---

## Task 4: Data layer (TDD with a mocked client)

- [ ] Create `lib/data.ts` + `lib/data.test.ts`. Functions take a Supabase-like
  client (dependency injection) so tests pass a fake:

```ts
import type { DraftPlan } from './plan';

export interface DbResult { id?: string; error?: string }

export async function createCarePlan(client: any, orgId: string, createdBy: string, draft: DraftPlan): Promise<DbResult> {
  const { data, error } = await client.from('care_plans')
    .insert({ org_id: orgId, created_by: createdBy, title: draft.title, description: draft.description ?? null, duration_days: draft.duration_days ?? null, status: 'active' })
    .select('id').single();
  if (error) return { error: error.message };
  const items = draft.items.map((it, i) => ({ care_plan_id: data.id, type: it.type, exercise_id: it.exercise_id ?? null, target: it.target, position: i }));
  const { error: e2 } = await client.from('plan_items').insert(items);
  if (e2) return { error: e2.message };
  return { id: data.id };
}

export async function assignPlan(client: any, params: { carePlanId: string; patientId: string; clinicianId: string; orgId: string }): Promise<DbResult> {
  const { data, error } = await client.from('assignments')
    .insert({ care_plan_id: params.carePlanId, patient_id: params.patientId, clinician_id: params.clinicianId, org_id: params.orgId, status: 'active' })
    .select('id').single();
  return error ? { error: error.message } : { id: data.id };
}

export async function listPatients(client: any, orgId: string): Promise<{ id: string; full_name: string | null; email: string | null }[]> {
  const { data, error } = await client.from('profiles').select('id,full_name,email').eq('org_id', orgId).eq('role', 'patient');
  if (error) return [];
  return data ?? [];
}
```

Tests with a fake client (chainable `from().insert().select().single()` returning `{data:{id},error:null}`): `createCarePlan` inserts the plan then the items with positions and returns the id; `assignPlan` inserts an assignment; `listPatients` returns rows. Commit: `feat(clinician): care-plan data layer`.

---

## Task 5: Pages (login, plans list, builder)

- [ ] `app/login/page.tsx` - clinician email OTP sign-in (send code / verify), using
  the browser client; shows "Cloud not configured" when `!isSupabaseConfigured`.
- [ ] `app/page.tsx` - if not configured: a setup notice. Else: a list of the org's
  care plans (read via server client) + a "New care plan" link.
- [ ] `app/plans/new/page.tsx` - the builder (client component): title, description,
  duration; an **exercise picker** (searchable list from `listExercises()`); buttons
  to add a walking-steps target, a swimming-sessions target, and a weigh-in; the
  current item list with remove; live validation via `validatePlan`; Save (calls
  `createCarePlan`) then an Assign-to-patient step (`listPatients` + `assignPlan`).
  Gracefully no-ops with a notice when unconfigured.
- [ ] One component test (`app/plans/new/page.test.tsx`) with the data layer + supabase
  mocked: renders the builder, adds an exercise item, shows it in the list, and that
  saving with an empty title surfaces the validation error.
- [ ] `npx tsc --noEmit` clean; `npm test` green. Commit: `feat(clinician): login, plans list, and care-plan builder pages`.

---

## Task 6: Verify

- [ ] `npx tsc --noEmit` clean across the workspace.
- [ ] `npm test` in `apps/clinician` green (plan + data + page tests) and
  `packages/exercise-core` still green.
- [ ] `npm run build` (Next production build) succeeds with the empty/placeholder env
  (it must build without a live Supabase - the clients are guarded).
- [ ] `git log --oneline`.

---

## Notes
- LLM-free; uses the local exercise library only.
- No live backend required for tests/build; real end-to-end is gated on the owner's
  Supabase project + BAA.
- Out of scope: editing existing plans, plan templates, rich scheduling, full patient
  management, dashboards (sub-project 5).
