module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@services': './src/services',
            '@stores': './src/stores',
            '@types': './src/types',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@hooks': './src/hooks',
            '@assets': './assets',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
