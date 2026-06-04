import { DAILY_FUNCTION, validateAnswers, scoreProm } from '../src/lib/proms';

describe('validateAnswers', () => {
  it('returns no errors for valid answers', () => {
    const errs = validateAnswers(DAILY_FUNCTION, { pain: 5, stiffness: 3, function: 7 });
    expect(errs).toEqual([]);
  });

  it('flags missing answer', () => {
    const errs = validateAnswers(DAILY_FUNCTION, { pain: 5, stiffness: 3 } as Record<string, number>);
    expect(errs).toHaveLength(1);
    expect(errs[0]).toContain('Doing daily activities');
  });

  it('flags out-of-range (above max)', () => {
    const errs = validateAnswers(DAILY_FUNCTION, { pain: 11, stiffness: 3, function: 7 });
    expect(errs).toHaveLength(1);
    expect(errs[0]).toContain('0-10');
  });

  it('flags out-of-range (below min)', () => {
    const errs = validateAnswers(DAILY_FUNCTION, { pain: -1, stiffness: 3, function: 7 });
    expect(errs).toHaveLength(1);
    expect(errs[0]).toContain('0-10');
  });

  it('flags multiple missing/out-of-range answers', () => {
    const errs = validateAnswers(DAILY_FUNCTION, { pain: 11 } as Record<string, number>);
    expect(errs).toHaveLength(3);
  });

  it('flags NaN value', () => {
    const errs = validateAnswers(DAILY_FUNCTION, { pain: NaN, stiffness: 3, function: 7 });
    expect(errs).toHaveLength(1);
  });
});

describe('scoreProm', () => {
  it('returns 100 when all answers are best (pain=0, stiffness=0, function=10)', () => {
    const score = scoreProm(DAILY_FUNCTION, { pain: 0, stiffness: 0, function: 10 });
    expect(score).toBe(100);
  });

  it('returns 0 when all answers are worst (pain=10, stiffness=10, function=0)', () => {
    const score = scoreProm(DAILY_FUNCTION, { pain: 10, stiffness: 10, function: 0 });
    expect(score).toBe(0);
  });

  it('computes a mixed case correctly', () => {
    // pain=5 -> inverted -> 50; stiffness=0 -> inverted -> 100; function=5 -> 50
    // average = (50 + 100 + 50) / 3 = 66.666... -> rounds to 67
    const score = scoreProm(DAILY_FUNCTION, { pain: 5, stiffness: 0, function: 5 });
    expect(score).toBe(67);
  });

  it('applies inversion to pain question', () => {
    // Only pain differs: pain=10 (worst, inverted = 0), stiffness=0 (inverted=100), function=10 (100)
    // average = (0 + 100 + 100) / 3 = 66.666 -> 67
    const score = scoreProm(DAILY_FUNCTION, { pain: 10, stiffness: 0, function: 10 });
    expect(score).toBe(67);
  });

  it('applies inversion to stiffness question', () => {
    // pain=0 (inverted=100), stiffness=10 (inverted=0), function=10 (100)
    // average = (100 + 0 + 100) / 3 = 66.666 -> 67
    const score = scoreProm(DAILY_FUNCTION, { pain: 0, stiffness: 10, function: 10 });
    expect(score).toBe(67);
  });

  it('function question is not inverted', () => {
    // pain=0 (100), stiffness=0 (100), function=0 (not inverted -> 0)
    // average = (100 + 100 + 0) / 3 = 66.666 -> 67
    const score = scoreProm(DAILY_FUNCTION, { pain: 0, stiffness: 0, function: 0 });
    expect(score).toBe(67);
  });
});
