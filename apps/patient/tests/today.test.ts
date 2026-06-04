import { buildChecklist, adherencePercent, PlanItem, AdherenceLog } from '../src/lib/today';

const exerciseItem: PlanItem = {
  id: 'item-1',
  type: 'exercise',
  exercise_id: 'Chin Tucks',
  target: {},
  position: 2,
};

const walkingItem: PlanItem = {
  id: 'item-2',
  type: 'walking',
  exercise_id: null,
  target: { stepsPerDay: 5000 },
  position: 1,
};

const weighInItem: PlanItem = {
  id: 'item-3',
  type: 'weigh_in',
  exercise_id: null,
  target: { frequencyPerWeek: 3 },
  position: 3,
};

const swimmingItem: PlanItem = {
  id: 'item-4',
  type: 'swimming',
  exercise_id: null,
  target: { sessionsPerWeek: 2 },
  position: 4,
};

describe('buildChecklist', () => {
  it('maps an exercise item to its library name and detail', () => {
    const checklist = buildChecklist([exerciseItem], []);
    expect(checklist[0].title).toBe('Chin Tucks');
    // detail from instructions joined
    expect(checklist[0].detail).toContain('Sit or stand tall');
    expect(checklist[0].completed).toBe(false);
  });

  it('sets walking title and formats stepsPerDay target', () => {
    const checklist = buildChecklist([walkingItem], []);
    expect(checklist[0].title).toBe('Walking');
    expect(checklist[0].detail).toContain('5000 steps/day');
  });

  it('sets weigh-in title and formats frequencyPerWeek', () => {
    const checklist = buildChecklist([weighInItem], []);
    expect(checklist[0].title).toBe('Weigh-in');
    expect(checklist[0].detail).toContain('3x/week');
  });

  it('sets swimming title and formats sessionsPerWeek', () => {
    const checklist = buildChecklist([swimmingItem], []);
    expect(checklist[0].title).toBe('Swimming');
    expect(checklist[0].detail).toContain('2 sessions/week');
  });

  it('marks items completed from logs', () => {
    const logs: AdherenceLog[] = [{ plan_item_id: 'item-1', completed: true }];
    const checklist = buildChecklist([exerciseItem, walkingItem], logs);
    const ex = checklist.find((e) => e.itemId === 'item-1')!;
    const wk = checklist.find((e) => e.itemId === 'item-2')!;
    expect(ex.completed).toBe(true);
    expect(wk.completed).toBe(false);
  });

  it('does not mark item done when log has completed=false', () => {
    const logs: AdherenceLog[] = [{ plan_item_id: 'item-1', completed: false }];
    const checklist = buildChecklist([exerciseItem], logs);
    expect(checklist[0].completed).toBe(false);
  });

  it('sorts items by position', () => {
    const checklist = buildChecklist([exerciseItem, walkingItem], []);
    // walkingItem has position 1, exerciseItem has position 2
    expect(checklist[0].itemId).toBe('item-2');
    expect(checklist[1].itemId).toBe('item-1');
  });

  it('formats sets and reps in detail', () => {
    const item: PlanItem = {
      id: 'item-5',
      type: 'strength',
      exercise_id: null,
      target: { sets: 3, reps: 12 },
      position: 0,
    };
    const checklist = buildChecklist([item], []);
    expect(checklist[0].title).toBe('Strength');
    expect(checklist[0].detail).toContain('3 sets');
    expect(checklist[0].detail).toContain('12 reps');
  });
});

describe('adherencePercent', () => {
  it('returns 0 for empty list', () => {
    expect(adherencePercent([])).toBe(0);
  });

  it('returns 100 when all completed', () => {
    const entries = [
      { itemId: '1', title: 'A', detail: '', completed: true },
      { itemId: '2', title: 'B', detail: '', completed: true },
    ];
    expect(adherencePercent(entries)).toBe(100);
  });

  it('returns 50 for 1 of 2 completed', () => {
    const entries = [
      { itemId: '1', title: 'A', detail: '', completed: true },
      { itemId: '2', title: 'B', detail: '', completed: false },
    ];
    expect(adherencePercent(entries)).toBe(50);
  });

  it('returns 0 when none completed', () => {
    const entries = [
      { itemId: '1', title: 'A', detail: '', completed: false },
    ];
    expect(adherencePercent(entries)).toBe(0);
  });
});
