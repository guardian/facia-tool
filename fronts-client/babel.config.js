module.exports = {
  presets: [
    [
      '@babel/env',
      {
        useBuiltIns: 'usage',
        corejs: '2.x',
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
