export interface HealthSample {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface HealthProvider {
  isAvailable(): Promise<boolean>;
  requestPermissions(): Promise<boolean>;
  getSteps(start: string, end: string): Promise<HealthSample[]>;    // steps per day
  getWeightKg(start: string, end: string): Promise<HealthSample[]>; // most recent per day
}
