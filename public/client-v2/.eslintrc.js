module.exports = {
  extends: [
    'airbnb',
    'plugin:prettier/recommended',
    'plugin:flowtype/recommended'
  ],
  plugins: ['prettier', 'flowtype'],
  env: {
    es6: true,
    browser: true
  },
  rules: {
    'prettier/prettier': 'error',

    // Allow React in .js files
    'react/jsx-filename-extension': false,

    // Keeps module exports in one place for easier reading
    'import/exports-last': 'error',

    // Don't shout out about missing extension we can import Components/index.js
    // as 'Component'
    'import/extensions': 0,

    // Need this to stop eslint moaning when we don't add a flow comment as
    // we're flowing everything by default
    'flowtype/no-types-missing-file-annotation': 0
  },
  overrides: [
    {
      files: ['**/*.spec.js'],
      env: { jest: true }
    }
  ]
};
