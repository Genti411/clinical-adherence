export interface LogRow { plan_item_id: string; date: string; completed: boolean; }

export interface AdherenceStats { totalLogged: number; completed: number; pct: number; lastActive: string | null; flagged: boolean; }

// pct = completed / totalLogged (0 when none). lastActive = latest date with a completed log.
// flagged = pct < 50, OR no completed activity within the last `windowDays` (default 7) before `today`.
export function adherenceStats(logs: LogRow[], today: string, windowDays = 7): AdherenceStats {
  const total = logs.length;
  const completed = logs.filter((l) => l.completed).length;
  const pct = total === 0 ? 0 : Math.round((100 * completed) / total);
  const completedDates = logs.filter((l) => l.completed).map((l) => l.date).sort();
  const lastActive = completedDates.length ? completedDates[completedDates.length - 1] : null;
  const cutoff = addDays(today, -windowDays);
  const activeRecently = lastActive != null && lastActive >= cutoff;
  const flagged = total === 0 || pct < 50 || !activeRecently;
  return { totalLogged: total, completed, pct, lastActive, flagged };
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
