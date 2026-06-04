# Sub-project 4: Wearable Verification (steps + weight) - Plan

> REQUIRED SUB-SKILL: subagent-driven-development / executing-plans.

**Goal:** Auto-verify walking (steps) and weigh-in (body weight) adherence from a health-data provider, in the patient app. Build a provider abstraction + pure verification logic (fully testable with a mock); wire a "Sync health data" action. Real Apple HealthKit / Android Health Connect binding is a documented native activation step (needs a dev build + device).

**Where:** `C:\Users\Genti\clinical-adherence\apps\patient`. LLM-free, guarded, no live backend for tests.

---

## Task 1: Health provider abstraction + mock

- [ ] `src/lib/health/provider.ts`:

```ts
export interface HealthSample { date: string; value: number; } // date = YYYY-MM-DD
export interface HealthProvider {
  isAvailable(): Promise<boolean>;
  requestPermissions(): Promise<boolean>;
  getSteps(start: string, end: string): Promise<HealthSample[]>;   // steps per day
  getWeightKg(start: string, end: string): Promise<HealthSample[]>; // most recent per day
}
```

- [ ] `src/lib/health/mock-provider.ts` - a `mockHealthProvider(data)` factory returning
  a `HealthProvider` backed by in-memory arrays (used in tests and as the default until
  a native provider is configured).
- [ ] `src/lib/health/index.ts` - `getHealthProvider()` returns the native provider when
  available, else the mock. (For now it always returns a mock; a `// TODO native` note
  marks where the HealthKit/Health Connect provider plugs in.)
- [ ] Tests: the mock returns the seeded samples; `getHealthProvider()` returns a
  provider implementing the interface. Commit: `feat(patient): health provider abstraction + mock`.

---

## Task 2: Verification logic (pure, TDD)

- [ ] `src/lib/health/verify.ts` + tests:

```ts
import type { PlanItem } from '@/lib/today';
import type { HealthProvider } from './provider';

export interface VerifiedResult { planItemId: string; date: string; completed: boolean; value: Record<string, number>; }

// For each walking item, mark the day complete if steps >= target.stepsPerDay.
// For each weigh_in item, mark complete if a weight sample exists for the day.
export async function verifyFromHealth(
  items: PlanItem[],
  provider: HealthProvider,
  date: string,
): Promise<VerifiedResult[]> {
  const out: VerifiedResult[] = [];
  const steps = await provider.getSteps(date, date);
  const weights = await provider.getWeightKg(date, date);
  const stepsForDay = steps.find((s) => s.date === date)?.value ?? 0;
  const weightForDay = weights.find((w) => w.date === date)?.value;
  for (const it of items) {
    if (it.type === 'walking') {
      const target = Number(it.target?.stepsPerDay) || 0;
      out.push({ planItemId: it.id, date, completed: target > 0 && stepsForDay >= target, value: { steps: stepsForDay } });
    } else if (it.type === 'weigh_in') {
      out.push({ planItemId: it.id, date, completed: weightForDay != null, value: weightForDay != null ? { weightKg: weightForDay } : {} });
    }
  }
  return out;
}
```

- [ ] Tests with the mock provider: steps >= target -> completed; steps < target ->
  not completed; weigh-in completed when a sample exists, not when absent; ignores
  non-walking/weigh_in items. Commit: `feat(patient): health verification logic`.

---

## Task 3: Sync action - write verified adherence

- [ ] In `src/lib/care.ts`, add `syncVerified(client, assignment, results, patientId, orgId)`
  that upserts an `adherence_logs` row per `VerifiedResult` (source `healthkit`),
  reusing the existing upsert (`onConflict: 'assignment_id,plan_item_id,date'`). DI;
  tested with a fake client (asserts upsert rows + source). Commit:
  `feat(patient): persist health-verified adherence`.

---

## Task 4: Today screen "Sync health data" button

- [ ] On the Today screen, add a "Sync health data" button (only when configured) that:
  requests permissions via `getHealthProvider()`, runs `verifyFromHealth` for today's
  walking/weigh-in items, calls `syncVerified`, and refreshes the checklist (verified
  items show as done with their value, e.g. "9,210 steps"). Manual toggle still works
  for the other items.
- [ ] Light screen test (mock the provider + data layer): pressing Sync marks a
  walking item done. Commit: `feat(patient): sync health data on Today screen`.

---

## Task 5: Native binding docs

- [ ] `apps/patient/docs/health-integration.md`: to enable real data, add
  `react-native-health` (iOS HealthKit) and `react-native-health-connect` (Android),
  create the native `HealthProvider` implementing the interface, add the config
  plugins + Info.plist/permission entries, and build a dev client (Expo Go cannot use
  these). Note: requires a physical device to test; the mock provider keeps the app
  fully functional/testable until then. Commit: `docs(patient): health integration guide`.

---

## Task 6: Verify

- [ ] `npx tsc --noEmit` clean; `npm test` in apps/patient green (health provider,
  verify, care sync, screen); exercise-core unaffected.
- [ ] `npx expo export --platform web` bundles (mock provider; no native, no backend).

## Notes
- Real HealthKit/Health Connect = native dev build + device (documented). Mock keeps
  everything testable now.
- Out of scope: swimming/GPS/heart-rate (later); background sync.
