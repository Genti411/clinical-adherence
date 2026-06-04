const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const appRoot = __dirname;

const config = getDefaultConfig(appRoot);

// Watch the monorepo root so Metro resolves workspace packages
config.watchFolders = [repoRoot];

// Let Metro find modules in both the app's node_modules and the root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(appRoot, 'node_modules'),
  path.resolve(repoRoot, 'node_modules'),
];

module.exports = config;
