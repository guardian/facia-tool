module.exports = {
  presets: [
    [
      '@babel/env',
      {
        useBuiltIns: 'usage',
        targets: {
          browsers: ['chrome >= 49', 'firefox >= 48', 'safari >= 10']
        }
      }
    ],
    '@babel/react',
    '@babel/flow'
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    'transform-class-properties',
    'babel-plugin-styled-components'
  ]
};
