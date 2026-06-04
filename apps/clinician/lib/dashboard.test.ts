import { adherenceStats, addDays, LogRow } from './dashboard';

const TODAY = '2024-01-15';

describe('addDays', () => {
  it('adds positive days', () => {
    expect(addDays('2024-01-15', 7)).toBe('2024-01-22');
  });

  it('subtracts days with negative value', () => {
    expect(addDays('2024-01-15', -7)).toBe('2024-01-08');
  });

  it('handles month boundary', () => {
    expect(addDays('2024-01-31', 1)).toBe('2024-02-01');
  });

  it('handles year boundary', () => {
    expect(addDays('2023-12-31', 1)).toBe('2024-01-01');
  });

  it('adds zero days', () => {
    expect(addDays('2024-01-15', 0)).toBe('2024-01-15');
  });
});

describe('adherenceStats', () => {
  it('returns pct 0 and flagged true for empty logs', () => {
    const result = adherenceStats([], TODAY);
    expect(result.totalLogged).toBe(0);
    expect(result.completed).toBe(0);
    expect(result.pct).toBe(0);
    expect(result.lastActive).toBeNull();
    expect(result.flagged).toBe(true);
  });

  it('returns pct 100 and not flagged when all completed recently', () => {
    const logs: LogRow[] = [
      { plan_item_id: 'a', date: '2024-01-13', completed: true },
      { plan_item_id: 'b', date: '2024-01-14', completed: true },
    ];
    const result = adherenceStats(logs, TODAY);
    expect(result.pct).toBe(100);
    expect(result.lastActive).toBe('2024-01-14');
    expect(result.flagged).toBe(false);
  });

  it('pct 50 boundary: 50% is NOT flagged by pct alone', () => {
    const logs: LogRow[] = [
      { plan_item_id: 'a', date: '2024-01-14', completed: true },
      { plan_item_id: 'b', date: '2024-01-14', completed: false },
    ];
    // pct=50, lastActive=2024-01-14 which is within window -> not flagged
    const result = adherenceStats(logs, TODAY);
    expect(result.pct).toBe(50);
    expect(result.flagged).toBe(false);
  });

  it('flags when pct < 50', () => {
    const logs: LogRow[] = [
      { plan_item_id: 'a', date: '2024-01-14', completed: true },
      { plan_item_id: 'b', date: '2024-01-14', completed: false },
      { plan_item_id: 'c', date: '2024-01-14', completed: false },
    ];
    const result = adherenceStats(logs, TODAY);
    expect(result.pct).toBe(33);
    expect(result.flagged).toBe(true);
  });

  it('flags when lastActive is stale (older than window)', () => {
    // today = 2024-01-15, window = 7 days, cutoff = 2024-01-08
    // lastActive = 2024-01-07 -> stale
    const logs: LogRow[] = [
      { plan_item_id: 'a', date: '2024-01-07', completed: true },
      { plan_item_id: 'b', date: '2024-01-07', completed: true },
    ];
    const result = adherenceStats(logs, TODAY, 7);
    expect(result.pct).toBe(100);
    expect(result.lastActive).toBe('2024-01-07');
    expect(result.flagged).toBe(true);
  });

  it('not flagged when lastActive is exactly at cutoff', () => {
    // cutoff = 2024-01-08; lastActive = 2024-01-08 -> activeRecently (>= cutoff)
    const logs: LogRow[] = [
      { plan_item_id: 'a', date: '2024-01-08', completed: true },
    ];
    const result = adherenceStats(logs, TODAY, 7);
    expect(result.flagged).toBe(false);
  });

  it('uses lastActive from latest completed date only', () => {
    const logs: LogRow[] = [
      { plan_item_id: 'a', date: '2024-01-14', completed: false },
      { plan_item_id: 'b', date: '2024-01-10', completed: true },
      { plan_item_id: 'c', date: '2024-01-12', completed: true },
    ];
    const result = adherenceStats(logs, TODAY);
    expect(result.lastActive).toBe('2024-01-12');
  });

  it('respects custom windowDays', () => {
    // window=1: cutoff = 2024-01-14; lastActive=2024-01-13 -> stale
    const logs: LogRow[] = [
      { plan_item_id: 'a', date: '2024-01-13', completed: true },
    ];
    const result = adherenceStats(logs, TODAY, 1);
    expect(result.flagged).toBe(true);
  });
});
