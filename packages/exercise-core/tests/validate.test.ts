import { sanitize, validateResponse } from '../src/validate';
import { StretchResponse } from '../src/types';

const good: StretchResponse = {
  disclaimer: 'd', risk_level: 'low', body_area: 'neck', summary: 's', seek_medical_help_if: ['x'],
  recommendations: [
    { name: 'Chin Tucks', type: 'mobility', target_muscles: ['neck'], instructions: ['a'], sets: 2, reps: 10,
      duration: '5s', equipment: 'none', weighted: false, difficulty: 'beginner', safety_notes: ['stop if it hurts'], media_prompt: 'p' },
  ],
};

describe('validateResponse', () => {
  it('accepts a well-formed response', () => { expect(validateResponse(good)).toBe(true); });
  it.each([
    null, {}, { ...good, risk_level: 'extreme' }, { ...good, recommendations: 'nope' }, { ...good, recommendations: [{ name: 'x' }] },
  ])('rejects malformed payload %#', (bad) => { expect(validateResponse(bad)).toBe(false); });
});

describe('sanitize', () => {
  it('strips weighted recommendations when risk is medium', () => {
    const withWeight: StretchResponse = { ...good, risk_level: 'medium',
      recommendations: [good.recommendations[0], { ...good.recommendations[0], name: 'Weighted', weighted: true }] };
    const out = sanitize(withWeight, 'medium');
    expect(out.recommendations.every((r) => !r.weighted)).toBe(true);
    expect(out.risk_level).toBe('medium');
  });
});
