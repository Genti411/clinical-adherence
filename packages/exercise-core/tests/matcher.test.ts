import { matchInput } from '../src/matcher';

describe('matchInput', () => {
  it.each([
    ['my neck feels tight after sleeping', 'neck'],
    ['lower back is tight', 'lower back'],
    ['I have a cramp in my calf', 'calf'],
    ['my shoulders are sore', 'shoulders'],
    ['my hamstrings are tight', 'hamstrings'],
    ['can I stretch my chest', 'chest'],
    ['what should I do after leg day soreness', 'post-workout'],
  ])('maps "%s" -> %s', (input, area) => {
    expect(matchInput(input).bodyArea).toBe(area);
  });

  it('prefers a specific body part over post-workout', () => {
    expect(matchInput('my shoulders are sore after working out').bodyArea).toBe('shoulders');
  });

  it('returns null bodyArea when unsure', () => {
    expect(matchInput('I feel weird today').bodyArea).toBeNull();
  });

  it('detects weight intent', () => {
    expect(matchInput('stretch my chest with light dumbbells').wantsWeights).toBe(true);
    expect(matchInput('stretch my chest').wantsWeights).toBe(false);
  });

  it('detects difficulty, defaulting to beginner', () => {
    expect(matchInput('neck stretches').difficulty).toBe('beginner');
    expect(matchInput('advanced neck stretches').difficulty).toBe('advanced');
  });
});
