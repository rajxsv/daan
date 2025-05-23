const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.resolver.extraNodeModules = {
    ...(config.resolver.extraNodeModules || {}),
    'react-dom': require.resolve('./react-dom-stub.js'),
  };
  return config;
})();