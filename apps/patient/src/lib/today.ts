import { STRETCH_DATASET } from '@clinical/exercise-core';

export interface PlanItem { id: string; type: string; exercise_id: string | null; target: Record<string, any>; position: number; }
export interface AdherenceLog { plan_item_id: string; completed: boolean; }
export interface ChecklistEntry { itemId: string; title: string; detail: string; completed: boolean; }

function lookupExercise(id: string | null): { name: string; detail: string } | null {
  if (!id) return null;
  for (const recs of Object.values(STRETCH_DATASET)) {
    for (const r of recs as { name: string; instructions: string[] }[]) {
      if (r.name === id) return { name: r.name, detail: (r.instructions || []).join(' ') };
    }
  }
  return null;
}

function fmtTarget(t: Record<string, any> = {}): string {
  const p: string[] = [];
  if (t.sets) p.push(`${t.sets} sets`);
  if (t.reps) p.push(`${t.reps} reps`);
  if (t.duration) p.push(String(t.duration));
  if (t.frequencyPerWeek) p.push(`${t.frequencyPerWeek}x/week`);
  if (t.stepsPerDay) p.push(`${t.stepsPerDay} steps/day`);
  if (t.sessionsPerWeek) p.push(`${t.sessionsPerWeek} sessions/week`);
  return p.join(' · ');
}

export function buildChecklist(items: PlanItem[], logs: AdherenceLog[]): ChecklistEntry[] {
  const done = new Set(logs.filter((l) => l.completed).map((l) => l.plan_item_id));
  return [...items]
    .sort((a, b) => a.position - b.position)
    .map((it) => {
      let title = 'Activity';
      if (it.type === 'exercise') title = lookupExercise(it.exercise_id)?.name ?? 'Exercise';
      else if (it.type === 'walking') title = 'Walking';
      else if (it.type === 'swimming') title = 'Swimming';
      else if (it.type === 'weigh_in') title = 'Weigh-in';
      else if (it.type === 'strength') title = 'Strength';
      const detail = fmtTarget(it.target) || (it.type === 'exercise' ? lookupExercise(it.exercise_id)?.detail ?? '' : '');
      return { itemId: it.id, title, detail, completed: done.has(it.id) };
    });
}

export function adherencePercent(entries: ChecklistEntry[]): number {
  if (entries.length === 0) return 0;
  return Math.round((100 * entries.filter((e) => e.completed).length) / entries.length);
}
