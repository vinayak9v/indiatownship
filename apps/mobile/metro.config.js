const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the monorepo root so Metro sees packages/types
// Merge with existing watchFolders (Expo sets defaults)
config.watchFolders = [...(config.watchFolders || []), workspaceRoot];

// Look for node_modules in both app dir and workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
