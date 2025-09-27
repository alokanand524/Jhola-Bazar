const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable fast refresh
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Clear cache on restart
config.resetCache = true;

module.exports = config;