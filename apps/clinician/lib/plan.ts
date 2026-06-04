import { STRETCH_DATASET } from '@clinical/exercise-core';

export type ItemType = 'exercise' | 'walking' | 'swimming' | 'strength' | 'weigh_in' | 'custom';
export interface DraftItem { type: ItemType; exercise_id?: string; target: Record<string, unknown>; }
export interface DraftPlan { title: string; description?: string; duration_days?: number; items: DraftItem[]; }
export interface ExerciseOption { id: string; name: string; area: string; }

export function listExercises(): ExerciseOption[] {
  const out: ExerciseOption[] = [];
  for (const [area, recs] of Object.entries(STRETCH_DATASET)) {
    for (const r of recs as { name: string }[]) out.push({ id: r.name, name: r.name, area });
  }
  return out;
}

export function exerciseItem(name: string, target: Record<string, unknown> = {}): DraftItem {
  return { type: 'exercise', exercise_id: name, target };
}

export function activityItem(type: 'walking' | 'swimming' | 'weigh_in', target: Record<string, unknown>): DraftItem {
  return { type, target };
}

export function validatePlan(p: DraftPlan): string[] {
  const errors: string[] = [];
  if (!p.title || !p.title.trim()) errors.push('Title is required.');
  if (!p.items || p.items.length === 0) errors.push('Add at least one item.');
  (p.items || []).forEach((it, i) => {
    if (it.type === 'exercise' && !it.exercise_id) errors.push(`Item ${i + 1}: choose an exercise.`);
    if (it.type === 'walking' && !(Number(it.target?.stepsPerDay) > 0)) errors.push(`Item ${i + 1}: set steps per day.`);
    if (it.type === 'swimming' && !(Number(it.target?.sessionsPerWeek) > 0)) errors.push(`Item ${i + 1}: set sessions per week.`);
  });
  return errors;
}
