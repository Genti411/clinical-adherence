# Sub-project 3: Patient Adherence App (Expo) - Plan

> REQUIRED SUB-SKILL: subagent-driven-development / executing-plans.

**Goal:** An Expo patient app in `apps/patient`: sign in, see the assigned care plan as a "Today" checklist (exercises from the library + activity targets), and mark items done (logged to `adherence_logs`). Guarded + unit-tested without a live Supabase; reuses `@clinical/exercise-core`.

**Stack:** Expo SDK 56, expo-router, TypeScript, @supabase/supabase-js, react-native-url-polyfill, AsyncStorage, Jest. Model scaffold/config on `C:\Users\Genti\flexai-coach`.

**Where:** `C:\Users\Genti\clinical-adherence\apps\patient`. Monorepo (npm workspaces; Metro needs monorepo config).

---

## Task 1: Schema - unique adherence per item/day

- [ ] Add `supabase/migrations/0002_adherence_unique.sql`:

```sql
create unique index if not exists adherence_logs_unique_item_day
  on public.adherence_logs (assignment_id, plan_item_id, date);
```

- [ ] Update `supabase/test/rls-harness.mjs` only if needed (it applies all migration
  files in order); re-run `node supabase/test/rls-harness.mjs` - all 7 RLS assertions
  still pass. Commit: `feat(db): unique adherence per item/day (for upsert)`.

---

## Task 2: Expo scaffold (monorepo)

- [ ] Scaffold `apps/patient` modeled on flexai-coach: copy + trim `package.json`
  (Expo SDK 56 deps: expo, expo-router, react-native, react, etc. + add
  `@supabase/supabase-js`, `react-native-url-polyfill`,
  `@react-native-async-storage/async-storage`, `@clinical/exercise-core`), `app.json`
  (name "Adherence", slug "clinical-patient"), `tsconfig.json`, `jest.config.js`
  (jest-expo + moduleNameMapper for `@clinical/exercise-core` ->
  `../../packages/exercise-core/src/index.ts`), `jest.setup.ws.js`, and the
  `src/constants/theme.ts` + `src/hooks` + `src/components/themed-*` from flexai.
- [ ] Add `metro.config.js` for the monorepo so Metro resolves the workspace package
  (watchFolders = repo root; nodeModulesPaths = app + root `node_modules`) - per the
  Expo monorepo guide.
- [ ] `.env.example`: `EXPO_PUBLIC_SUPABASE_URL=`, `EXPO_PUBLIC_SUPABASE_ANON_KEY=`.
- [ ] `npm install` at repo root; `npx tsc --noEmit` clean. Commit: `chore(patient): scaffold expo app`.

---

## Task 3: Guarded supabase + auth (reuse flexai pattern)

- [ ] `src/lib/supabase.ts` (guarded: null when env unset; `isSupabaseConfigured`) and
  `src/lib/auth.ts` (`getSession`, `sendCode`, `verifyCode`, `signOut`) - copy the
  flexai-coach versions verbatim (they already handle the null/unconfigured case).
- [ ] Light tests: `getSession` returns null and `sendCode` reports not-configured when
  env unset. Commit: `feat(patient): guarded supabase + auth`.

---

## Task 4: Today checklist logic (pure, TDD)

- [ ] `src/lib/today.ts` + `tests/today.test.ts`:

```ts
import { STRETCH_DATASET } from '@clinical/exercise-core';

export interface PlanItem { id: string; type: string; exercise_id: string | null; target: Record<string, any>; position: number; }
export interface AdherenceLog { plan_item_id: string; completed: boolean; }
export interface ChecklistEntry { itemId: string; title: string; detail: string; completed: boolean; }

function lookupExercise(id: string | null): { name: string; detail: string } | null {
  if (!id) return null;
  for (const recs of Object.values(STRETCH_DATASET)) {
    for (const r of recs as { name: string; instructions: string[] }[]) {
      if (r.name === id) return { name: r.name, detail: (r.instructions || []).join(' ') };
    }
  }
  return null;
}

function fmtTarget(t: Record<string, any> = {}): string {
  const p: string[] = [];
  if (t.sets) p.push(`${t.sets} sets`);
  if (t.reps) p.push(`${t.reps} reps`);
  if (t.duration) p.push(String(t.duration));
  if (t.frequencyPerWeek) p.push(`${t.frequencyPerWeek}x/week`);
  if (t.stepsPerDay) p.push(`${t.stepsPerDay} steps/day`);
  if (t.sessionsPerWeek) p.push(`${t.sessionsPerWeek} sessions/week`);
  return p.join(' · ');
}

export function buildChecklist(items: PlanItem[], logs: AdherenceLog[]): ChecklistEntry[] {
  const done = new Set(logs.filter((l) => l.completed).map((l) => l.plan_item_id));
  return [...items]
    .sort((a, b) => a.position - b.position)
    .map((it) => {
      let title = 'Activity';
      if (it.type === 'exercise') title = lookupExercise(it.exercise_id)?.name ?? 'Exercise';
      else if (it.type === 'walking') title = 'Walking';
      else if (it.type === 'swimming') title = 'Swimming';
      else if (it.type === 'weigh_in') title = 'Weigh-in';
      else if (it.type === 'strength') title = 'Strength';
      const detail = fmtTarget(it.target) || (it.type === 'exercise' ? lookupExercise(it.exercise_id)?.detail ?? '' : '');
      return { itemId: it.id, title, detail, completed: done.has(it.id) };
    });
}

export function adherencePercent(entries: ChecklistEntry[]): number {
  if (entries.length === 0) return 0;
  return Math.round((100 * entries.filter((e) => e.completed).length) / entries.length);
}
```

Tests: maps an exercise item to its library name+detail; walking/swimming/weigh-in titles + formatted targets; marks completed from logs; sorts by position; `adherencePercent` (0 empty, 50 for 1/2, 100 all). Commit: `feat(patient): today checklist logic`.

---

## Task 5: Care data layer (DI, TDD)

- [ ] `src/lib/care.ts` + `tests/care.test.ts`:

```ts
export async function getActiveAssignment(client: any, patientId: string) {
  const { data } = await client.from('assignments')
    .select('id,care_plan_id,org_id').eq('patient_id', patientId).eq('status', 'active')
    .order('start_date', { ascending: false }).limit(1).maybeSingle();
  return data ?? null;
}

export async function getPlanItems(client: any, carePlanId: string) {
  const { data } = await client.from('plan_items')
    .select('id,type,exercise_id,target,position').eq('care_plan_id', carePlanId);
  return data ?? [];
}

export async function getTodayLogs(client: any, assignmentId: string, date: string) {
  const { data } = await client.from('adherence_logs')
    .select('plan_item_id,completed').eq('assignment_id', assignmentId).eq('date', date);
  return data ?? [];
}

export async function markDone(
  client: any,
  p: { assignmentId: string; planItemId: string; patientId: string; orgId: string; date: string; completed: boolean },
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await client.from('adherence_logs').upsert(
    { assignment_id: p.assignmentId, plan_item_id: p.planItemId, patient_id: p.patientId, org_id: p.orgId, date: p.date, completed: p.completed, source: 'manual' },
    { onConflict: 'assignment_id,plan_item_id,date' },
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}
```

Tests with a fake chainable client: `getActiveAssignment` returns the row; `getPlanItems`/`getTodayLogs` return arrays; `markDone` calls upsert with the right onConflict and returns ok. Commit: `feat(patient): care data layer`.

---

## Task 6: Today screen

- [ ] `src/app/_layout.tsx` (Stack) and `src/app/index.tsx`:
  - if `!isSupabaseConfigured` -> a "not configured" notice.
  - else if no session -> email-OTP sign-in (reuse the auth helpers).
  - else -> load active assignment -> plan items -> today's logs -> `buildChecklist`,
    render the list (title + detail + a Done toggle per item), show `adherencePercent`,
    and call `markDone` on toggle (optimistic update). Empty state when no active plan.
- [ ] A component test for `index.tsx` rendering a provided checklist (mock the data
  layer/supabase) - shows item titles and toggling marks done. Keep it light.
- [ ] `npx tsc --noEmit` clean; `npm test` green. Commit: `feat(patient): Today adherence screen`.

---

## Task 7: Verify

- [ ] `npx tsc --noEmit` clean.
- [ ] `npm test` in apps/patient green (today + care + auth + screen); exercise-core still green.
- [ ] `npx expo export --platform web` in apps/patient bundles (guarded; no live backend).
- [ ] Re-run `node supabase/test/rls-harness.mjs` (migration 0002) - 7 assertions pass.

## Notes
- LLM-free; reuses the exercise library for exercise names/instructions. (Animations/
  StretchCard reuse is a later polish - this MVP shows name + target + instructions.)
- Guarded: builds/tests with no Supabase; real end-to-end needs the owner's project.
- Out of scope: wearable auto-verification (sub-project 4), history/charts, messaging.
