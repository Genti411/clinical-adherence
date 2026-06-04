import { mockHealthProvider } from '../src/lib/health/mock-provider';
import { getHealthProvider } from '../src/lib/health';
import type { HealthSample } from '../src/lib/health/provider';

describe('mockHealthProvider', () => {
  it('isAvailable returns true', async () => {
    const p = mockHealthProvider();
    expect(await p.isAvailable()).toBe(true);
  });

  it('requestPermissions returns true', async () => {
    const p = mockHealthProvider();
    expect(await p.requestPermissions()).toBe(true);
  });

  it('getSteps returns seeded samples', async () => {
    const steps: HealthSample[] = [{ date: '2026-06-04', value: 8000 }];
    const p = mockHealthProvider({ steps });
    const result = await p.getSteps('2026-06-04', '2026-06-04');
    expect(result).toEqual(steps);
  });

  it('getWeightKg returns seeded samples', async () => {
    const weightKg: HealthSample[] = [{ date: '2026-06-04', value: 72.5 }];
    const p = mockHealthProvider({ weightKg });
    const result = await p.getWeightKg('2026-06-04', '2026-06-04');
    expect(result).toEqual(weightKg);
  });

  it('returns empty arrays when no data seeded', async () => {
    const p = mockHealthProvider();
    expect(await p.getSteps('2026-06-04', '2026-06-04')).toEqual([]);
    expect(await p.getWeightKg('2026-06-04', '2026-06-04')).toEqual([]);
  });
});

describe('getHealthProvider', () => {
  it('returns an object implementing HealthProvider', async () => {
    const p = getHealthProvider();
    expect(typeof p.isAvailable).toBe('function');
    expect(typeof p.requestPermissions).toBe('function');
    expect(typeof p.getSteps).toBe('function');
    expect(typeof p.getWeightKg).toBe('function');
    expect(await p.isAvailable()).toBe(true);
  });
});
