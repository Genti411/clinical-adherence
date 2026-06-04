import { verifyFromHealth } from '../src/lib/health/verify';
import { mockHealthProvider } from '../src/lib/health/mock-provider';
import type { PlanItem } from '../src/lib/today';

const DATE = '2026-06-04';

const walkingItem: PlanItem = {
  id: 'walk-1',
  type: 'walking',
  exercise_id: null,
  target: { stepsPerDay: 8000 },
  position: 1,
};

const weighInItem: PlanItem = {
  id: 'weigh-1',
  type: 'weigh_in',
  exercise_id: null,
  target: {},
  position: 2,
};

const exerciseItem: PlanItem = {
  id: 'ex-1',
  type: 'exercise',
  exercise_id: 'Chin Tucks',
  target: { sets: 3, reps: 10 },
  position: 3,
};

describe('verifyFromHealth', () => {
  it('marks walking complete when steps >= target', async () => {
    const provider = mockHealthProvider({ steps: [{ date: DATE, value: 9000 }] });
    const results = await verifyFromHealth([walkingItem], provider, DATE);
    expect(results).toHaveLength(1);
    expect(results[0].planItemId).toBe('walk-1');
    expect(results[0].completed).toBe(true);
    expect(results[0].value.steps).toBe(9000);
  });

  it('marks walking incomplete when steps < target', async () => {
    const provider = mockHealthProvider({ steps: [{ date: DATE, value: 3000 }] });
    const results = await verifyFromHealth([walkingItem], provider, DATE);
    expect(results[0].completed).toBe(false);
    expect(results[0].value.steps).toBe(3000);
  });

  it('marks walking incomplete when no step data', async () => {
    const provider = mockHealthProvider();
    const results = await verifyFromHealth([walkingItem], provider, DATE);
    expect(results[0].completed).toBe(false);
    expect(results[0].value.steps).toBe(0);
  });

  it('marks walking incomplete when target is 0', async () => {
    const item: PlanItem = { ...walkingItem, target: { stepsPerDay: 0 } };
    const provider = mockHealthProvider({ steps: [{ date: DATE, value: 9000 }] });
    const results = await verifyFromHealth([item], provider, DATE);
    expect(results[0].completed).toBe(false);
  });

  it('marks weigh_in complete when a sample exists', async () => {
    const provider = mockHealthProvider({ weightKg: [{ date: DATE, value: 72.5 }] });
    const results = await verifyFromHealth([weighInItem], provider, DATE);
    expect(results[0].completed).toBe(true);
    expect(results[0].value.weightKg).toBe(72.5);
  });

  it('marks weigh_in incomplete when no sample', async () => {
    const provider = mockHealthProvider();
    const results = await verifyFromHealth([weighInItem], provider, DATE);
    expect(results[0].completed).toBe(false);
    expect(results[0].value).toEqual({});
  });

  it('ignores non-walking/weigh_in items', async () => {
    const provider = mockHealthProvider();
    const results = await verifyFromHealth([exerciseItem], provider, DATE);
    expect(results).toHaveLength(0);
  });

  it('handles mixed items in one call', async () => {
    const provider = mockHealthProvider({
      steps: [{ date: DATE, value: 10000 }],
      weightKg: [{ date: DATE, value: 80 }],
    });
    const results = await verifyFromHealth(
      [walkingItem, weighInItem, exerciseItem],
      provider,
      DATE,
    );
    expect(results).toHaveLength(2);
    expect(results.find((r) => r.planItemId === 'walk-1')?.completed).toBe(true);
    expect(results.find((r) => r.planItemId === 'weigh-1')?.completed).toBe(true);
  });
});
