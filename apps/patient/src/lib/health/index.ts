import type { HealthProvider } from './provider';
import { mockHealthProvider } from './mock-provider';

// TODO native: import the real HealthKit/Health Connect provider here and return it
// when the native module is available (requires a dev build + device). See
// docs/health-integration.md for the activation steps.
export function getHealthProvider(): HealthProvider {
  return mockHealthProvider();
}

export type { HealthProvider, HealthSample } from './provider';
export { mockHealthProvider } from './mock-provider';
