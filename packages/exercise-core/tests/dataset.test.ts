import { buildResponse, STRETCH_DATASET } from '../src/dataset';

describe('dataset', () => {
  it('has entries for all eleven areas', () => {
    expect(Object.keys(STRETCH_DATASET).sort()).toEqual(
      ['ankles', 'calf', 'chest', 'hamstrings', 'hips', 'lower back', 'neck', 'post-workout', 'shoulders', 'upper back', 'wrists'].sort(),
    );
  });

  it('every recommendation has the required fields', () => {
    for (const recs of Object.values(STRETCH_DATASET)) {
      expect(recs.length).toBeGreaterThanOrEqual(3);
      for (const r of recs) {
        expect(r.name).toBeTruthy();
        expect(r.instructions.length).toBeGreaterThan(0);
        expect(r.safety_notes.length).toBeGreaterThan(0);
        expect(r.media_prompt).toBeTruthy();
      }
    }
  });

  it('builds a low-risk response with beginner items by default', () => {
    const res = buildResponse('neck', { wantsWeights: false, difficulty: 'beginner', riskLevel: 'low' });
    expect(res.body_area).toBe('neck');
    expect(res.risk_level).toBe('low');
    expect(res.recommendations.length).toBeGreaterThan(0);
    expect(res.recommendations.every((r) => r.difficulty === 'beginner')).toBe(true);
  });

  it('excludes weighted items unless weights are requested at low risk', () => {
    const noWeights = buildResponse('chest', { wantsWeights: false, difficulty: 'advanced', riskLevel: 'low' });
    expect(noWeights.recommendations.every((r) => !r.weighted)).toBe(true);

    const withWeights = buildResponse('chest', { wantsWeights: true, difficulty: 'advanced', riskLevel: 'low' });
    expect(withWeights.recommendations.some((r) => r.weighted)).toBe(true);
  });

  it('never returns weighted items at medium risk even if requested', () => {
    const res = buildResponse('chest', { wantsWeights: true, difficulty: 'advanced', riskLevel: 'medium' });
    expect(res.recommendations.every((r) => !r.weighted)).toBe(true);
    expect(res.summary.toLowerCase()).toContain('professional');
  });

  it('higher difficulty includes lower-difficulty items', () => {
    const beginner = buildResponse('neck', { wantsWeights: false, difficulty: 'beginner', riskLevel: 'low' });
    const advanced = buildResponse('neck', { wantsWeights: false, difficulty: 'advanced', riskLevel: 'low' });
    expect(advanced.recommendations.length).toBeGreaterThanOrEqual(beginner.recommendations.length);
  });
});
