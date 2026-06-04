import { listExercises, exerciseItem, activityItem, validatePlan } from './plan';

describe('listExercises', () => {
  it('returns 39 options', () => {
    const exercises = listExercises();
    expect(exercises).toHaveLength(39);
  });

  it('each option has id, name, and area', () => {
    const exercises = listExercises();
    for (const ex of exercises) {
      expect(typeof ex.id).toBe('string');
      expect(ex.id.length).toBeGreaterThan(0);
      expect(typeof ex.name).toBe('string');
      expect(ex.name.length).toBeGreaterThan(0);
      expect(typeof ex.area).toBe('string');
      expect(ex.area.length).toBeGreaterThan(0);
    }
  });
});

describe('exerciseItem', () => {
  it('returns an exercise DraftItem with exercise_id set', () => {
    const item = exerciseItem('Chin Tucks');
    expect(item.type).toBe('exercise');
    expect(item.exercise_id).toBe('Chin Tucks');
    expect(item.target).toEqual({});
  });

  it('passes target through', () => {
    const item = exerciseItem('Chin Tucks', { sets: 3 });
    expect(item.target).toEqual({ sets: 3 });
  });
});

describe('activityItem', () => {
  it('builds a walking item', () => {
    const item = activityItem('walking', { stepsPerDay: 5000 });
    expect(item.type).toBe('walking');
    expect(item.target).toEqual({ stepsPerDay: 5000 });
    expect(item.exercise_id).toBeUndefined();
  });

  it('builds a swimming item', () => {
    const item = activityItem('swimming', { sessionsPerWeek: 3 });
    expect(item.type).toBe('swimming');
    expect(item.target).toEqual({ sessionsPerWeek: 3 });
  });

  it('builds a weigh_in item', () => {
    const item = activityItem('weigh_in', { frequency: 'daily' });
    expect(item.type).toBe('weigh_in');
    expect(item.target).toEqual({ frequency: 'daily' });
  });
});

describe('validatePlan', () => {
  it('flags empty title', () => {
    const errors = validatePlan({ title: '', items: [exerciseItem('Chin Tucks')] });
    expect(errors).toContain('Title is required.');
  });

  it('flags whitespace-only title', () => {
    const errors = validatePlan({ title: '   ', items: [exerciseItem('Chin Tucks')] });
    expect(errors).toContain('Title is required.');
  });

  it('flags no items', () => {
    const errors = validatePlan({ title: 'My Plan', items: [] });
    expect(errors).toContain('Add at least one item.');
  });

  it('flags exercise item with no exercise_id', () => {
    const errors = validatePlan({ title: 'My Plan', items: [{ type: 'exercise', target: {} }] });
    expect(errors).toContain('Item 1: choose an exercise.');
  });

  it('flags walking item with no stepsPerDay', () => {
    const errors = validatePlan({ title: 'My Plan', items: [activityItem('walking', {})] });
    expect(errors).toContain('Item 1: set steps per day.');
  });

  it('flags walking item with zero steps', () => {
    const errors = validatePlan({ title: 'My Plan', items: [activityItem('walking', { stepsPerDay: 0 })] });
    expect(errors).toContain('Item 1: set steps per day.');
  });

  it('flags swimming item with no sessionsPerWeek', () => {
    const errors = validatePlan({ title: 'My Plan', items: [activityItem('swimming', {})] });
    expect(errors).toContain('Item 1: set sessions per week.');
  });

  it('returns empty array for a valid exercise plan', () => {
    const errors = validatePlan({ title: 'Recovery Plan', items: [exerciseItem('Chin Tucks')] });
    expect(errors).toEqual([]);
  });

  it('returns empty array for a valid walking plan', () => {
    const errors = validatePlan({ title: 'Walk Plan', items: [activityItem('walking', { stepsPerDay: 5000 })] });
    expect(errors).toEqual([]);
  });

  it('returns empty array for a valid swimming plan', () => {
    const errors = validatePlan({ title: 'Swim Plan', items: [activityItem('swimming', { sessionsPerWeek: 2 })] });
    expect(errors).toEqual([]);
  });
});
