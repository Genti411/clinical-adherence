# Health Integration Guide (HealthKit / Health Connect)

The app ships with a mock health provider that keeps everything testable without a device or
native build. To activate real data, follow the steps below.

---

## 1. Install native packages

```bash
# iOS HealthKit
npm install react-native-health

# Android Health Connect
npm install react-native-health-connect
```

These packages require a **native dev build** - they cannot run in Expo Go.

---

## 2. Create the native HealthProvider

Implement the `HealthProvider` interface (`src/lib/health/provider.ts`) for each platform.
A minimal skeleton:

```ts
// src/lib/health/native-provider.ts
import AppleHealthKit from 'react-native-health';
import { Platform } from 'react-native';
import type { HealthProvider, HealthSample } from './provider';

export function nativeHealthProvider(): HealthProvider {
  return {
    isAvailable: async () => Platform.OS === 'ios',
    requestPermissions: () =>
      new Promise((resolve) => {
        AppleHealthKit.initHealthKit(
          { permissions: { read: ['Steps', 'Weight'] } },
          (err) => resolve(!err),
        );
      }),
    getSteps: async (start, end) => {
      // Use AppleHealthKit.getDailyStepCountSamples or
      // HealthConnect readRecords('Steps', ...) and map to HealthSample[]
      return [];
    },
    getWeightKg: async (start, end) => {
      // Use AppleHealthKit.getWeightSamples or
      // HealthConnect readRecords('Weight', ...) and map to HealthSample[]
      return [];
    },
  };
}
```

---

## 3. Plug in to index.ts

Replace the TODO comment in `src/lib/health/index.ts`:

```ts
import { nativeHealthProvider } from './native-provider';
import { Platform } from 'react-native';

export function getHealthProvider(): HealthProvider {
  // TODO native (activated): return the real provider on device builds
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return nativeHealthProvider();
  }
  return mockHealthProvider();
}
```

---

## 4. Config plugins + permissions

**app.json / app.config.js** - add the plugins:

```json
{
  "plugins": [
    ["react-native-health", { "healthSharePermission": "Allow the app to read your health data" }],
    "react-native-health-connect"
  ]
}
```

**iOS** - `Info.plist` entries (handled by the plugin, but verify after prebuild):
- `NSHealthShareUsageDescription` - why you read health data
- `NSHealthUpdateUsageDescription` - only if you write back

**Android** - `AndroidManifest.xml` permissions (handled by the plugin):
- `android.permission.health.READ_STEPS`
- `android.permission.health.READ_WEIGHT`

---

## 5. Build a dev client

```bash
# iOS simulator / device
npx expo run:ios

# Android device
npx expo run:android
```

Expo Go cannot load native modules. A physical device is required to test HealthKit /
Health Connect data. The mock provider keeps the app fully functional and all tests green
until a dev build is available.

---

## Notes

- Background sync is out of scope for this iteration.
- The `syncVerified` function in `src/lib/care.ts` uses `source: 'healthkit'` for all
  health-sourced rows regardless of platform (matches the DB schema convention).
- Swimming, GPS, and heart-rate sensors are deferred to a future sub-project.
