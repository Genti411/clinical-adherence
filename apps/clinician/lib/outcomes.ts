export interface OutcomeRow {
  patient_id: string;
  instrument: string;
  score: number;
  recorded_at: string;
}

/**
 * Returns the most recent outcome row per patient.
 * Input is expected to be ordered by recorded_at descending (most recent first).
 * Pure function - no I/O.
 */
export function latestByPatient(rows: OutcomeRow[]): Record<string, OutcomeRow> {
  const result: Record<string, OutcomeRow> = {};
  for (const row of rows) {
    if (!(row.patient_id in result)) {
      result[row.patient_id] = row;
    }
  }
  return result;
}
