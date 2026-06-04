import type { PlanItem } from '@/lib/today';
import type { HealthProvider } from './provider';

export interface VerifiedResult {
  planItemId: string;
  date: string;
  completed: boolean;
  value: Record<string, number>;
}

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
      out.push({
        planItemId: it.id,
        date,
        completed: target > 0 && stepsForDay >= target,
        value: { steps: stepsForDay },
      });
    } else if (it.type === 'weigh_in') {
      out.push({
        planItemId: it.id,
        date,
        completed: weightForDay != null,
        value: weightForDay != null ? { weightKg: weightForDay } : {},
      });
    }
  }
  return out;
}
