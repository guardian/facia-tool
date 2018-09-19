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
    "no-unused-expressions": [2, {"allowTaggedTemplates": true}],

    'prettier/prettier': 'error',

    // Allow React in .js files
    'react/jsx-filename-extension': false,

    // Let flow handle this
    'react/require-default-props': false,

    // Keeps module exports in one place for easier reading
    'import/exports-last': 'error',

    // Allows libs that may grow to export one function
    'import/prefer-default-export': 0,

    // Don't shout out about missing extension we can import Components/index.js
    // as 'Component'
    'import/extensions': 0,

    // Need this to stop eslint moaning when we don't add a flow comment as
    // we're flowing everything by default
    'flowtype/no-types-missing-file-annotation': 0,

    // this clashes with prettier's line breaking rules
    'flowtype/space-after-type-colon': 0,

    // let prettier handle this
    'flowtype/generic-spacing': 0,

    // We need to denote "to" as a specialLink to avoid href attribute is required on an
    // anchor errors
    "jsx-a11y/anchor-is-valid": [ "error", {
      "components": [ "Link" ],
      "specialLink": [ "to"]
    }]
  },
  overrides: [
    {
      files: ['**/*.spec.js'],
      env: { jest: true }
    }
  ],
  settings: {
    "import/resolver": {
      webpack: {
        config: "config/webpack.config.common.js"
      }
    }
  }
};
