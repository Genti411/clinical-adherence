module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.ws.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-native-url-polyfill|react-native-reanimated|@supabase/.*))',
  ],
  moduleNameMapper: {
    '@react-native-async-storage/async-storage':
      '@react-native-async-storage/async-storage/jest/async-storage-mock',
    '^react-native-reanimated$':
      '<rootDir>/node_modules/react-native-reanimated/mock',
    '^@clinical/exercise-core$':
      '<rootDir>/../../packages/exercise-core/src/index.ts',
  },
};
