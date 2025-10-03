const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add platform-specific resolver for react-native-maps
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.alias = {
  'react-native-maps': require.resolve('react-native-maps/lib/index.js'),
};

// Platform-specific extensions
config.resolver.sourceExts.push('web.js', 'web.ts', 'web.tsx');

module.exports = config;