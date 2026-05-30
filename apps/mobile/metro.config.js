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

// Force React to always resolve from the app's node_modules (deduplicate)
// Prevents "multiple copies of React" caused by root node_modules having a different version
const reactPath = path.resolve(projectRoot, 'node_modules/react');
const reactDomPath = path.resolve(projectRoot, 'node_modules/react-dom');
const reactNativePath = path.resolve(projectRoot, 'node_modules/react-native');

config.resolver.extraNodeModules = {
  'react': reactPath,
  'react-dom': reactDomPath,
  'react-native': reactNativePath,
};

const originalResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react') return { filePath: require.resolve(reactPath), type: 'sourceFile' };
  if (moduleName === 'react-dom') return { filePath: require.resolve(reactDomPath), type: 'sourceFile' };
  if (moduleName === 'react/jsx-runtime') return { filePath: require.resolve(path.resolve(reactPath, 'jsx-runtime')), type: 'sourceFile' };
  if (moduleName === 'react/jsx-dev-runtime') return { filePath: require.resolve(path.resolve(reactPath, 'jsx-dev-runtime')), type: 'sourceFile' };
  if (originalResolver) return originalResolver(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
