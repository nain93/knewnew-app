module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  env: {
    production: {
      plugins: ["transform-remove-console"],     //removing consoles.log from app during release (production) versions
    },
  },
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          '~': './src',
          '@components': './src/components',
          '@navigators': './src/navigators',
          '@api': './src/api',
          '@screens': './src/screens',
          '@assets': './src/assets',
          '@styles': './src/styles',
          '@types': './src/types',
          '@utils': './src/utils'
        },
      },
    ],
  ],
};
