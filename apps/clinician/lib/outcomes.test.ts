import { latestByPatient, type OutcomeRow } from './outcomes';

describe('latestByPatient', () => {
  it('returns empty object for empty input', () => {
    expect(latestByPatient([])).toEqual({});
  });

  it('returns single row for single patient', () => {
    const rows: OutcomeRow[] = [
      { patient_id: 'p1', instrument: 'daily-function-v1', score: 80, recorded_at: '2026-06-01T10:00:00Z' },
    ];
    const result = latestByPatient(rows);
    expect(result['p1']).toEqual(rows[0]);
  });

  it('returns the most recent (first in array) row per patient', () => {
    // Rows are ordered most-recent first (as returned by the DB query)
    const rows: OutcomeRow[] = [
      { patient_id: 'p1', instrument: 'daily-function-v1', score: 90, recorded_at: '2026-06-04T10:00:00Z' },
      { patient_id: 'p1', instrument: 'daily-function-v1', score: 70, recorded_at: '2026-05-28T10:00:00Z' },
    ];
    const result = latestByPatient(rows);
    expect(result['p1'].score).toBe(90);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('handles multiple patients independently', () => {
    const rows: OutcomeRow[] = [
      { patient_id: 'p1', instrument: 'daily-function-v1', score: 75, recorded_at: '2026-06-04T10:00:00Z' },
      { patient_id: 'p2', instrument: 'daily-function-v1', score: 60, recorded_at: '2026-06-04T09:00:00Z' },
      { patient_id: 'p1', instrument: 'daily-function-v1', score: 50, recorded_at: '2026-05-28T10:00:00Z' },
    ];
    const result = latestByPatient(rows);
    expect(result['p1'].score).toBe(75);
    expect(result['p2'].score).toBe(60);
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('does not overwrite the first (most recent) row for a patient', () => {
    const rows: OutcomeRow[] = [
      { patient_id: 'p1', instrument: 'daily-function-v1', score: 100, recorded_at: '2026-06-05T00:00:00Z' },
      { patient_id: 'p1', instrument: 'daily-function-v1', score: 40,  recorded_at: '2026-06-01T00:00:00Z' },
      { patient_id: 'p1', instrument: 'daily-function-v1', score: 20,  recorded_at: '2026-05-01T00:00:00Z' },
    ];
    const result = latestByPatient(rows);
    expect(result['p1'].score).toBe(100);
  });
});
