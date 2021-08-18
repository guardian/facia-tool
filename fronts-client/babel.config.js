module.exports = {
  presets: [
    [
      '@babel/env',
      {
        corejs: '3.16',
        useBuiltIns: 'usage',
        targets: {
          browsers: ['chrome >= 49', 'firefox >= 48', 'safari >= 10'],
        },
      },
    ],
    '@babel/react',
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    'transform-class-properties',
  ],
};
