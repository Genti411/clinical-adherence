// Polyfill WebSocket for Node so @supabase/supabase-js can construct its realtime client in tests.
globalThis.WebSocket = require('ws');

// Reanimated ships a Jest mock so animated components render without the native runtime.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
