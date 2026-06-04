import { getStretchResponse } from '../src/engine';

describe('getStretchResponse', () => {
  it('returns a high-risk safety response for high-risk input', async () => {
    const res = await getStretchResponse('I have chest pain and numbness');
    expect(res.risk_level).toBe('high');
    expect(res.recommendations).toHaveLength(0);
  });
  it('answers a known body area locally', async () => {
    const res = await getStretchResponse('my neck is tight');
    expect(res.body_area).toBe('neck');
    expect(res.recommendations.length).toBeGreaterThan(0);
  });
  it('returns local fallback when the input is not recognized', async () => {
    const res = await getStretchResponse('something feels off all over');
    expect(res.recommendations).toHaveLength(0);
    expect(res.summary.toLowerCase()).toContain('try');
  });
  it('does not return weighted items when risk is medium even if requested', async () => {
    const res = await getStretchResponse('my chest hurts when lifting, can I use dumbbells');
    expect(res.risk_level).toBe('medium');
    expect(res.recommendations.every((r) => !r.weighted)).toBe(true);
  });
});
