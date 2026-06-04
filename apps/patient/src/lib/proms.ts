export interface PromQuestion { id: string; text: string; min: number; max: number; invert?: boolean; }
export interface PromInstrument { id: string; name: string; cadenceDays: number; questions: PromQuestion[]; scoreLabel: string; }

// Original, non-proprietary check-in. (To use a validated instrument, license it and
// add it here - see docs.)
export const DAILY_FUNCTION: PromInstrument = {
  id: 'daily-function-v1',
  name: 'Function & Comfort check-in',
  cadenceDays: 7,
  scoreLabel: 'Composite 0-100 (higher = better)',
  questions: [
    { id: 'pain', text: 'Your pain today (0 none - 10 worst)', min: 0, max: 10, invert: true },
    { id: 'stiffness', text: 'Your stiffness today (0 none - 10 worst)', min: 0, max: 10, invert: true },
    { id: 'function', text: 'Doing daily activities today (0 not at all - 10 fully)', min: 0, max: 10 },
  ],
};

export function validateAnswers(inst: PromInstrument, answers: Record<string, number>): string[] {
  const errs: string[] = [];
  for (const q of inst.questions) {
    const v = answers[q.id];
    if (v == null || Number.isNaN(v)) errs.push(`Answer "${q.text}".`);
    else if (v < q.min || v > q.max) errs.push(`"${q.text}" must be ${q.min}-${q.max}.`);
  }
  return errs;
}

// Each question normalized to 0-100 (inverted ones flipped), then averaged.
export function scoreProm(inst: PromInstrument, answers: Record<string, number>): number {
  const vals = inst.questions.map((q) => {
    const raw = answers[q.id];
    const norm = ((raw - q.min) / (q.max - q.min)) * 100;
    return q.invert ? 100 - norm : norm;
  });
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}
