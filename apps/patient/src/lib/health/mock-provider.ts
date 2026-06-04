import type { HealthProvider, HealthSample } from './provider';

export interface MockHealthData {
  steps?: HealthSample[];
  weightKg?: HealthSample[];
}

export function mockHealthProvider(data: MockHealthData = {}): HealthProvider {
  const steps = data.steps ?? [];
  const weightKg = data.weightKg ?? [];

  return {
    isAvailable: async () => true,
    requestPermissions: async () => true,
    getSteps: async (_start: string, _end: string) => steps,
    getWeightKg: async (_start: string, _end: string) => weightKg,
  };
}
