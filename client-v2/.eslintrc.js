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
    'prettier/prettier': 'warn',

    // Allow React in .js files
    'react/jsx-filename-extension': false,

    // Keeps module exports in one place for easier reading
    'import/exports-last': 'warn',
    'import/extensions': false
  }
};
